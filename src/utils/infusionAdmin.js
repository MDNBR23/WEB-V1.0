let infusionMedicationsAdmin = [];
let currentEditingMedicationId = null;

async function cargarMedicamentosInfusiones() {
  try {
    const response = await fetch('/api/medications/infusions/list');
    if (!response.ok) throw new Error('Error loading medications');
    infusionMedicationsAdmin = await response.json();
    
    // Load presentations para cada medicamento
    for (let med of infusionMedicationsAdmin) {
      const presResponse = await fetch(`/api/medications/presentations/${med.id}`);
      if (presResponse.ok) {
        med.presentations = await presResponse.json();
      } else {
        med.presentations = [];
      }
    }
    
    renderInfusionesTable();
  } catch (err) {
    console.error('Error loading infusions:', err);
    alert('Error cargando medicamentos');
  }
}

function renderInfusionesTable() {
  const tbody = document.getElementById('adminInfusionesTable').querySelector('tbody');
  tbody.innerHTML = '';
  
  infusionMedicationsAdmin.forEach(med => {
    const row = document.createElement('tr');
    const presCount = med.presentations ? med.presentations.length : 0;
    row.innerHTML = `
      <td><strong>${med.nombre}</strong></td>
      <td>${med.grupo || ''}</td>
      <td>${med.dosis || ''}</td>
      <td>${presCount} presentación(es)</td>
      <td style="display:flex;gap:8px;">
        <button class="btn sm" onclick="editarMedicamento(${med.id})" style="font-size:12px;padding:6px 10px;">Editar</button>
        <button class="btn sm secondary" onclick="gestionarPresentaciones(${med.id})" style="font-size:12px;padding:6px 10px;">Presentaciones</button>
        <button class="btn sm secondary" onclick="eliminarMedicamento(${med.id})" style="font-size:12px;padding:6px 10px;">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editarMedicamento(id) {
  const med = infusionMedicationsAdmin.find(m => m.id === id);
  if (!med) return;
  
  document.getElementById('infId').value = id;
  document.getElementById('infNombre').value = med.nombre;
  document.getElementById('infDosis').value = med.dosis || '';
  document.getElementById('infUnidad').value = med.unidad || 'mcg/kg/h';
  document.getElementById('infGrupo').value = med.grupo || 'Vasopresor';
  
  document.getElementById('modalInfusion').style.display = 'flex';
}

async function guardarMedicamento() {
  const id = document.getElementById('infId').value;
  const nombre = document.getElementById('infNombre').value;
  const dosis = document.getElementById('infDosis').value;
  const unidad = document.getElementById('infUnidad').value;
  const grupo = document.getElementById('infGrupo').value;
  
  try {
    const url = id ? `/api/medications/infusions/${id}` : '/api/medications/infusions/create';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, dosis, unidad, grupo })
    });
    
    if (!response.ok) throw new Error('Error saving medication');
    
    document.getElementById('infusionForm').reset();
    document.getElementById('infId').value = '';
    document.getElementById('modalInfusion').style.display = 'none';
    
    cargarMedicamentosInfusiones();
  } catch (err) {
    console.error('Error:', err);
    alert('Error guardando medicamento');
  }
}

async function eliminarMedicamento(id) {
  if (!confirm('¿Eliminar este medicamento?')) return;
  
  try {
    const response = await fetch(`/api/medications/infusions/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error deleting medication');
    cargarMedicamentosInfusiones();
  } catch (err) {
    console.error('Error:', err);
    alert('Error eliminando medicamento');
  }
}

async function gestionarPresentaciones(medId) {
  currentEditingMedicationId = medId;
  const med = infusionMedicationsAdmin.find(m => m.id === medId);
  
  try {
    const response = await fetch(`/api/medications/presentations/${medId}`);
    const presentations = response.ok ? await response.json() : [];
    
    const container = document.getElementById('presentationsTableContainer');
    container.innerHTML = `
      <h4 style="color:var(--text);margin-bottom:16px;">Presentaciones de ${med.nombre}</h4>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;padding:8px;color:var(--text);">Descripción</th>
            <th style="text-align:center;width:100px;color:var(--text);">Acciones</th>
          </tr>
        </thead>
        <tbody id="presentationsTableBody"></tbody>
      </table>
    `;
    
    const tbody = document.getElementById('presentationsTableBody');
    presentations.forEach(pres => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border)';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn sm secondary';
      editBtn.style.fontSize = '11px';
      editBtn.style.padding = '4px 8px';
      editBtn.textContent = 'Editar';
      editBtn.type = 'button';
      editBtn.addEventListener('click', () => editarPresentation(pres.id));
      
      const delBtn = document.createElement('button');
      delBtn.className = 'btn sm secondary';
      delBtn.style.fontSize = '11px';
      delBtn.style.padding = '4px 8px';
      delBtn.textContent = 'Eliminar';
      delBtn.type = 'button';
      delBtn.addEventListener('click', () => eliminarPresentation(pres.id));
      
      const actionsTd = document.createElement('td');
      actionsTd.style.textAlign = 'center';
      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(delBtn);
      
      const descTd = document.createElement('td');
      descTd.style.padding = '8px';
      descTd.textContent = pres.descripcion;
      
      row.appendChild(descTd);
      row.appendChild(actionsTd);
      tbody.appendChild(row);
    });
    
    document.getElementById('modalPresentations').style.display = 'flex';
  } catch (err) {
    console.error('Error:', err);
    alert('Error cargando presentaciones');
  }
}

