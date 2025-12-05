const { query } = require('./dbService');

const defaultMedications = [
  {
    nombre: 'FENTANILO',
    dosis: '1MCG/KG/HORA',
    unidad: 'mcg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '500MCG/10ML = 50MCG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 50 }
    ]
  },
  {
    nombre: 'MIDAZOLAM',
    dosis: '0.1MG/KG/HORA',
    unidad: 'mg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '15MG/3ML = 5MG/1ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 5 }
    ]
  },
  {
    nombre: 'MORFINA',
    dosis: '0.1MG/KG/HORA',
    unidad: 'mg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '10MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 10 }
    ]
  },
  {
    nombre: 'DOPAMINA',
    dosis: '5MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Vasopresor',
    presentations: [
      { descripcion: '200MG/5ML = 40MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 40 }
    ]
  },
  {
    nombre: 'ADRENALINA',
    dosis: '0.1MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Vasopresor',
    presentations: [
      { descripcion: '1MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 1000 }
    ]
  },
  {
    nombre: 'DOBUTAMINA',
    dosis: '5MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Inotropico',
    presentations: [
      { descripcion: '250MG/10ML = 25MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentracion: 12.5 }
    ]
  }
];

async function initializeInfusionMedications() {
  try {
    const existingResult = await query('SELECT COUNT(*) FROM infusion_medications');
    if (parseInt(existingResult.rows[0].count) > 0) {
      console.log('Infusion medications already exist, skipping initialization');
      return;
    }
    
    for (const med of defaultMedications) {
      const result = await query(
        'INSERT INTO infusion_medications (nombre, dosis, unidad, grupo) VALUES ($1, $2, $3, $4) RETURNING id',
        [med.nombre, med.dosis, med.unidad, med.grupo]
      );
      
      const medId = result.rows[0].id;
      
      for (const pres of med.presentations) {
        await query(
          'INSERT INTO medication_presentations (medication_id, descripcion, diluciones, concentracion) VALUES ($1, $2, $3, $4)',
          [medId, pres.descripcion, JSON.stringify(pres.diluciones), pres.concentracion]
        );
      }
    }
    console.log('Infusion medications initialized successfully');
  } catch (err) {
    console.error('Error initializing infusion medications:', err);
  }
}

module.exports = { initializeInfusionMedications };
