const Groq = require('groq');
const { pool } = require('../config/database');

exports.streamAI = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({error: 'Messages array requerido'});
    }
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({error: 'Servicio de IA no configurado. Configure GROQ_API_KEY en variables de entorno.'});
    }
    
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    const systemPrompt = `Eres un asistente médico especializado en pediatría y neonatología. Tu objetivo es proporcionar información médica clara, basada en evidencia y útil para profesionales de la salud.

INSTRUCCIONES CLAVE:
- Para DOSIS: proporciona rangos específicos con peso del paciente o rango de edad, vía de administración y frecuencia
- Para MEDICAMENTOS: incluye presentación, dosis pediátrica, contraindicaciones importantes
- Responde en español, claro y profesional, dirigido a médicos
- Si mencionas cifras o protocolos, sé específico y actualizado
- Nunca diagnostiques pacientes específicos
- Si la pregunta está fuera de tu ámbito, recomienda consultar profesionales
- Mantén respuestas concisas pero informativas`;
    
    // Convertir mensajes al formato de Groq
    const groqMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await client.messages.stream({
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
      system: systemPrompt,
      messages: groqMessages
    });
    
    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullResponse += chunk.delta.text;
        res.write(`data: ${JSON.stringify({content: chunk.delta.text})}\n\n`);
      }
    }
    
    // Guardar en base de datos
    try {
      const username = req.user?.username || 'anonymous';
      const query = messages[messages.length - 1]?.content || '';
      await pool.query(
        'INSERT INTO ai_logs (username, query, response) VALUES ($1, $2, $3)',
        [username, query, fullResponse]
      );
    } catch (dbErr) {
      console.error('Error saving AI log:', dbErr);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Error streaming from Groq:', err);
    res.write(`data: ${JSON.stringify({error: err.message})}\n\n`);
    res.end();
  }
};

exports.getAILogs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching AI logs:', err);
    res.status(500).json({error: err.message});
  }
};

exports.getAIStats = async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM ai_logs');
    const ratingResult = await pool.query(
      "SELECT rating, COUNT(*) as count FROM ai_logs WHERE rating IS NOT NULL GROUP BY rating"
    );
    const topQueriesResult = await pool.query(`
      SELECT query, COUNT(*) as count FROM ai_logs 
      GROUP BY query 
      ORDER BY count DESC 
      LIMIT 10
    `);

    const ratings = {};
    ratingResult.rows.forEach(row => {
      ratings[row.rating] = row.count;
    });

    res.json({
      total: parseInt(totalResult.rows[0].count),
      ratings,
      topQueries: topQueriesResult.rows
    });
  } catch (err) {
    console.error('Error fetching AI stats:', err);
    res.status(500).json({error: err.message});
  }
};

exports.rateAIResponse = async (req, res) => {
  try {
    const { logId, rating } = req.body;
    await pool.query(
      'UPDATE ai_logs SET rating = $1 WHERE id = $2',
      [rating, logId]
    );
    res.json({success: true});
  } catch (err) {
    console.error('Error rating response:', err);
    res.status(500).json({error: err.message});
  }
};

module.exports = exports;