function extraerConcentracion(descripcion) {
  // Extraer la concentración base de la descripción (ej: "50MCG/ML" de "500MCG/10ML = 50MCG/ML")
  const match = descripcion.match(/=\s*([\d.]+)\s*(MCG|MG|UI)\/\s*(\d*)\s*ML/i);
  if (!match) return 0;
  
  return parseFloat(match[1]); // Ej: 50 MCG/ML
}

async function editarPresentation(presId) {
  const med = infusionMedicationsAdmin.find(m => m.id === currentEditingMedicationId);
  const pres = med.presentations.find(p => p.id === presId);
  
  if (!pres) return;
  
  document.getElementById('presId').value = presId;
  document.getElementById('presDescripcion').value = pres.descripcion;
  document.getElementById('presDiluciones').value = Array.isArray(pres.diluciones) ? pres.diluciones.join(', ') : pres.diluciones;
  
  document.getElementById('modalEditPresentation').style.display = 'flex';
}

async function guardarPresentation() {
  const presId = document.getElementById('presId').value;
  const descripcion = document.getElementById('presDescripcion').value;
  const diluciones = document.getElementById('presDiluciones').value.split(',').map(d => d.trim());
  const concentracion = extraerConcentracion(descripcion);
  
  try {
    const response = await fetch(`/api/medications/presentations/${presId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion, diluciones, concentracion })
    });
    
    if (!response.ok) throw new Error('Error saving presentation');
    
    document.getElementById('presentationForm').reset();
    document.getElementById('presId').value = '';
    document.getElementById('modalEditPresentation').style.display = 'none';
    
    gestionarPresentaciones(currentEditingMedicationId);
  } catch (err) {
    console.error('Error:', err);
    alert('Error guardando presentación');
  }
}

async function agregarPresentacion() {
  const descripcion = prompt('Descripción (ej: 500MCG/10ML = 50MCG/ML):');
  if (!descripcion) return;
  
  const diluciones = prompt('Diluciones (ej: 12CC, 24CC, 50CC, 100CC):');
  if (!diluciones) return;
  
  const dilucionesArray = diluciones.split(',').map(d => d.trim());
  const concentracion = extraerConcentracion(descripcion);
  
  try {
    const response = await fetch(`/api/medications/presentations/${currentEditingMedicationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion,
        diluciones: dilucionesArray,
        concentracion
      })
    });
    
    if (!response.ok) throw new Error('Error creating presentation');
    gestionarPresentaciones(currentEditingMedicationId);
  } catch (err) {
    console.error('Error:', err);
    alert('Error agregando presentación');
  }
}

async function eliminarPresentation(presId) {
  if (!confirm('¿Eliminar esta presentación?')) return;
  
  try {
    const response = await fetch(`/api/medications/presentations/${presId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error deleting presentation');
    gestionarPresentaciones(currentEditingMedicationId);
  } catch (err) {
    console.error('Error:', err);
    alert('Error eliminando presentación');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const btnNuevaInfusion = document.getElementById('btnNuevaInfusion');
  const btnNuevaPresentation = document.getElementById('btnNuevaPresentation');
  const infusionForm = document.getElementById('infusionForm');
  const presentationForm = document.getElementById('presentationForm');
  const closeInfusionBtns = document.querySelectorAll('[data-close-infusion]');
  
  if (btnNuevaInfusion) {
    btnNuevaInfusion.addEventListener('click', function() {
      document.getElementById('infId').value = '';
      document.getElementById('infusionForm').reset();
      document.getElementById('modalInfusion').style.display = 'flex';
    });
  }
  
  if (btnNuevaPresentation) {
    btnNuevaPresentation.addEventListener('click', function() {
      agregarPresentacion();
    });
  }
  
  if (infusionForm) {
    infusionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      guardarMedicamento();
    });
  }
  
  if (presentationForm) {
    presentationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      guardarPresentation();
    });
  }
  
  closeInfusionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      document.getElementById('modalInfusion').style.display = 'none';
    });
  });
});
