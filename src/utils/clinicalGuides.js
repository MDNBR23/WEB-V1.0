// Clinical Guides Database - Indexed guidelines and medical references

const clinicalGuides = {
  categories: {
    neonatology: { name: 'Neonatología', icon: '👶', color: '#FF6B9D' },
    pediatrics: { name: 'Pediatría', icon: '🧒', color: '#4ECDC4' },
    pediatricEmergency: { name: 'Emergencias Pediátricas', icon: '🚨', color: '#FF6348' },
    pharmacology: { name: 'Farmacología', icon: '💊', color: '#95E1D3' },
    procedures: { name: 'Procedimientos', icon: '🩺', color: '#F38181' },
    nutrition: { name: 'Nutrición', icon: '🥗', color: '#AA96DA' }
  },

  guides: [
    {
      id: 'neo_001',
      title: 'Manejo de la Asfixia Perinatal',
      category: 'neonatology',
      shortDesc: 'Protocolo de reanimación neonatal',
      content: `
        <h3>Asfixia Perinatal - Protocolo de Manejo</h3>
        <p><strong>Definición:</strong> Privación de oxígeno (hipoxia) y perfusión tisular inadecuada (isquemia).</p>
        
        <h4>Clasificación por Severidad:</h4>
        <ul>
          <li><strong>Leve:</strong> Apgar 5-6, respuesta a estímulos</li>
          <li><strong>Moderada:</strong> Apgar 3-4, hipotensión</li>
          <li><strong>Severa:</strong> Apgar <3, requiere RCP</li>
        </ul>
        
        <h4>Manejo Inmediato:</h4>
        <ol>
          <li>Airway: Posicionar, succionar, intubar si es necesario</li>
          <li>Breathing: Ventilación con bolsa-máscara o intubación</li>
          <li>Circulation: Masaje cardíaco si FC <100 sin respuesta</li>
          <li>Medicamentos: Adrenalina IV 0.01-0.03 mg/kg cada 3-5 min</li>
        </ol>
        
        <p><strong>Referencias:</strong> 
          <a href="#" onclick="openReference('pubmed_asfixia')">PubMed: Perinatal Asphyxia</a> | 
          <a href="#" onclick="openReference('uptodate_nrp')">UpToDate: Neonatal Resuscitation</a>
        </p>
      `,
      references: ['pubmed_asfixia', 'uptodate_nrp'],
      keywords: ['asfixia', 'reanimación', 'Apgar', 'hipoxia']
    },

    {
      id: 'neo_002',
      title: 'Ictericia Neonatal',
      category: 'neonatology',
      shortDesc: 'Manejo de hiperbilirrubinemia',
      content: `
        <h3>Ictericia Neonatal - Protocolo de Manejo</h3>
        <p><strong>Criterios para fototerapia (RN ≥35 semanas):</strong></p>
        
        <table style="width:100%;border-collapse:collapse;">
          <tr><td><strong>Edad (horas)</strong></td><td><strong>≥38 semanas</strong></td><td><strong>35-37+6 semanas</strong></td></tr>
          <tr><td>24</td><td>18</td><td>15</td></tr>
          <tr><td>48</td><td>25</td><td>18</td></tr>
          <tr><td>72</td><td>30</td><td>24</td></tr>
          <tr><td>96</td><td>34</td><td>28</td></tr>
        </table>
        
        <h4>Manejo:</h4>
        <ul>
          <li>Fototerapia: 12-18 horas/día, 8-10 µW/cm²/nm</li>
          <li>Hidratación: Fomentar lactancia materna 8-12 veces/día</li>
          <li>Seguimiento: Medir bilirrubina cada 24 horas</li>
          <li>Exanguineotransfusión: Si bilirrubina excede línea crítica</li>
        </ul>
      `,
      references: ['uptodate_neonatal_jaundice'],
      keywords: ['ictericia', 'bilirrubina', 'fototerapia']
    },

    {
      id: 'peds_001',
      title: 'Diarrea Aguda en Pediatría',
      category: 'pediatrics',
      shortDesc: 'Manejo de deshidratación',
      content: `
        <h3>Diarrea Aguda - Evaluación y Manejo</h3>
        
        <h4>Evaluación del Grado de Deshidratación:</h4>
        <ul>
          <li><strong>Leve (3-5%):</strong> Mucosas ligeramente secas, pliegue cutáneo normal</li>
          <li><strong>Moderada (6-9%):</strong> Mucosas secas, pliegue cutáneo lento, taquicardia</li>
          <li><strong>Severa (≥10%):</strong> Signos de shock, letargia, hipotensión</li>
        </ul>
        
        <h4>Rehidratación:</h4>
        <p><strong>Plan A (Deshidratación Leve-Moderada):</strong></p>
        <ul>
          <li>Suero oral: 50-100 mL/kg en 4 horas</li>
          <li>Mantener ingesta oral</li>
          <li>Reposición: 10 mL/kg por cada evacuación</li>
        </ul>
        
        <p><strong>Plan B (Deshidratación Severa):</strong></p>
        <ul>
          <li>Solución salina 0.9% IV: 100 mL/kg (bolo 30 mL/kg en 1 hora)</li>
          <li>Repetir si persiste shock</li>
        </ul>
      `,
      references: ['who_diarrhea', 'uptodate_pediatric_diarrhea'],
      keywords: ['diarrea', 'deshidratación', 'rehidratación', 'suero oral']
    },

    {
      id: 'emergency_001',
      title: 'RCP Pediátrica',
      category: 'pediatricEmergency',
      shortDesc: 'Reanimación cardiopulmonar',
      content: `
        <h3>RCP Pediátrica - Protocolo ACLS</h3>
        
        <h4>Compresiones Torácicas:</h4>
        <ul>
          <li><strong>Frecuencia:</strong> 100-120 compresiones/min</li>
          <li><strong>Profundidad:</strong> Al menos 1/3 del diámetro anterior del tórax</li>
          <li><strong>Técnica:</strong> Dos dedos (lactantes) o talón de mano (niños)</li>
        </ul>
        
        <h4>Ventilación:</h4>
        <ul>
          <li>Relación compresión-ventilación: 30:2</li>
          <li>Volumen: 6-7 mL/kg (10 mL/kg máximo)</li>
        </ul>
        
        <h4>Medicamentos (cada 3-5 minutos):</h4>
        <ul>
          <li><strong>Adrenalina:</strong> 0.01 mg/kg IV (máx 0.5 mg)</li>
          <li><strong>Amiodarona:</strong> 5 mg/kg IV (si FV/TV)</li>
        </ul>
      `,
      references: ['acls_guidelines', 'pals_manual'],
      keywords: ['RCP', 'reanimación', 'paro cardíaco', 'compresiones']
    },

    {
      id: 'pharm_001',
      title: 'Dosis Comunes en Pediatría',
      category: 'pharmacology',
      shortDesc: 'Referencia rápida de medicamentos',
      content: `
        <h3>Dosis Comunes por Peso Corporal</h3>
        
        <h4>Antibióticos:</h4>
        <ul>
          <li><strong>Amoxicilina:</strong> 25-45 mg/kg/día (3 dosis)</li>
          <li><strong>Cefixima:</strong> 8 mg/kg/día (1-2 dosis)</li>
          <li><strong>Azitromicina:</strong> 10 mg/kg día 1, luego 5 mg/kg/día</li>
        </ul>
        
        <h4>Analgésicos:</h4>
        <ul>
          <li><strong>Ibuprofeno:</strong> 5-10 mg/kg/dosis c/6-8h</li>
          <li><strong>Acetaminofén:</strong> 10-15 mg/kg/dosis c/4-6h</li>
          <li><strong>Máximo ibuprofeno:</strong> 40 mg/kg/día</li>
        </ul>
        
        <h4>Anticonvulsivantes:</h4>
        <ul>
          <li><strong>Fenitoína:</strong> Carga: 15-20 mg/kg IV</li>
          <li><strong>Mantenimiento:</strong> 4-7 mg/kg/día (3 dosis)</li>
        </ul>
      `,
      references: ['pediatric_dosing_handbook'],
      keywords: ['dosis', 'medicamentos', 'pediatría', 'cálculo']
    }
  ],

  // Search guides
  search: function(query) {
    const q = query.toLowerCase();
    return this.guides.filter(g => 
      g.title.toLowerCase().includes(q) ||
      g.shortDesc.toLowerCase().includes(q) ||
      g.keywords.some(k => k.includes(q))
    );
  },

  // Get by category
  getByCategory: function(category) {
    return this.guides.filter(g => g.category === category);
  },

  // Get full guide
  getGuide: function(id) {
    return this.guides.find(g => g.id === id);
  }
};
