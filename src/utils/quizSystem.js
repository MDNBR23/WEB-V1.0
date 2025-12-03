// Quiz and Assessment System for Continuous Learning

const quizzes = {
  assessments: [
    {
      id: 'quiz_neo_basics',
      title: 'Fundamentos de Neonatología',
      category: 'neonatology',
      difficulty: 'beginner',
      description: 'Prueba tus conocimientos en conceptos básicos de cuidado neonatal',
      questions: [
        {
          id: 1,
          question: '¿Cuál es el Apgar normal a los 5 minutos en un RN sano?',
          options: ['3-4', '5-6', '8-10', '<3'],
          correct: 2,
          explanation: 'Un Apgar de 8-10 indica un recién nacido en excelentes condiciones. <3 es crítico, 3-4 moderado, 5-6 leve.'
        },
        {
          id: 2,
          question: 'El ictericia fisiológica aparece típicamente en:',
          options: ['Primeras 12 horas', 'Después de 24 horas', 'A los 3-5 días', 'A la segunda semana'],
          correct: 2,
          explanation: 'La ictericia fisiológica generalmente aparece después del primer día, alcanza máximo a los 3-5 días.'
        },
        {
          id: 3,
          question: '¿Cuál es la presión arterial normal sistólica en un RN?',
          options: ['40-60 mmHg', '60-80 mmHg', '80-100 mmHg', '>100 mmHg'],
          correct: 1,
          explanation: 'En recién nacidos, PAS normal es 60-80 mmHg en los primeros días de vida.'
        },
        {
          id: 4,
          question: 'Frecuencia cardíaca normal en un RN:',
          options: ['80-100 lpm', '100-120 lpm', '120-160 lpm', '>160 lpm'],
          correct: 2,
          explanation: 'La FC normal en RN es 120-160 lpm. Bradicardia <100 y taquicardia >160.'
        },
        {
          id: 5,
          question: 'Temperatura corporal normal en RN:',
          options: ['35-36.5°C', '36.5-37.5°C', '37.5-38°C', '>38°C'],
          correct: 1,
          explanation: 'Temperatura axilar normal: 36.5-37.5°C. <36.5 es hipotermia, >38 es fiebre.'
        },
        {
          id: 6,
          question: '¿Cuándo debe realizarse el cribado de bilirrubina?',
          options: ['A las 24 horas', 'A los 3-5 días', 'Según edad postparto', 'Una sola vez al nacer'],
          correct: 2,
          explanation: 'El cribado debe ser según edad postnatal para identificar riesgo de hiperbilirrubinemia.'
        },
        {
          id: 7,
          question: 'Apnea neonatal se define como pausa respiratoria mayor a:',
          options: ['5 segundos', '10 segundos', '15 segundos', '20 segundos'],
          correct: 2,
          explanation: 'Apnea patológica en RN: pausa respiratoria >15 segundos con cambios hemodinámicos.'
        },
        {
          id: 8,
          question: 'Volumen gástrico residual máximo tolerado en RN prematuro:',
          options: ['2 mL/kg', '5 mL/kg', '10 mL/kg', '15 mL/kg'],
          correct: 1,
          explanation: 'Residuo gástrico normal <50% del volumen administrado, máximo 2-3 mL/kg.'
        }
      ]
    },

    {
      id: 'quiz_peds_emergency',
      title: 'Emergencias Pediátricas Comunes',
      category: 'pediatricEmergency',
      difficulty: 'intermediate',
      description: 'Evalúa tus habilidades en manejo de emergencias pediátricas',
      questions: [
        {
          id: 1,
          question: 'En RCP pediátrica, la relación compresión-ventilación es:',
          options: ['15:2', '30:2', '100:2', '30:1'],
          correct: 1,
          explanation: 'ACLS recomienda 30 compresiones por 2 ventilaciones en pediatría.'
        },
        {
          id: 2,
          question: 'Frecuencia de compresiones en RCP pediátrica:',
          options: ['60-80/min', '80-100/min', '100-120/min', '>120/min'],
          correct: 2,
          explanation: 'Se recomiendan 100-120 compresiones por minuto para maximizar perfusión.'
        },
        {
          id: 3,
          question: 'En un niño con deshidratación severa, la rehidratación IV debe ser:',
          options: ['20 mL/kg en 10 min', '30 mL/kg en 1 hora', '50 mL/kg en 4 horas', 'Oral solamente'],
          correct: 1,
          explanation: 'Bolo IV: 30 mL/kg en la primera hora para restaurar volemia en shock.'
        },
        {
          id: 4,
          question: 'Dosis de epinefrina IV en RCP pediátrica:',
          options: ['0.01 mg/kg', '0.05 mg/kg', '0.1 mg/kg', '0.5 mg/kg'],
          correct: 0,
          explanation: 'Epinefrina IV: 0.01 mg/kg (0.1 mL/kg de solución 1:10,000) cada 3-5 minutos.'
        },
        {
          id: 5,
          question: 'En status convulsivo pediátrico, usar:',
          options: ['Diazepam IV 0.1 mg/kg', 'Lorazepam IV 0.05 mg/kg', 'Fenitoína IV', 'Observación solamente'],
          correct: 1,
          explanation: 'Lorazepam IV 0.05-0.1 mg/kg es primera línea para status convulsivo pediátrico.'
        },
        {
          id: 6,
          question: 'Presión arterial normal para un niño de 5 años:',
          options: ['90/60 mmHg', '100/70 mmHg', '110/80 mmHg', '120/90 mmHg'],
          correct: 1,
          explanation: 'PAM = [PAS+(2×PAD)]/3. Para 5 años ~100/70 es normal.'
        },
        {
          id: 7,
          question: 'Signo de Kussmaul en cetoacidosis diabética indica:',
          options: ['Hipoglucemia', 'Acidosis metabólica', 'Alcalosis respiratoria', 'Hipercalemia'],
          correct: 1,
          explanation: 'Respiración profunda y rápida (Kussmaul) es compensación respiratoria a acidosis.'
        },
        {
          id: 8,
          question: 'Manejo inicial del cuerpo extraño en vía aérea:',
          options: ['Observación', 'Maniobra de Heimlich', 'Intubación inmediata', 'Radiografía'],
          correct: 1,
          explanation: 'Maniobra de Heimlich en niño consciente. Si es bebé: golpes interescapulares + compresiones.'
        }
      ]
    },

    {
      id: 'quiz_pharmacology_basics',
      title: 'Fundamentos de Farmacopea Pediátrica',
      category: 'pharmacology',
      difficulty: 'beginner',
      description: 'Prueba conocimientos en dosificación pediátrica común',
      questions: [
        {
          id: 1,
          question: '¿Cuál es la dosis correcta de amoxicilina en pediatría?',
          options: ['5-10 mg/kg', '15-25 mg/kg', '25-45 mg/kg', '50+ mg/kg'],
          correct: 2,
          explanation: 'Amoxicilina: 25-45 mg/kg/día dividida en 3 dosis para infecciones comunes.'
        },
        {
          id: 2,
          question: 'Dosis máxima diaria de ibuprofeno en niños:',
          options: ['20 mg/kg/día', '30 mg/kg/día', '40 mg/kg/día', 'Sin límite de peso'],
          correct: 2,
          explanation: 'Máximo 40 mg/kg/día de ibuprofeno. Dosis individual: 5-10 mg/kg cada 6-8h.'
        },
        {
          id: 3,
          question: 'Dosis de paracetamol en niños:',
          options: ['5-10 mg/kg', '10-15 mg/kg', '15-20 mg/kg', '>20 mg/kg'],
          correct: 2,
          explanation: 'Paracetamol: 15 mg/kg por dosis, cada 4-6 horas. Máximo 60-90 mg/kg/día.'
        },
        {
          id: 4,
          question: 'Dosis de azitromicina para otitis media en niños:',
          options: ['5 mg/kg/día', '10 mg/kg primer día', '15 mg/kg/día', 'Contraindicado'],
          correct: 1,
          explanation: 'Azitromicina: 10 mg/kg primer día, luego 5 mg/kg días 2-5 para infecciones.'
        },
        {
          id: 5,
          question: 'Contraindicación importante de ácido acetilsalicílico en niños:',
          options: ['Alergia a AINE', 'Síndrome de Reye', 'Fiebre', 'Rinitis'],
          correct: 1,
          explanation: 'Riesgo de Síndrome de Reye en varicela y gripe. Se prefiere paracetamol/ibuprofeno.'
        },
        {
          id: 6,
          question: 'Dosis de cefalexina para infección de piel en niños:',
          options: ['12.5 mg/kg/día', '25 mg/kg/día', '50 mg/kg/día', '100 mg/kg/día'],
          correct: 1,
          explanation: 'Cefalexina: 25-50 mg/kg/día dividida en 4 dosis para infecciones bacterianas.'
        },
        {
          id: 7,
          question: 'Dosis de amoxicilina-clavulánico en otitis media aguda:',
          options: ['20 mg/kg/día', '40 mg/kg/día', '45 mg/kg/día', '90 mg/kg/día'],
          correct: 2,
          explanation: 'Amoxicilina-clavulánico: 45 mg/kg/día dividida en 3 dosis (basada en amoxicilina).'
        },
        {
          id: 8,
          question: 'Edad mínima recomendada para usar ibuprofeno en neonatos:',
          options: ['Desde el nacimiento', '2-4 semanas', '3 meses', '6 meses'],
          correct: 2,
          explanation: 'Ibuprofeno no se recomienda antes de 3 meses de vida por riesgo renal.'
        }
      ]
    }
  ],

  // Get quiz by ID
  getQuiz: function(id) {
    return this.assessments.find(q => q.id === id);
  },

  // Get quizzes by category
  getByCategory: function(category) {
    return this.assessments.filter(q => q.category === category);
  },

  // Get by difficulty
  getByDifficulty: function(difficulty) {
    return this.assessments.filter(q => q.difficulty === difficulty);
  },

  // Save quiz result
  saveResult: function(quizId, score, answers) {
    const result = {
      quizId,
      score,
      answers,
      timestamp: new Date().toISOString(),
      userEmail: sessionStorage.getItem('userEmail')
    };

    let results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    results.push(result);
    localStorage.setItem('quizResults', JSON.stringify(results));

    return result;
  },

  // Get user quiz history
  getHistory: function(userEmail) {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    return results.filter(r => r.userEmail === userEmail);
  },

  // Calculate stats
  getStats: function(userEmail) {
    const history = this.getHistory(userEmail);
    const totalQuizzes = history.length;
    const avgScore = history.length > 0 
      ? (history.reduce((sum, r) => sum + r.score, 0) / history.length).toFixed(1)
      : 0;

    return {
      totalQuizzes,
      avgScore,
      recentQuizzes: history.slice(-5).reverse()
    };
  }
};

// Load edited quizzes from localStorage
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const editadas = localStorage.getItem('quizzesEditadas');
  if (editadas) {
    try {
      const parsed = JSON.parse(editadas);
      quizzes.assessments = parsed;
    } catch(e) {
      console.log('Error loading edited quizzes:', e);
    }
  }
}
