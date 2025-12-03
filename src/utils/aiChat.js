// Sistema de Chat IA mejorado con histórico, ratings y estadísticas

class AIChatManager {
  constructor() {
    this.messages = [];
    this.isLoading = false;
    this.stats = JSON.parse(localStorage.getItem('ai_stats') || '{"total":0,"ratings":{},"queries":[]}');
    this.loadHistory();
  }

  loadHistory() {
    const saved = localStorage.getItem('ai_chat_history');
    this.messages = saved ? JSON.parse(saved) : [];
  }

  saveHistory() {
    localStorage.setItem('ai_chat_history', JSON.stringify(this.messages));
  }

  saveStats() {
    localStorage.setItem('ai_stats', JSON.stringify(this.stats));
  }

  addMessage(role, content, rating = null) {
    const msg = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString(),
      rating
    };
    this.messages.push(msg);
    this.saveHistory();

    if (role === 'user') {
      this.stats.total++;
      this.stats.queries.push({
        text: content.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      this.saveStats();
    }

    return msg;
  }

  async rateMessage(messageId, rating) {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg && msg.role === 'assistant') {
      msg.rating = rating;
      this.saveHistory();
      this.stats.ratings[messageId] = rating;
      this.saveStats();
      
      // Enviar al servidor para guardar en DB
      try {
        await fetch('/api/ai/rate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({logId: messageId, rating})
        });
      } catch (err) {
        console.error('Error saving rating:', err);
      }
    }
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('ai_chat_history');
  }

  getStats() {
    return {
      totalQueries: this.stats.total,
      averageRating: this.calculateAverageRating(),
      positiveRatings: Object.values(this.stats.ratings).filter(r => r === 'positive').length,
      negativeRatings: Object.values(this.stats.ratings).filter(r => r === 'negative').length,
      topQueries: this.getTopQueries()
    };
  }

  calculateAverageRating() {
    const ratings = Object.values(this.stats.ratings);
    if (ratings.length === 0) return 0;
    const positive = ratings.filter(r => r === 'positive').length;
    return ((positive / ratings.length) * 100).toFixed(0);
  }

  getTopQueries() {
    const queryCount = {};
    this.stats.queries.forEach(q => {
      queryCount[q.text] = (queryCount[q.text] || 0) + 1;
    });
    return Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }
}

const aiChatManager = new AIChatManager();

