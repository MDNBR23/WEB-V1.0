# Integración de Ollama para IA Médica

## Descripción General
Este documento describe cómo integrar Ollama en la sección de Herramientas > IA Médica del Med Tools Hub para proporcionar capacidades de inteligencia artificial médica local.

## Requisitos del Servidor VPS

### Requisitos Mínimos
- **CPU**: 4 cores (recomendado 8+ para modelos más grandes)
- **RAM**: 8GB mínimo (16GB+ recomendado)
- **Almacenamiento**: 50GB de espacio libre (los modelos pueden ocupar 4-20GB cada uno)
- **Sistema Operativo**: Ubuntu 22.04 LTS o superior / Debian 11+

### Instalación de Ollama en VPS

```bash
# 1. Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Verificar instalación
ollama --version

# 3. Descargar modelo médico recomendado
# Opciones de modelos (del más pequeño al más grande):
ollama pull llama2:7b          # Modelo general, 4GB
ollama pull meditron:7b        # Modelo médico especializado, 4GB
ollama pull biomistral:7b      # Modelo biomédico, 4GB
ollama pull llama2:13b         # Modelo más grande y preciso, 7GB

# 4. Iniciar Ollama como servicio
sudo systemctl enable ollama
sudo systemctl start ollama

# 5. Configurar Ollama para aceptar conexiones externas
# Editar /etc/systemd/system/ollama.service
sudo nano /etc/systemd/system/ollama.service

# Agregar bajo [Service]:
Environment="OLLAMA_HOST=0.0.0.0:11434"

# Recargar y reiniciar
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Configuración de Firewall

```bash
# Permitir puerto 11434 para Ollama
sudo ufw allow 11434/tcp
sudo ufw reload
```

## Integración en Med Tools Hub

### 1. Variables de Entorno Requeridas

Agregar en `.env` o configurar como secrets en Replit:

```env
OLLAMA_HOST=http://tu-servidor-vps-ip:11434
OLLAMA_MODEL=meditron:7b
```

### 2. Endpoints del Servidor (server.js)

```javascript
// Endpoint para generar respuestas médicas con Ollama
app.post('/api/medical-ai', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autorizado'});
  }
  
  try {
    const { prompt, context } = req.body;
    
    if (!process.env.OLLAMA_HOST) {
      return res.status(503).json({error: 'Servicio de IA no configurado'});
    }
    
    const response = await fetch(`${process.env.OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'meditron:7b',
        prompt: prompt,
        context: context || [],
        stream: false
      })
    });
    
    const data = await response.json();
    res.json({
      response: data.response,
      context: data.context
    });
  } catch (err) {
    console.error('Error calling Ollama:', err);
    res.status(500).json({error: 'Error al procesar la consulta médica'});
  }
});

// Endpoint para streaming de respuestas
app.post('/api/medical-ai-stream', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autorizado'});
  }
  
  try {
    const { prompt, context } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const response = await fetch(`${process.env.OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'meditron:7b',
        prompt: prompt,
        context: context || [],
        stream: true
      })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      res.write(`data: ${chunk}\n\n`);
    }
    
    res.end();
  } catch (err) {
    console.error('Error streaming from Ollama:', err);
    res.status(500).json({error: 'Error en streaming'});
  }
});
```

### 3. Frontend (herramientas.html - Sección IA Médica)

Agregar una nueva herramienta en el menú de herramientas:

```html
<div class="card glass tool-card" onclick="showTool('ia-medica')">
  <span class="tool-card-icon">🤖</span>
  <h3>IA Médica</h3>
  <p>Asistente de IA para consultas médicas con Ollama</p>
</div>
```

Y la sección de la herramienta:

```html
<section id="iaMedicaSection" class="tool-section" style="display:none;">
  <h3>🤖 Asistente de IA Médica</h3>
  <p class="text-muted">Consulta al asistente de IA para obtener información médica general. Este servicio es complementario y no sustituye el criterio médico profesional.</p>
  
  <div class="field">
    <label>Tu consulta médica</label>
    <textarea id="iaPrompt" rows="4" placeholder="Ejemplo: ¿Cuáles son las indicaciones de surfactante pulmonar en neonatos prematuros?"></textarea>
  </div>
  
  <button class="btn" onclick="consultarIAMedica()">Consultar IA</button>
  
  <div id="iaResponse" class="card" style="display:none;margin-top:20px;"></div>
</section>
```

### 4. JavaScript (script.js)

```javascript
let iaContext = [];

