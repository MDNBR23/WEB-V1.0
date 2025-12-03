const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { readJSON, writeJSON, ensureDataDir } = require('./fileService');

async function initializeData() {
  await ensureDataDir();
  
  const users = await readJSON('users.json', []);
  if (!users.find(u => u.username === 'admin')) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    users.push({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      email: 'admin@medtoolshub.local',
      phone: '',
      institucion: 'Med Tools Hub',
      role: 'admin',
      status: 'aprobado',
      cat: 'Pediatra',
      avatar: '',
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
    await writeJSON('users.json', users);
  }
  
  const globalAnuncios = await readJSON('anuncios_global.json', []);
  if (globalAnuncios.length === 0) {
    globalAnuncios.push({
      id: crypto.randomUUID(),
      titulo: 'Bienvenidos a Med Tools Hub',
      fecha: new Date().toISOString().slice(0, 10),
      texto: 'Plataforma médica para profesionales de pediatría y neonatología.',
      img: '',
      global: true
    });
    await writeJSON('anuncios_global.json', globalAnuncios);
  }
  
  const globalGuias = await readJSON('guias_global.json', []);
  if (globalGuias.length === 0) {
    globalGuias.push({
      id: crypto.randomUUID(),
      titulo: 'Guía RCP Neonatal 2024',
      fecha: new Date().toISOString().slice(0, 10),
      texto: 'Protocolo actualizado de reanimación cardiopulmonar neonatal.',
      url: '',
      global: true
    });
    await writeJSON('guias_global.json', globalGuias);
  }
  
  const medications = await readJSON('medications.json', []);
  if (medications.length === 0) {
    const meds = [
      {id:crypto.randomUUID(),nombre:'Adrenalina',grupo:'Vasopresores',dilucion:'1 ampolla (1mg/1ml) en 9ml SF = 0.1mg/ml',comentarios:'Dosis: 0.01-0.03 mg/kg IV. RCP: 0.01-0.03 mg/kg cada 3-5 min'},
      {id:crypto.randomUUID(),nombre:'Amikacina',grupo:'Antibióticos',dilucion:'Diluir en SF o SG 5% para infusión',comentarios:'Neonatos: 15-20 mg/kg/día c/24h. Niños: 15-22.5 mg/kg/día dividido c/8-12h'},
      {id:crypto.randomUUID(),nombre:'Ampicilina',grupo:'Antibióticos',dilucion:'Reconstituir con agua estéril, diluir en SF o SG 5%',comentarios:'Neonatos <7 días: 50-100 mg/kg c/12h. >7 días: 50-100 mg/kg c/8h. Meningitis: dosis más altas'},
      {id:crypto.randomUUID(),nombre:'Cafeína',grupo:'Estimulantes SNC',dilucion:'Citrato de cafeína 20mg/ml (oral o IV)',comentarios:'Carga: 20mg/kg. Mantenimiento: 5-10mg/kg/día. Para apnea del prematuro'},
      {id:crypto.randomUUID(),nombre:'Cefotaxima',grupo:'Antibióticos',dilucion:'Reconstituir y diluir en SF o SG 5%',comentarios:'Neonatos: 50mg/kg c/8-12h. Niños: 50-100mg/kg/día dividido c/6-8h. Meningitis: hasta 200mg/kg/día'},
      {id:crypto.randomUUID(),nombre:'Dexametasona',grupo:'Corticoides',dilucion:'Puede diluirse en SF o SG 5%',comentarios:'Antiinflamatorio: 0.15-0.6 mg/kg/día. Edema cerebral: 0.5-1 mg/kg dosis inicial'},
      {id:crypto.randomUUID(),nombre:'Dobutamina',grupo:'Inotrópicos',dilucion:'1 ampolla (250mg/20ml) + SF hasta 50ml = 5mg/ml',comentarios:'Dosis: 2-20 mcg/kg/min en infusión continua. Ajustar según respuesta hemodinámica'},
      {id:crypto.randomUUID(),nombre:'Dopamina',grupo:'Vasopresores',dilucion:'1 ampolla (200mg/5ml) + SF hasta 50ml = 4mg/ml',comentarios:'Dosis baja (2-5 mcg/kg/min): renal. Media (5-10): inotrópico. Alta (>10): vasopresor'},
      {id:crypto.randomUUID(),nombre:'Fentanilo',grupo:'Analgésicos',dilucion:'Diluir en SF, concentración típica 10-50 mcg/ml',comentarios:'Analgesia: 1-2 mcg/kg IV. Sedación: 1-5 mcg/kg/h en infusión continua'},
      {id:crypto.randomUUID(),nombre:'Furosemida',grupo:'Diuréticos',dilucion:'Puede administrarse directo IV o diluido en SF',comentarios:'Neonatos: 1-2 mg/kg/dosis c/12-24h. Niños: 1-2 mg/kg/dosis c/6-12h'},
      {id:crypto.randomUUID(),nombre:'Gentamicina',grupo:'Antibióticos',dilucion:'Diluir en SF o SG 5% para infusión 30-60 min',comentarios:'Neonatos: 4-5 mg/kg/día c/24-48h según edad. Niños: 5-7.5 mg/kg/día c/8h'},
      {id:crypto.randomUUID(),nombre:'Hidrocortisona',grupo:'Corticoides',dilucion:'Reconstituir con agua estéril, puede diluirse en SF',comentarios:'Insuficiencia suprarrenal: 1-2 mg/kg c/6-8h. Shock: 50-100 mg/m²/día'},
      {id:crypto.randomUUID(),nombre:'Midazolam',grupo:'Sedantes',dilucion:'Puede diluirse en SF o SG 5%',comentarios:'Sedación: 0.05-0.15 mg/kg IV. Infusión continua: 1-6 mcg/kg/min'},
      {id:crypto.randomUUID(),nombre:'Morfina',grupo:'Analgésicos',dilucion:'Diluir en SF, concentración típica 0.1-1 mg/ml',comentarios:'Analgesia: 0.05-0.2 mg/kg c/2-4h IV. Infusión: 10-40 mcg/kg/h'},
      {id:crypto.randomUUID(),nombre:'Surfactante',grupo:'Pulmonares',dilucion:'Listo para usar intratraqueal',comentarios:'Dosis: 100-200 mg/kg intratraqueal. Puede repetirse según protocolo'},
      {id:crypto.randomUUID(),nombre:'Vancomicina',grupo:'Antibióticos',dilucion:'Reconstituir y diluir en SF o SG 5%, infusión ≥60 min',comentarios:'Neonatos: 10-15 mg/kg c/8-24h según edad. Niños: 10-15 mg/kg c/6-8h. Monitorear niveles'}
    ];
    await writeJSON('medications.json', meds);
  }
}

module.exports = { initializeData };