// Renderizar mensaje con markdown básico y botones
function renderMessageBubble(msg, isUser) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    justify-content: ${isUser ? 'flex-end' : 'flex-start'};
    gap: 12px;
    animation: slideIn 0.3s ease-out;
  `;

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    max-width: 70%;
    padding: 14px 16px;
    border-radius: 16px;
    background: ${isUser ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)'};
    color: ${isUser ? 'white' : 'var(--text)'};
    line-height: 1.6;
    font-size: 14px;
    word-wrap: break-word;
    box-shadow: 0 2px 8px ${isUser ? 'rgba(var(--primary-rgb), 0.3)' : 'rgba(0,0,0,0.1)'};
  `;

  // Procesar markdown simple
  let processedContent = msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  bubble.innerHTML = processedContent;

  container.appendChild(bubble);

  // Botones para mensajes del asistente
  if (!isUser) {
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
      display: flex;
      gap: 6px;
      flex-direction: column;
      justify-content: center;
      font-size: 18px;
    `;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋';
    copyBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.6; transition: opacity 0.2s;';
    copyBtn.onmouseover = () => copyBtn.style.opacity = '1';
    copyBtn.onmouseout = () => copyBtn.style.opacity = '0.6';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(msg.content);
      toast('Copiado al portapapeles', 'success');
    };

    const likeBtn = document.createElement('button');
    likeBtn.textContent = msg.rating === 'positive' ? '👍' : '🤍';
    likeBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.6; transition: opacity 0.2s;';
    likeBtn.onmouseover = () => likeBtn.style.opacity = '1';
    likeBtn.onmouseout = () => likeBtn.style.opacity = '0.6';
    likeBtn.onclick = () => {
      aiChatManager.rateMessage(msg.id, 'positive');
      likeBtn.textContent = '👍';
      dislikeBtn.textContent = '🤍';
      toast('Respuesta útil', 'success');
    };

    const dislikeBtn = document.createElement('button');
    dislikeBtn.textContent = msg.rating === 'negative' ? '👎' : '🤍';
    dislikeBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.6; transition: opacity 0.2s;';
    dislikeBtn.onmouseover = () => dislikeBtn.style.opacity = '1';
    dislikeBtn.onmouseout = () => dislikeBtn.style.opacity = '0.6';
    dislikeBtn.onclick = () => {
      aiChatManager.rateMessage(msg.id, 'negative');
      dislikeBtn.textContent = '👎';
      likeBtn.textContent = '🤍';
      toast('Retroalimentación guardada', 'info');
    };

    buttonsDiv.appendChild(copyBtn);
    buttonsDiv.appendChild(likeBtn);
    buttonsDiv.appendChild(dislikeBtn);
    container.appendChild(buttonsDiv);
  }

  return container;
}

// Mostrar indicador de "escribiendo..."
function showTypingIndicator() {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    justify-content: flex-start;
    gap: 12px;
  `;
  container.id = 'typingIndicator';

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    max-width: 70%;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--text);
    display: flex;
    gap: 6px;
    align-items: center;
  `;

  bubble.innerHTML = `
    <span style="animation: bounce 1.4s infinite; display: inline-block;">●</span>
    <span style="animation: bounce 1.4s infinite 0.2s; display: inline-block;">●</span>
    <span style="animation: bounce 1.4s infinite 0.4s; display: inline-block;">●</span>
  `;

  container.appendChild(bubble);
  return container;
}

// Funciones globales para HTML
window.enviarMensajeIA = async function() {
  const input = document.getElementById('iaChatInput');
  const messagesDiv = document.getElementById('iaChatMessages');
  const btnEnviar = document.getElementById('btnEnviarIA');
  const text = input.value.trim();

  if (!text) return;

  // Guardar y limpiar input
  input.value = '';
  input.style.height = '48px';

  // Añadir mensaje del usuario
  aiChatManager.addMessage('user', text);
  messagesDiv.appendChild(renderMessageBubble({id: Date.now(), content: text}, true));
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Mostrar indicador de escribiendo
  const typingDiv = showTypingIndicator();
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  btnEnviar.disabled = true;
  aiChatManager.isLoading = true;

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiChatManager.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) throw new Error('Error en respuesta de IA');

    let fullResponse = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) fullResponse += json.content;
          } catch (e) {}
        }
      }
    }

    // Remover indicador de escribiendo
    typingDiv.remove();

    if (fullResponse) {
      const msg = aiChatManager.addMessage('assistant', fullResponse);
      messagesDiv.appendChild(renderMessageBubble(msg, false));
    }
  } catch (err) {
    typingDiv.remove();
    const errorMsg = {id: Date.now(), content: `Error: ${err.message}`};
    messagesDiv.appendChild(renderMessageBubble(errorMsg, false));
  } finally {
    btnEnviar.disabled = false;
    aiChatManager.isLoading = false;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

window.limpiarChatIA = function() {
  if (confirm('¿Limpiar el historial de conversación?')) {
    aiChatManager.clearHistory();
    document.getElementById('iaChatMessages').innerHTML = `
      <div style="text-align:center;color:var(--muted);padding:60px 20px;">
        <div style="font-size:64px;margin-bottom:16px;animation:bounce 2s infinite;">💬</div>
        <h4 style="margin:0 0 8px 0;color:var(--text);font-size:20px;font-weight:600;">¿En qué puedo ayudarte?</h4>
        <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;">Pregúntame sobre tratamientos, dosificaciones, diagnósticos, guías clínicas o cualquier tema de salud pediátrica y neonatología.</p>
      </div>
    `;
    toast('Historial limpiado', 'info');
  }
};

window.getAIChatStats = function() {
  return aiChatManager.getStats();
};
