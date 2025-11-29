const { pool } = require('../config/database');

const defaultMedications = [
  {
    nombre: 'FENTANILO',
    dosis: '1MCG/KG/HORA',
    unidad: 'mcg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '500MCG/10ML = 50MCG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [0.88, 0.44, 0.21, 0.11] }
    ]
  },
  {
    nombre: 'MIDAZOLAM',
    dosis: '0.1MG/KG/HORA',
    unidad: 'mg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '15MG/3ML = 5MG/1ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [0.42, 0.21, 0.10, 0.05] }
    ]
  },
  {
    nombre: 'MORFINA',
    dosis: '0.1MG/KG/HORA',
    unidad: 'mg/kg/h',
    grupo: 'Sedoanalgesia',
    presentations: [
      { descripcion: '10MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [0.83, 0.42, 0.21, 0.10] }
    ]
  },
  {
    nombre: 'DOPAMINA',
    dosis: '5MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Vasopresor',
    presentations: [
      { descripcion: '200MG/5ML = 40MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [6.67, 3.33, 1.67, 0.83] }
    ]
  },
  {
    nombre: 'ADRENALINA',
    dosis: '0.1MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Vasopresor',
    presentations: [
      { descripcion: '1MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [0.083, 0.042, 0.021, 0.010] }
    ]
  },
  {
    nombre: 'DOBUTAMINA',
    dosis: '5MCG/KG/MIN',
    unidad: 'mcg/kg/min',
    grupo: 'Inotropico',
    presentations: [
      { descripcion: '250MG/10ML = 25MG/ML', diluciones: ['12CC', '24CC', '50CC', '100CC'], concentraciones: [4.17, 2.08, 1.04, 0.52] }
    ]
  }
];

async function initializeInfusionMedications() {
  try {
    for (const med of defaultMedications) {
      const result = await pool.query(
        'INSERT INTO infusion_medications (nombre, dosis, unidad, grupo) VALUES ($1, $2, $3, $4) ON CONFLICT (nombre) DO UPDATE SET dosis = $2, unidad = $3, grupo = $4 RETURNING id',
        [med.nombre, med.dosis, med.unidad, med.grupo]
      );
      
      const medId = result.rows[0].id;
      
      for (const pres of med.presentations) {
        await pool.query(
          'INSERT INTO medication_presentations (medication_id, descripcion, diluciones, concentraciones) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [medId, pres.descripcion, JSON.stringify(pres.diluciones), JSON.stringify(pres.concentraciones)]
        );
      }
    }
    console.log('Infusion medications initialized successfully');
  } catch (err) {
    console.error('Error initializing infusion medications:', err);
  }
}

module.exports = { initializeInfusionMedications };
