const { pool } = require('../config/database');

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
    // Primero, limpiar presentaciones existentes para evitar duplicados
    await pool.query('DELETE FROM medication_presentations');
    
    for (const med of defaultMedications) {
      const result = await pool.query(
        'INSERT INTO infusion_medications (nombre, dosis, unidad, grupo) VALUES ($1, $2, $3, $4) ON CONFLICT (nombre) DO UPDATE SET dosis = $2, unidad = $3, grupo = $4 RETURNING id',
        [med.nombre, med.dosis, med.unidad, med.grupo]
      );
      
      const medId = result.rows[0].id;
      
      // Insertar UNA SOLA presentación por medicamento
      for (const pres of med.presentations) {
        await pool.query(
          'INSERT INTO medication_presentations (medication_id, descripcion, diluciones, concentracion) VALUES ($1, $2, $3, $4)',
          [medId, pres.descripcion, JSON.stringify(pres.diluciones), pres.concentracion]
        );
      }
    }
    console.log('Infusion medications initialized successfully - 6 meds with 1 presentation each');
  } catch (err) {
    console.error('Error initializing infusion medications:', err);
  }
}

module.exports = { initializeInfusionMedications };
