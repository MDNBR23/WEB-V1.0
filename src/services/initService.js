const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, initializeDatabase } = require('./dbService');

async function initializeData() {
  await initializeDatabase();
  
  const adminResult = await query('SELECT username FROM users WHERE username = $1', ['admin']);
  if (adminResult.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    await query(`
      INSERT INTO users (
        username, password, name, email, phone, institucion, role, status, cat, avatar, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      'admin',
      hashedPassword,
      'Administrador',
      'admin@medtoolshub.local',
      '',
      'Med Tools Hub',
      'admin',
      'aprobado',
      'Pediatra',
      '',
      true
    ]);
    console.log('Admin user created');
  }
  
  const anunciosResult = await query('SELECT COUNT(*) FROM anuncios');
  if (parseInt(anunciosResult.rows[0].count) === 0) {
    await query(`
      INSERT INTO anuncios (title, content, type, active)
      VALUES ($1, $2, $3, $4)
    `, [
      'Bienvenidos a Med Tools Hub',
      'Plataforma médica para profesionales de pediatría y neonatología.',
      'info',
      true
    ]);
    console.log('Default announcement created');
  }
  
  const guiasResult = await query('SELECT COUNT(*) FROM guias');
  if (parseInt(guiasResult.rows[0].count) === 0) {
    await query(`
      INSERT INTO guias (title, category, content, active)
      VALUES ($1, $2, $3, $4)
    `, [
      'Guía RCP Neonatal 2024',
      'Neonatología',
      'Protocolo actualizado de reanimación cardiopulmonar neonatal.',
      true
    ]);
    console.log('Default guide created');
  }
  
  const medsResult = await query('SELECT COUNT(*) FROM medications');
  if (parseInt(medsResult.rows[0].count) === 0) {
    const meds = [
      {name:'Adrenalina',category:'Vasopresores',dosage:'1 ampolla (1mg/1ml) en 9ml SF = 0.1mg/ml',notes:'Dosis: 0.01-0.03 mg/kg IV. RCP: 0.01-0.03 mg/kg cada 3-5 min'},
      {name:'Amikacina',category:'Antibióticos',dosage:'Diluir en SF o SG 5% para infusión',notes:'Neonatos: 15-20 mg/kg/día c/24h. Niños: 15-22.5 mg/kg/día dividido c/8-12h'},
      {name:'Ampicilina',category:'Antibióticos',dosage:'Reconstituir con agua estéril, diluir en SF o SG 5%',notes:'Neonatos <7 días: 50-100 mg/kg c/12h. >7 días: 50-100 mg/kg c/8h. Meningitis: dosis más altas'},
      {name:'Cafeína',category:'Estimulantes SNC',dosage:'Citrato de cafeína 20mg/ml (oral o IV)',notes:'Carga: 20mg/kg. Mantenimiento: 5-10mg/kg/día. Para apnea del prematuro'},
      {name:'Cefotaxima',category:'Antibióticos',dosage:'Reconstituir y diluir en SF o SG 5%',notes:'Neonatos: 50mg/kg c/8-12h. Niños: 50-100mg/kg/día dividido c/6-8h. Meningitis: hasta 200mg/kg/día'},
      {name:'Dexametasona',category:'Corticoides',dosage:'Puede diluirse en SF o SG 5%',notes:'Antiinflamatorio: 0.15-0.6 mg/kg/día. Edema cerebral: 0.5-1 mg/kg dosis inicial'},
      {name:'Dobutamina',category:'Inotrópicos',dosage:'1 ampolla (250mg/20ml) + SF hasta 50ml = 5mg/ml',notes:'Dosis: 2-20 mcg/kg/min en infusión continua. Ajustar según respuesta hemodinámica'},
      {name:'Dopamina',category:'Vasopresores',dosage:'1 ampolla (200mg/5ml) + SF hasta 50ml = 4mg/ml',notes:'Dosis baja (2-5 mcg/kg/min): renal. Media (5-10): inotrópico. Alta (>10): vasopresor'},
      {name:'Fentanilo',category:'Analgésicos',dosage:'Diluir en SF, concentración típica 10-50 mcg/ml',notes:'Analgesia: 1-2 mcg/kg IV. Sedación: 1-5 mcg/kg/h en infusión continua'},
      {name:'Furosemida',category:'Diuréticos',dosage:'Puede administrarse directo IV o diluido en SF',notes:'Neonatos: 1-2 mg/kg/dosis c/12-24h. Niños: 1-2 mg/kg/dosis c/6-12h'},
      {name:'Gentamicina',category:'Antibióticos',dosage:'Diluir en SF o SG 5% para infusión 30-60 min',notes:'Neonatos: 4-5 mg/kg/día c/24-48h según edad. Niños: 5-7.5 mg/kg/día c/8h'},
      {name:'Hidrocortisona',category:'Corticoides',dosage:'Reconstituir con agua estéril, puede diluirse en SF',notes:'Insuficiencia suprarrenal: 1-2 mg/kg c/6-8h. Shock: 50-100 mg/m²/día'},
      {name:'Midazolam',category:'Sedantes',dosage:'Puede diluirse en SF o SG 5%',notes:'Sedación: 0.05-0.15 mg/kg IV. Infusión continua: 1-6 mcg/kg/min'},
      {name:'Morfina',category:'Analgésicos',dosage:'Diluir en SF, concentración típica 0.1-1 mg/ml',notes:'Analgesia: 0.05-0.2 mg/kg c/2-4h IV. Infusión: 10-40 mcg/kg/h'},
      {name:'Surfactante',category:'Pulmonares',dosage:'Listo para usar intratraqueal',notes:'Dosis: 100-200 mg/kg intratraqueal. Puede repetirse según protocolo'},
      {name:'Vancomicina',category:'Antibióticos',dosage:'Reconstituir y diluir en SF o SG 5%, infusión ≥60 min',notes:'Neonatos: 10-15 mg/kg c/8-24h según edad. Niños: 10-15 mg/kg c/6-8h. Monitorear niveles'}
    ];
    
    for (const med of meds) {
      await query(
        'INSERT INTO medications (name, category, dosage, notes) VALUES ($1, $2, $3, $4)',
        [med.name, med.category, med.dosage, med.notes]
      );
    }
    console.log('Default medications created');
  }
  
  console.log('Database initialization complete');
}

module.exports = { initializeData };