async function consultarIAMedica() {
  const prompt = document.getElementById('iaPrompt').value.trim();
  const responseDiv = document.getElementById('iaResponse');
  
  if (!prompt) {
    alert('Por favor ingresa una consulta');
    return;
  }
  
  try {
    responseDiv.style.display = 'block';
    responseDiv.innerHTML = '<p>Generando respuesta...</p>';
    
    const data = await api('/medical-ai', {
      method: 'POST',
      body: JSON.stringify({ prompt, context: iaContext })
    });
    
    iaContext = data.context;
    
    responseDiv.innerHTML = `
      <h4>Respuesta de IA Médica:</h4>
      <p style="white-space:pre-wrap;">${escapeHtml(data.response)}</p>
      <small class="text-muted">Nota: Esta información es de referencia general. Siempre consulta fuentes médicas actualizadas y guías clínicas oficiales.</small>
    `;
  } catch (err) {
    responseDiv.innerHTML = `<p style="color:var(--danger);">Error: ${err.message}</p>`;
  }
}

function showTool(toolName) {
  // Ocultar todas las secciones
  document.querySelectorAll('.tool-section').forEach(s => s.style.display = 'none');
  document.getElementById('toolMenu').style.display = 'none';
  
  // Mostrar la sección seleccionada
  if (toolName === 'ia-medica') {
    document.getElementById('iaMedicaSection').style.display = 'block';
  }
  // ... resto de herramientas
}
```

## Modelos Médicos Recomendados

### 1. Meditron (Recomendado)
- **Tamaño**: 7B parámetros
- **Especialización**: Medicina general y clínica
- **Comando**: `ollama pull meditron:7b`

### 2. BioMistral
- **Tamaño**: 7B parámetros
- **Especialización**: Biomedicina y ciencias de la salud
- **Comando**: `ollama pull biomistral:7b`

### 3. Llama2 Medical
- **Tamaño**: 7B o 13B parámetros
- **Especialización**: Modelo general con fine-tuning médico
- **Comando**: `ollama pull llama2:7b` o `ollama pull llama2:13b`

## Configuración de Prompts del Sistema

Para mejores resultados, incluir un system prompt:

```javascript
const systemPrompt = `Eres un asistente médico especializado. Proporciona información médica precisa basada en evidencia científica. Siempre recuerda:
1. No diagnostiques pacientes específicos
2. Proporciona información general basada en guías clínicas
3. Recomienda consultar con profesionales de salud para casos individuales
4. Usa lenguaje técnico cuando sea apropiado
5. Cita evidencia cuando sea posible`;

const fullPrompt = systemPrompt + "\n\nConsulta: " + prompt;
```

## Seguridad y Limitaciones

### Advertencias Importantes
- ⚠️ La IA no debe usarse para diagnósticos clínicos directos
- ⚠️ Toda información debe ser verificada con fuentes médicas confiables
- ⚠️ No sustituye la evaluación clínica profesional
- ⚠️ Los modelos pueden contener información desactualizada

### Límites de Rate
Implementar límites de consultas por usuario:

```javascript
// En server.js
const userRequestCounts = new Map();

app.post('/api/medical-ai', async (req, res) => {
  const username = req.session.user.username;
  const now = Date.now();
  const userRequests = userRequestCounts.get(username) || [];
  
  // Limpiar requests antiguos (más de 1 hora)
  const recentRequests = userRequests.filter(time => now - time < 3600000);
  
  if (recentRequests.length >= 20) {
    return res.status(429).json({error: 'Límite de consultas alcanzado. Intenta en una hora.'});
  }
  
  recentRequests.push(now);
  userRequestCounts.set(username, recentRequests);
  
  // ... resto del código
});
```

## Monitoreo y Mantenimiento

### Verificar Estado de Ollama
```bash
# Ver logs del servicio
sudo journalctl -u ollama -f

# Ver modelos descargados
ollama list

# Estadísticas de uso
curl http://localhost:11434/api/tags
```

### Actualizar Modelos
```bash
# Actualizar un modelo específico
ollama pull meditron:7b

# Eliminar modelo antiguo
ollama rm nombre-modelo
```

## Costos Estimados VPS

Para ejecutar Ollama con modelos 7B:
- **Digital Ocean**: Droplet 8GB RAM - $48/mes
- **Linode**: Dedicated 8GB - $48/mes
- **Vultr**: 8GB RAM - $48/mes
- **Hetzner**: CX31 (8GB) - €8.54/mes (~$9/mes)

Para modelos 13B+ se recomienda 16GB RAM.

## Soporte y Recursos

- [Documentación oficial de Ollama](https://github.com/ollama/ollama)
- [Meditron Model Card](https://huggingface.co/epfl-llm/meditron-7b)
- [BioMistral Model](https://huggingface.co/BioMistral/BioMistral-7B)

## Próximos Pasos

1. ✅ Configurar VPS con Ollama
2. ✅ Descargar modelo médico
3. ⬜ Configurar variables de entorno OLLAMA_HOST y OLLAMA_MODEL
4. ⬜ Implementar endpoints en server.js
5. ⬜ Crear UI en herramientas.html
6. ⬜ Agregar límites de rate y seguridad
7. ⬜ Probar y ajustar prompts del sistema
8. ⬜ Documentar para usuarios finales
