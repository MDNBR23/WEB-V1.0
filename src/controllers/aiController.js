exports.streamAI = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({error: 'Messages array requerido'});
    }
    
    if (!process.env.OLLAMA_HOST) {
      return res.status(503).json({error: 'Servicio de IA no configurado. Configure OLLAMA_HOST en variables de entorno.'});
    }
    
    const systemPrompt = `Eres un asistente médico especializado en pediatría y neonatología. Tu objetivo es ayudar de manera clara, directa y útil.

REGLAS IMPORTANTES:
- Responde de forma conversacional y natural
- Ajusta la longitud de tu respuesta a la pregunta: preguntas simples = respuestas breves, preguntas complejas = respuestas detalladas
- Sé directo y ve al punto
- No des disclaimers largos en cada respuesta
- Proporciona información médica general basada en evidencia
- No diagnostiques pacientes específicos
- Recomienda consultar profesionales cuando sea necesario
- Usa lenguaje técnico solo cuando sea apropiado
- Si mencionas medicamentos, incluye dosis pediátricas relevantes

Responde de manera profesional pero amigable, como un colega médico experimentado.`;
    
    let conversationPrompt = systemPrompt + '\n\n';
    for (const msg of messages) {
      if (msg.role === 'user') {
        conversationPrompt += `Usuario: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        conversationPrompt += `Asistente: ${msg.content}\n\n`;
      }
    }
    conversationPrompt += 'Asistente: ';
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const ollamaModel = process.env.OLLAMA_MODEL || 'tinyllama';
    
    const response = await fetch(`${process.env.OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: ollamaModel,
        prompt: conversationPrompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({content: json.response})}\n\n`);
          }
          if (json.done) {
            res.write('data: [DONE]\n\n');
          }
        } catch (e) {
          console.error('Error parsing Ollama chunk:', e);
        }
      }
    }
    
    res.end();
  } catch (err) {
    console.error('Error streaming from Ollama:', err);
    res.write(`data: ${JSON.stringify({error: err.message})}\n\n`);
    res.end();
  }
};

module.exports = exports;
