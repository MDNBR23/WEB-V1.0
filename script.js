
(async function(){
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme')||'light'; 
  html.setAttribute('data-theme', savedTheme);
  
  const isConfig = location.pathname.endsWith('configuracion.html');
  if(isConfig) {
    document.querySelectorAll('.theme-toggle').forEach(t=>{
      t.checked=(savedTheme==='dark');
      t.onchange=()=>{
        const th=t.checked?'dark':'light';
        html.setAttribute('data-theme',th);
        localStorage.setItem('theme',th);
        document.querySelectorAll('.theme-toggle').forEach(x=>x.checked=t.checked);
        
        const prev=document.getElementById('avatarTopPreview');
        if(prev && !prev.src.startsWith('data:image/jpeg') && !prev.src.startsWith('data:image/png')){
          prev.src=getDefaultAvatar();
        }
        
        const headerAvatar=document.getElementById('avatarTop');
        if(headerAvatar && !headerAvatar.src.startsWith('data:image/jpeg') && !headerAvatar.src.startsWith('data:image/png')){
          headerAvatar.src=getDefaultAvatar();
        }
      };
    });
  }

  const DEF_AV_LIGHT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB4Mj0iMSIgeTE9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMDA4QjhCIiBvZmZzZXQ9IjAiLz48c3RvcCBzdG9wLWNvbG9yPSIjMDA4MDgwIiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjIwNiIgcj0iOTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44NSkiLz48cGF0aCBkPSJNODAgNDMyYzAtOTcgOTUtMTQyIDE3Ni0xNDJzMTc2IDQ1IDE3NiAxNDIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44NSkiLz48L3N2Zz4=";
  const DEF_AV_DARK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB4Mj0iMSIgeTE9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjNjY3ZWVhIiBvZmZzZXQ9IjAiLz48c3RvcCBzdG9wLWNvbG9yPSIjNzY0YmEyIiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjIwNiIgcj0iOTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44NSkiLz48cGF0aCBkPSJNODAgNDMyYzAtOTcgOTUtMTQyIDE3Ni0xNDJzMTc2IDQ1IDE3NiAxNDIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44NSkiLz48L3N2Zz4=";
  
  function getDefaultAvatar(){
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? DEF_AV_DARK : DEF_AV_LIGHT;
  }
  const DEF_AV = getDefaultAvatar();

  let globalAudioContext = null;
  
  function initAudioContext() {
    if(!globalAudioContext) {
      try {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch(err) {
        console.log('AudioContext not available');
      }
    }
    return globalAudioContext;
  }
  
  async function playDing(){
    try {
      const audioContext = initAudioContext();
      if(!audioContext) return;
      
      if(audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('Audio playback error:', err);
    }
  }
  
  document.addEventListener('click', () => {
    initAudioContext();
  }, { once: true });

  function toast(m,t='info',playSound=false){
    const o=document.querySelector('.toast');
    if(o)o.remove();
    const d=document.createElement('div');
    d.className='toast '+t;
    d.innerHTML=`<span>${m}</span><span class="close">✕</span>`;
    document.body.appendChild(d);
    const c=()=>d.remove();
    d.querySelector('.close').onclick=c;
    setTimeout(c,6000);
    if(playSound) playDing();
  } 
  window.showToast=toast;

  async function api(endpoint, options = {}) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  }
  window.api = api;

  let currentSession = null;
  
  async function checkSession() {
    try {
      const data = await api('/session');
      if (data.authenticated) {
        currentSession = data.user;
        return data.user;
      }
      return null;
    } catch (err) {
      return null;
    }
  }
  window.checkSession = checkSession;

  const path=location.pathname;
  const isAuth=/(^|\/)index\.html$/.test(path)||path.endsWith('/');
  const isReg=path.endsWith('register.html');
  const isReset=path.endsWith('reset-password.html');
  
  if(!(isAuth||isReg||isReset)){
    const session = await checkSession();
    if(!session){
      location.replace('index.html');
      return;
    }
    
    if(session.role !== 'admin') {
      try {
        const maintenance = await api('/maintenance');
        if(maintenance.active) {
          document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,var(--g1),var(--g2));padding:20px;">
              <div style="background:rgba(255,255,255,0.95);border-radius:20px;padding:48px;max-width:600px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size:80px;margin-bottom:24px;">🔧</div>
                <h1 style="margin:0 0 16px 0;color:#1a202c;font-size:32px;">Modo Mantenimiento</h1>
                <p style="color:#4a5568;font-size:18px;line-height:1.6;margin:0 0 32px 0;">${maintenance.message}</p>
                <button onclick="location.replace('index.html')" style="background:linear-gradient(135deg,var(--g1),var(--g2));color:white;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Volver al inicio</button>
              </div>
            </div>
          `;
          return;
        }
      } catch (err) {
        console.error('Error checking maintenance mode:', err);
      }
    }
  }

  const layout=document.querySelector('.layout');
  const sidebar=document.querySelector('.sidebar');
  const btn=document.getElementById('btnToggleSidebar');
  const collapsed=localStorage.getItem('sidebarCollapsed')==='1';
  
  if(layout&&collapsed)layout.classList.add('collapsed');
  if(sidebar&&collapsed)sidebar.classList.add('collapsed');
  
  function isMobile() {
    return window.innerWidth <= 768;
  }

  let sidebarOverlay = null;

  function createSidebarOverlay() {
    if(!sidebarOverlay) {
      sidebarOverlay = document.createElement('div');
      sidebarOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;display:none;';
      document.body.appendChild(sidebarOverlay);
      
      sidebarOverlay.addEventListener('click', () => {
        if(isMobile()) {
          layout.classList.remove('sidebar-open');
          sidebarOverlay.style.display = 'none';
        }
      });
    }
  }

  if(btn&&sidebar&&layout) {
    createSidebarOverlay();

    btn.onclick=()=>{
      if(isMobile()) {
        layout.classList.toggle('sidebar-open');
        if(layout.classList.contains('sidebar-open')) {
          sidebarOverlay.style.display = 'block';
        } else {
          sidebarOverlay.style.display = 'none';
        }
      } else {
        sidebar.classList.toggle('collapsed');
        layout.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed')?'1':'0');
      }
    };

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if(isMobile()) {
          layout.classList.remove('sidebar-open');
          if(sidebarOverlay) sidebarOverlay.style.display = 'none';
        }
      });
    });
  }

  async function fillTop(){
    const info=document.getElementById('mainUserInfo');
    const av=document.getElementById('avatarTop');
    const session = await checkSession();
    
    if(info&&session){
      try {
        const profile = await api('/profile');
        const cat = profile.cat || '';
        const displayName = profile.name||profile.username;
        let fullText = '';
        
        if(cat && cat.toLowerCase() !== 'no especificar') {
          fullText = `${cat} ${displayName}`;
        } else {
          fullText = displayName;
        }
        
        if(profile.role === 'admin') {
          info.textContent = `${fullText} — ADMIN`;
          updateAdminNotifications();
        } else {
          info.textContent = fullText;
        }
        
        if(av){
          av.src=profile.avatar||getDefaultAvatar();
          av.alt=(profile.name||profile.username)[0]||'';
        }
        
        const adminLink=document.querySelector('a[href="admin.html"]');
        if(adminLink){
          adminLink.style.display=(profile.role==='admin')?'flex':'none';
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    }
  }
  
  function initColombiaClock() {
    const clockEl = document.getElementById('colombiaClock');
    if (!clockEl) return;
    
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.95)';
    
    const dateSpan = document.createElement('span');
    dateSpan.style.fontWeight = '600';
    dateSpan.style.color = textColor;
    
    const separator = document.createElement('span');
    separator.textContent = ' | ';
    separator.style.opacity = '0.8';
    separator.style.color = textColor;
    
    const timeSpan = document.createElement('span');
    timeSpan.style.fontWeight = '700';
    timeSpan.style.color = textColor;
    
    clockEl.appendChild(dateSpan);
    clockEl.appendChild(separator);
    clockEl.appendChild(timeSpan);
    
    function updateClock() {
      const now = new Date();
      const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      const dayName = days[colombiaTime.getDay()];
      const day = String(colombiaTime.getDate()).padStart(2, '0');
      const month = months[colombiaTime.getMonth()];
      const year = colombiaTime.getFullYear();
      
      const hours = String(colombiaTime.getHours()).padStart(2, '0');
      const minutes = String(colombiaTime.getMinutes()).padStart(2, '0');
      const seconds = String(colombiaTime.getSeconds()).padStart(2, '0');
      
      dateSpan.textContent = `${dayName} ${day} ${month} ${year}`;
      timeSpan.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
  }
  
  if(!isAuth && !isReg && !isReset) {
    await fillTop();
    initColombiaClock();
    
    const session = await checkSession();
    if(session) {
      if(session.role !== 'admin') {
        await updateUserSugerenciasNotifications();
        setInterval(updateUserSugerenciasNotifications, 10000);
      } else {
        await updateUserSugerenciasNotifications();
        await updateAdminNotifications();
        setInterval(async () => {
          await updateUserSugerenciasNotifications();
          await updateAdminNotifications();
        }, 10000);
      }
    }
  }

  window.logout=async ()=>{
    try {
      await api('/logout', {method: 'POST'});
      currentSession = null;
      location.replace('index.html');
    } catch (err) {
      console.error('Logout error:', err);
      location.replace('index.html');
    }
  };

  let inactivityTimer = null;
  const INACTIVITY_TIMEOUT = 25 * 60 * 1000;

  function resetInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(async () => {
      if (currentSession) {
        alert('Tu sesión ha expirado por inactividad. Serás redirigido al inicio de sesión.');
        await window.logout();
      }
    }, INACTIVITY_TIMEOUT);
  }

  if (!isAuth && !isReg && !isReset) {
    const session = await checkSession();
    if (session) {
      resetInactivityTimer();
      
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { passive: true });
      });
    }
  }

  const loginForm=document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit',async (e)=>{
      e.preventDefault();
      const username=document.getElementById('loginUser').value.trim();
      const pass=document.getElementById('loginPass').value;
      
      try {
        const data = await api('/login', {
          method: 'POST',
          body: JSON.stringify({username, password: pass})
        });
        
        if(data.success) {
          if(data.user.role !== 'admin') {
            try {
              const maintenance = await api('/maintenance');
              if(maintenance.active) {
                document.body.innerHTML = `
                  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,var(--g1),var(--g2));padding:20px;">
                    <div style="background:rgba(255,255,255,0.95);border-radius:20px;padding:48px;max-width:600px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                      <div style="font-size:80px;margin-bottom:24px;">🔧</div>
                      <h1 style="margin:0 0 16px 0;color:#1a202c;font-size:32px;">Modo Mantenimiento</h1>
                      <p style="color:#4a5568;font-size:18px;line-height:1.6;margin:0 0 32px 0;">${maintenance.message}</p>
                      <button onclick="location.replace('index.html')" style="background:linear-gradient(135deg,var(--g1),var(--g2));color:white;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Volver al inicio</button>
                    </div>
                  </div>
                `;
                return;
              }
            } catch (err) {
              console.error('Error checking maintenance mode:', err);
            }
          }
          
          const cat = data.user.cat || '';
          let titulo = 'Usuario';
          
          if(data.user.role === 'admin') {
            titulo = 'Administrador';
          } else if(cat === 'Pediatra') {
            titulo = 'Dr.(a) Especialista en Pediatría';
          } else if(cat === 'Médico General') {
            titulo = 'Dr.(a)';
          } else if(cat === 'Residente') {
            titulo = 'Dr.(a) Residente';
          } else if(cat === 'Interno') {
            titulo = 'Interno';
          } else if(cat === 'Estudiante') {
            titulo = 'Estudiante';
          }
          
          localStorage.setItem('nbr_pending_toast', JSON.stringify({
            msg:`¡Bienvenido(a), ${titulo} ${data.user.name||data.user.username}!`,
            type:'success',
            sound: true
          }));
          location.replace('main.html');
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const registerForm=document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit',async (e)=>{
      e.preventDefault();
      const firstName=document.getElementById('registerFirstName').value.trim();
      const lastName=document.getElementById('registerLastName').value.trim();
      const username=document.getElementById('registerUser').value.trim();
      const email=document.getElementById('registerEmail').value.trim();
      const cat=document.getElementById('registerCat').value;
      const phone=document.getElementById('registerPhone').value.trim();
      const institucion=document.getElementById('registerInst').value.trim();
      const password=document.getElementById('registerPass').value;
      const password2=document.getElementById('registerPassConfirm').value;
      
      if(password!==password2) return alert('Las contraseñas no coinciden');
      
      try {
        const data = await api('/register', {
          method: 'POST',
          body: JSON.stringify({firstName, lastName, username, email, cat, phone, institucion, password})
        });
        
        localStorage.setItem('nbr_pending_toast', JSON.stringify({
          msg: data.message,
          type:'info'
        }));
        location.replace('index.html');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const resetRequestForm = document.getElementById('resetRequestForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const requestBox = document.getElementById('requestBox');
  const resetBox = document.getElementById('resetBox');
  const tokenDisplay = document.getElementById('tokenDisplay');
  
  if(resetRequestForm) {
    resetRequestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('resetUser').value.trim();
      const email = document.getElementById('resetEmail').value.trim();
      
      try {
        const data = await api('/reset-password-request', {
          method: 'POST',
          body: JSON.stringify({username, email})
        });
        
        if(data.success) {
          if(data.token) {
            tokenDisplay.innerHTML = `<strong>Código de recuperación:</strong><br><code style="font-size:14px;user-select:all;">${data.token}</code><br><small style="color:var(--text-muted);margin-top:8px;display:block;">Guarda este código. Lo necesitarás para restablecer tu contraseña.</small>`;
            tokenDisplay.style.display = 'block';
            document.getElementById('resetToken').value = data.token;
          } else {
            tokenDisplay.innerHTML = `<strong>✓ Email enviado</strong><br><small style="color:var(--text-muted);margin-top:8px;display:block;">${data.message}</small>`;
            tokenDisplay.style.display = 'block';
          }
          requestBox.style.display = 'none';
          resetBox.style.display = 'block';
          toast(data.message, 'success');
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }
  
  if(resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('resetToken').value.trim();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if(newPassword !== confirmPassword) {
        return alert('Las contraseñas no coinciden');
      }
      
      try {
        const data = await api('/reset-password', {
          method: 'POST',
          body: JSON.stringify({token, newPassword})
        });
        
        if(data.success) {
          localStorage.setItem('nbr_pending_toast', JSON.stringify({
            msg: data.message,
            type:'success'
          }));
          location.replace('index.html');
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const raw=localStorage.getItem('nbr_pending_toast');
  if(raw){
    try{
      const d=JSON.parse(raw);
      toast(d.msg,d.type||'info',d.sound||false);
    }catch{}
    localStorage.removeItem('nbr_pending_toast');
  }

  const cfgForm=document.getElementById('cfgForm');
  if(cfgForm){
    try {
      const profile = await api('/profile');
      const $=id=>document.getElementById(id);
      
      $('cfgUser').value=profile.username;
      $('cfgName').value=profile.name||'';
      $('cfgCat').value=profile.cat||'';
      $('cfgMail').value=profile.email||'';
      $('cfgPhone').value=profile.phone||'';
      $('cfgInst').value=profile.institucion||'';
      
      const prev=$('avatarTopPreview');
      prev.src=profile.avatar||getDefaultAvatar();
      
      let cropState = null;
      const modalCrop = document.getElementById('modalCrop');
      const cropCanvas = document.getElementById('cropCanvas');
      const zoomSlider = document.getElementById('zoomSlider');
      const ctx = cropCanvas.getContext('2d');
      
      $('cfgAvatarFile').addEventListener('change',(e)=>{
        const f=e.target.files[0];
        if(!f)return;
        const r=new FileReader();
        r.onload=()=>{
          const img=new Image();
          img.onload=()=>{
            const containerW = 600;
            const containerH = 400;
            cropCanvas.width = containerW;
            cropCanvas.height = containerH;
            
            cropState = {
              img: img,
              x: 0,
              y: 0,
              scale: 1,
              dragging: false,
              lastX: 0,
              lastY: 0
            };
            
            const imgAspect = img.width / img.height;
            const containerAspect = containerW / containerH;
            
            if(imgAspect > containerAspect){
              cropState.baseScale = containerW / img.width;
            } else {
              cropState.baseScale = containerH / img.height;
            }
            
            cropState.scale = cropState.baseScale * 0.5;
            
            cropState.x = (containerW - img.width * cropState.scale) / 2;
            cropState.y = (containerH - img.height * cropState.scale) / 2;
            
            drawCropCanvas();
            modalCrop.style.display='flex';
            zoomSlider.value = 50;
            zoomSlider.dataset.lastValue = '50';
          };
          img.src=r.result;
        };
        r.readAsDataURL(f);
      });
      
      function drawCropCanvas(){
        if(!cropState)return;
        ctx.fillStyle='#000';
        ctx.fillRect(0,0,cropCanvas.width,cropCanvas.height);
        ctx.drawImage(
          cropState.img,
          cropState.x,
          cropState.y,
          cropState.img.width * cropState.scale,
          cropState.img.height * cropState.scale
        );
        
        ctx.strokeStyle='rgba(255,255,255,0.5)';
        ctx.lineWidth=2;
        const size = Math.min(cropCanvas.width, cropCanvas.height) - 40;
        const cropX = (cropCanvas.width - size) / 2;
        const cropY = (cropCanvas.height - size) / 2;
        ctx.strokeRect(cropX, cropY, size, size);
      }
      
      function getEventPos(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientX);
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      }

      cropCanvas.addEventListener('mousedown', (e)=>{
        if(!cropState)return;
        cropState.dragging=true;
        cropState.lastX=e.offsetX;
        cropState.lastY=e.offsetY;
      });
      
      cropCanvas.addEventListener('touchstart', (e)=>{
        if(!cropState)return;
        e.preventDefault();
        const pos = getEventPos(e, cropCanvas);
        cropState.dragging=true;
        cropState.lastX=pos.x;
        cropState.lastY=pos.y;
      }, {passive: false});
      
      cropCanvas.addEventListener('mousemove', (e)=>{
        if(!cropState || !cropState.dragging)return;
        const dx = e.offsetX - cropState.lastX;
        const dy = e.offsetY - cropState.lastY;
        cropState.x += dx;
        cropState.y += dy;
        cropState.lastX = e.offsetX;
        cropState.lastY = e.offsetY;
        drawCropCanvas();
      });

      cropCanvas.addEventListener('touchmove', (e)=>{
        if(!cropState || !cropState.dragging)return;
        e.preventDefault();
        const pos = getEventPos(e, cropCanvas);
        const dx = pos.x - cropState.lastX;
        const dy = pos.y - cropState.lastY;
        cropState.x += dx;
        cropState.y += dy;
        cropState.lastX = pos.x;
        cropState.lastY = pos.y;
        drawCropCanvas();
      }, {passive: false});
      
      cropCanvas.addEventListener('mouseup', ()=>{
        if(cropState)cropState.dragging=false;
      });

      cropCanvas.addEventListener('touchend', ()=>{
        if(cropState)cropState.dragging=false;
      });
      
      cropCanvas.addEventListener('mouseleave', ()=>{
        if(cropState)cropState.dragging=false;
      });
      
      zoomSlider.addEventListener('input', ()=>{
        if(!cropState)return;
        const lastValue = parseInt(zoomSlider.dataset.lastValue||'50');
        const newValue = parseInt(zoomSlider.value);
        const scaleFactor = newValue / lastValue;
        cropState.scale *= scaleFactor;
        zoomSlider.dataset.lastValue = newValue;
        drawCropCanvas();
      });
      
      document.getElementById('closeCrop').addEventListener('click', ()=>{
        modalCrop.style.display='none';
        cropState=null;
        $('cfgAvatarFile').value='';
      });
      
      document.getElementById('cancelCrop').addEventListener('click', ()=>{
        modalCrop.style.display='none';
        cropState=null;
        $('cfgAvatarFile').value='';
      });
      
      document.getElementById('applyCrop').addEventListener('click', async ()=>{
        if(!cropState)return;
        
        const size = Math.min(cropCanvas.width, cropCanvas.height) - 40;
        const cropX = (cropCanvas.width - size) / 2;
        const cropY = (cropCanvas.height - size) / 2;
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 512;
        outputCanvas.height = 512;
        const outCtx = outputCanvas.getContext('2d');
        
        outCtx.drawImage(
          cropCanvas,
          cropX, cropY, size, size,
          0, 0, 512, 512
        );
        
        const d = outputCanvas.toDataURL('image/jpeg',.9);
        prev.src=d;
        
        modalCrop.style.display='none';
        cropState=null;
        $('cfgAvatarFile').value='';
        
        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({avatar: d})
          });
          await fillTop();
          toast('Avatar actualizado.','success');
        } catch (err) {
          toast('Error al actualizar avatar.','error');
        }
      });
      
      $('cfgAvatarClear').addEventListener('click',async()=>{
        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({avatar: ''})
          });
          prev.src=getDefaultAvatar();
          await fillTop();
          toast('Avatar eliminado.','info');
        } catch (err) {
          toast('Error al eliminar avatar.','error');
        }
      });
      
      cfgForm.addEventListener('submit',async(e)=>{
        e.preventDefault();
        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({
              name: $('cfgName').value.trim(),
              cat: $('cfgCat').value,
              email: $('cfgMail').value.trim(),
              phone: $('cfgPhone').value.trim(),
              institucion: $('cfgInst').value.trim()
            })
          });
          await fillTop();
          toast('Perfil actualizado.','success');
        } catch (err) {
          toast('Error al actualizar perfil.','error');
        }
      });
    } catch (err) {
      console.error('Error loading config:', err);
    }
  }

  const cfgPasswordForm=document.getElementById('cfgPasswordForm');
  if(cfgPasswordForm){
    cfgPasswordForm.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const $=id=>document.getElementById(id);
      const currentPass=$('cfgCurrentPass').value;
      const newPass=$('cfgNewPass').value;
      const confirmPass=$('cfgConfirmPass').value;
      
      if(newPass!==confirmPass){
        toast('Las contraseñas no coinciden','error');
        return;
      }
      
      if(newPass.length<6){
        toast('La contraseña debe tener al menos 6 caracteres','error');
        return;
      }
      
      try {
        await api('/change-password', {
          method: 'POST',
          body: JSON.stringify({currentPassword: currentPass, newPassword: newPass})
        });
        toast('Contraseña actualizada correctamente','success');
        $('cfgCurrentPass').value='';
        $('cfgNewPass').value='';
        $('cfgConfirmPass').value='';
      } catch (err) {
        toast(err.message||'Error al cambiar contraseña','error');
      }
    });
  }

  const adminUsersTable=document.getElementById('adminUsersTable');
  const modalUser=document.getElementById('modalUser');
  const userForm=document.getElementById('userForm');
  let allUsers = [];
  
  function openModal(id, show){
    const el=document.getElementById(id);
    if(el) el.style.display=show?'flex':'none';
  }
  
  window.filterUsers = function() {
    const searchTerm = document.getElementById('searchUsers')?.value.toLowerCase() || '';
    const filterCat = document.getElementById('filterCategoria')?.value || '';
    const filterRole = document.getElementById('filterRol')?.value || '';
    const filterStat = document.getElementById('filterEstado')?.value || '';
    
    const filtered = allUsers.filter(u => {
      const matchesSearch = !searchTerm || 
        (u.username||'').toLowerCase().includes(searchTerm) ||
        (u.name||'').toLowerCase().includes(searchTerm) ||
        (u.email||'').toLowerCase().includes(searchTerm) ||
        (u.institucion||'').toLowerCase().includes(searchTerm);
      
      const matchesCat = !filterCat || (u.cat === filterCat);
      const matchesRole = !filterRole || (u.role === filterRole);
      const matchesStat = !filterStat || (u.status === filterStat);
      
      return matchesSearch && matchesCat && matchesRole && matchesStat;
    });
    
    displayUsers(filtered);
  };
  
  async function displayUsers(users) {
    const tb=adminUsersTable?.querySelector('tbody');
    if(!tb) return;
    
    try {
      const session = await checkSession();
      const me=session.username;
      
      tb.innerHTML=users.map(u=>{
        const status = u.status||'pendiente';
        const statusText = status.toUpperCase();
        let statusClass = 'chip';
        let statusStyle = '';
        
        if (status === 'aprobado') {
          statusStyle = 'background:#16a34a;color:#fff;';
        } else if (status === 'rechazado') {
          statusStyle = 'background:#dc2626;color:#fff;';
        } else if (status === 'pendiente') {
          statusClass = 'chip status-pendiente';
          statusStyle = 'background:#ff8c00;color:#fff;';
        } else if (status === 'suspendido') {
          statusStyle = 'background:#ff8c00;color:#fff;';
        }
        
        const roleText = (u.role||'user').toUpperCase();
        
        const isAdmin = u.username === 'admin';
        const fullName = (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : (u.name || '');
        const canDelete = u.username !== me && !isAdmin;
        const canModify = !isAdmin;
        
        return `<tr>
          <td>${u.username}</td>
          <td>${fullName}</td>
          <td>${u.cat||''}</td>
          <td>${u.email||''}</td>
          <td>${u.phone||''}</td>
          <td>${u.institucion||''}</td>
          <td>${roleText}</td>
          <td><span class='${statusClass}' style='${statusStyle}'>${statusText}</span></td>
          <td>
            <div class="action-menu">
              <button class="action-menu-btn" data-menu-toggle="${u.username}">⋮</button>
              <div class="action-menu-dropdown" data-menu="${u.username}">
                <div class="action-menu-item info" data-edit-user="${u.username}">
                  <span class="action-menu-icon">✏️</span>
                  <span>Editar</span>
                </div>
                <div class="action-menu-item success ${!canModify?'disabled':''}" data-approve="${u.username}">
                  <span class="action-menu-icon">✓</span>
                  <span>Aprobar</span>
                </div>
                <div class="action-menu-item warning ${!canModify?'disabled':''}" data-reject="${u.username}">
                  <span class="action-menu-icon">✗</span>
                  <span>Rechazar</span>
                </div>
                <div class="action-menu-item danger ${!canDelete?'disabled':''}" data-del-user="${u.username}">
                  <span class="action-menu-icon">🗑️</span>
                  <span>Eliminar</span>
                </div>
              </div>
            </div>
          </td>
        </tr>`;
      }).join('');
      
      await updateUsuariosPendientesCounter();
      await updateAdminNotifications();
      
      tb.querySelectorAll('[data-menu-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const username = btn.getAttribute('data-menu-toggle');
          const dropdown = tb.querySelector(`[data-menu="${username}"]`);
          const isOpen = dropdown.classList.contains('show');
          
          tb.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('show'));
          
          if (!isOpen) {
            dropdown.classList.add('show');
          }
        });
      });
      
      tb.querySelectorAll('[data-edit-user]').forEach(b=>b.addEventListener('click',async()=>{
        const username=b.getAttribute('data-edit-user');
        const users = await api('/users');
        const u=users.find(x=>x.username===username);
        if(!u) return;
        
        document.getElementById('u_username').value=u.username;
        document.getElementById('u_firstName').value=u.firstName||'';
        document.getElementById('u_lastName').value=u.lastName||'';
        document.getElementById('u_email').value=u.email||'';
        document.getElementById('u_phone').value=u.phone||'';
        document.getElementById('u_inst').value=u.institucion||'';
        document.getElementById('u_cat').value=u.cat||'';
        document.getElementById('u_role').value=u.role||'user';
        document.getElementById('u_status').value=u.status||'pendiente';
        
        if(username === 'admin'){
          document.getElementById('u_role').disabled = true;
          document.getElementById('u_status').disabled = true;
        } else {
          document.getElementById('u_role').disabled = false;
          document.getElementById('u_status').disabled = false;
        }
        
        openModal('modalUser',true);
      }));
      
      tb.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click',async()=>{
        const username=b.getAttribute('data-approve');
        try {
          await api(`/users/${username}`, {
            method: 'PUT',
            body: JSON.stringify({status: 'aprobado'})
          });
          await renderUsers();
          toast(`Usuario ${username} aprobado.`,'success');
        } catch (err) {
          toast('Error al aprobar usuario.','error');
        }
      }));
      
      tb.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click',async()=>{
        const username=b.getAttribute('data-reject');
        try {
          await api(`/users/${username}`, {
            method: 'PUT',
            body: JSON.stringify({status: 'rechazado'})
          });
          await renderUsers();
          toast(`Usuario ${username} rechazado.`,'info');
        } catch (err) {
          toast('Error al rechazar usuario.','error');
        }
      }));
      
      tb.querySelectorAll('[data-del-user]').forEach(b=>b.addEventListener('click',async()=>{
        const username=b.getAttribute('data-del-user');
        if(!confirm(`¿Eliminar usuario ${username}?`))return;
        try {
          await api(`/users/${username}`, {method: 'DELETE'});
          await renderUsers();
          toast(`Usuario ${username} eliminado.`,'info');
        } catch (err) {
          toast('Error al eliminar usuario.','error');
        }
      }));
    } catch (err) {
      console.error('Error rendering users:', err);
    }
  }
  
  async function renderUsers(){
    const tb=adminUsersTable?.querySelector('tbody');
    if(!tb) return;
    
    try {
      allUsers = await api('/users');
      await displayUsers(allUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }
  
  if(adminUsersTable) {
    await renderUsers();
    
    document.addEventListener('click', () => {
      const tb = adminUsersTable?.querySelector('tbody');
      if (tb) {
        tb.querySelectorAll('.action-menu-dropdown').forEach(d => d.classList.remove('show'));
      }
    });
  }
  
  if(userForm){
    userForm.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const username=document.getElementById('u_username').value;
      
      try {
        await api(`/users/${username}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstName: document.getElementById('u_firstName').value.trim(),
            lastName: document.getElementById('u_lastName').value.trim(),
            email: document.getElementById('u_email').value.trim(),
            phone: document.getElementById('u_phone').value.trim(),
            institucion: document.getElementById('u_inst').value.trim(),
            cat: document.getElementById('u_cat').value,
            role: document.getElementById('u_role').value,
            status: document.getElementById('u_status').value
          })
        });
        
        openModal('modalUser', false);
        await renderUsers();
        await fillTop();
        toast('Usuario actualizado.','success');
      } catch (err) {
        toast('Error al actualizar usuario.','error');
      }
    });
    
    document.querySelectorAll('[data-close-user]').forEach(x=>x.addEventListener('click',()=>openModal('modalUser',false)));
  }

  const adminAnTable=document.getElementById('adminAnunciosTable');
  const modalAn=document.getElementById('modalAnuncio');
  const anuncioForm=document.getElementById('anuncioForm');
  const btnNuevoAn=document.getElementById('btnNuevoAnuncio');
  
  async function renderAnunciosAdmin(){
    if(!adminAnTable) return;
    const tb=adminAnTable.querySelector('tbody');
    
    try {
      const list = await api('/anuncios');
      tb.innerHTML=list.map(a=>`<tr><td>${a.img && a.img.startsWith('data:')?`<img src='${a.img}' class='thumb' style='width:60px;height:60px;border-radius:8px;border:1px solid var(--border);object-fit:cover;'>`:''}</td><td>${a.titulo}</td><td>${a.fecha}</td><td><div style='display:flex;gap:6px;white-space:nowrap'><button class='btn sm info' data-edit-an='${a.id}'>Editar</button><button class='btn sm danger' data-del-an='${a.id}'>Eliminar</button></div></td></tr>`).join('');
      
      tb.querySelectorAll('[data-edit-an]').forEach(b=>b.addEventListener('click',()=>openAnuncio(b.getAttribute('data-edit-an'))));
      tb.querySelectorAll('[data-del-an]').forEach(b=>b.addEventListener('click',async()=>{
        const id=b.getAttribute('data-del-an');
        try {
          await api(`/anuncios/${id}`, {method: 'DELETE'});
          await renderAnunciosAdmin();
          await renderAnunciosMain();
          toast('Anuncio eliminado.','info');
        } catch (err) {
          toast('Error al eliminar anuncio.','error');
        }
      }));
    } catch (err) {
      console.error('Error rendering anuncios admin:', err);
    }
  }
  
  async function openAnuncio(id){
    try {
      const list = await api('/anuncios');
      const a=list.find(x=>x.id===id)||{id:'',titulo:'',fecha:'',texto:'',img:'',global:true};
      
      document.getElementById('anuncioId').value=a.id;
      document.getElementById('anuncioTitulo').value=a.titulo||'';
      document.getElementById('anuncioFecha').value=a.fecha||'';
      document.getElementById('anuncioTexto').value=a.texto||'';
      
      const preview = document.getElementById('anuncioPreview');
      if(a.img) {
        preview.src = a.img;
        preview.style.display = 'block';
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
      
      const globalCheckbox = document.getElementById('anuncioGlobal');
      if(globalCheckbox) {
        globalCheckbox.checked = a.global !== false;
      }
      
      modalAn.style.display='flex';
    } catch (err) {
      console.error('Error opening anuncio:', err);
    }
  }
  
  if(btnNuevoAn) btnNuevoAn.addEventListener('click',()=>openAnuncio(''));
  
  if(anuncioForm){
    let cropStateAnuncio = null;
    const modalCropAnuncio = document.getElementById('modalCropAnuncio');
    const cropCanvasAnuncio = document.getElementById('cropCanvasAnuncio');
    const zoomSliderAnuncio = document.getElementById('zoomSliderAnuncio');
    
    if(cropCanvasAnuncio) {
      const ctxAnuncio = cropCanvasAnuncio.getContext('2d');
      
      document.getElementById('anuncioImg').addEventListener('change',(e)=>{
        const f=e.target.files[0];
        if(!f) return;
        const r=new FileReader();
        r.onload=()=>{
          const img=new Image();
          img.onload=()=>{
            const containerW = 600;
            const containerH = 400;
            cropCanvasAnuncio.width = containerW;
            cropCanvasAnuncio.height = containerH;
            
            cropStateAnuncio = {
              img: img,
              x: 0,
              y: 0,
              scale: 1,
              dragging: false,
              lastX: 0,
              lastY: 0,
              baseScale: 1
            };
            
            const imgAspect = img.width / img.height;
            const containerAspect = containerW / containerH;
            
            if(imgAspect > containerAspect){
              cropStateAnuncio.baseScale = containerW / img.width;
            } else {
              cropStateAnuncio.baseScale = containerH / img.height;
            }
            
            cropStateAnuncio.scale = cropStateAnuncio.baseScale * 0.5;
            
            cropStateAnuncio.x = (containerW - img.width * cropStateAnuncio.scale) / 2;
            cropStateAnuncio.y = (containerH - img.height * cropStateAnuncio.scale) / 2;
            
            drawCropCanvasAnuncio();
            modalCropAnuncio.style.display='flex';
            zoomSliderAnuncio.value = 50;
            zoomSliderAnuncio.dataset.lastValue = '50';
          };
          img.src=r.result;
        };
        r.readAsDataURL(f);
      });
      
      function drawCropCanvasAnuncio(){
        if(!cropStateAnuncio)return;
        ctxAnuncio.fillStyle='#000';
        ctxAnuncio.fillRect(0,0,cropCanvasAnuncio.width,cropCanvasAnuncio.height);
        ctxAnuncio.drawImage(
          cropStateAnuncio.img,
          cropStateAnuncio.x,
          cropStateAnuncio.y,
          cropStateAnuncio.img.width * cropStateAnuncio.scale,
          cropStateAnuncio.img.height * cropStateAnuncio.scale
        );
        
        ctxAnuncio.strokeStyle='rgba(255,255,255,0.5)';
        ctxAnuncio.lineWidth=2;
        const size = Math.min(cropCanvasAnuncio.width, cropCanvasAnuncio.height) - 40;
        const cropX = (cropCanvasAnuncio.width - size) / 2;
        const cropY = (cropCanvasAnuncio.height - size) / 2;
        ctxAnuncio.strokeRect(cropX, cropY, size, size);
      }
      
      cropCanvasAnuncio.addEventListener('mousedown', (e)=>{
        if(!cropStateAnuncio)return;
        cropStateAnuncio.dragging=true;
        cropStateAnuncio.lastX=e.offsetX;
        cropStateAnuncio.lastY=e.offsetY;
      });

      cropCanvasAnuncio.addEventListener('touchstart', (e)=>{
        if(!cropStateAnuncio)return;
        e.preventDefault();
        const pos = getEventPos(e, cropCanvasAnuncio);
        cropStateAnuncio.dragging=true;
        cropStateAnuncio.lastX=pos.x;
        cropStateAnuncio.lastY=pos.y;
      }, {passive: false});
      
      cropCanvasAnuncio.addEventListener('mousemove', (e)=>{
        if(!cropStateAnuncio || !cropStateAnuncio.dragging)return;
        const dx = e.offsetX - cropStateAnuncio.lastX;
        const dy = e.offsetY - cropStateAnuncio.lastY;
        cropStateAnuncio.x += dx;
        cropStateAnuncio.y += dy;
        cropStateAnuncio.lastX = e.offsetX;
        cropStateAnuncio.lastY = e.offsetY;
        drawCropCanvasAnuncio();
      });

      cropCanvasAnuncio.addEventListener('touchmove', (e)=>{
        if(!cropStateAnuncio || !cropStateAnuncio.dragging)return;
        e.preventDefault();
        const pos = getEventPos(e, cropCanvasAnuncio);
        const dx = pos.x - cropStateAnuncio.lastX;
        const dy = pos.y - cropStateAnuncio.lastY;
        cropStateAnuncio.x += dx;
        cropStateAnuncio.y += dy;
        cropStateAnuncio.lastX = pos.x;
        cropStateAnuncio.lastY = pos.y;
        drawCropCanvasAnuncio();
      }, {passive: false});
      
      cropCanvasAnuncio.addEventListener('mouseup', ()=>{
        if(cropStateAnuncio)cropStateAnuncio.dragging=false;
      });

      cropCanvasAnuncio.addEventListener('touchend', ()=>{
        if(cropStateAnuncio)cropStateAnuncio.dragging=false;
      });
      
      cropCanvasAnuncio.addEventListener('mouseleave', ()=>{
        if(cropStateAnuncio)cropStateAnuncio.dragging=false;
      });
      
      zoomSliderAnuncio.addEventListener('input', ()=>{
        if(!cropStateAnuncio)return;
        const lastValue = parseInt(zoomSliderAnuncio.dataset.lastValue||'50');
        const newValue = parseInt(zoomSliderAnuncio.value);
        const scaleFactor = newValue / lastValue;
        cropStateAnuncio.scale *= scaleFactor;
        zoomSliderAnuncio.dataset.lastValue = newValue;
        drawCropCanvasAnuncio();
      });
      
      document.getElementById('closeCropAnuncio').addEventListener('click', ()=>{
        modalCropAnuncio.style.display='none';
        cropStateAnuncio=null;
        document.getElementById('anuncioImg').value='';
      });
      
      document.getElementById('cancelCropAnuncio').addEventListener('click', ()=>{
        modalCropAnuncio.style.display='none';
        cropStateAnuncio=null;
        document.getElementById('anuncioImg').value='';
      });
      
      document.getElementById('applyCropAnuncio').addEventListener('click', ()=>{
        if(!cropStateAnuncio)return;
        
        const size = Math.min(cropCanvasAnuncio.width, cropCanvasAnuncio.height) - 40;
        const cropX = (cropCanvasAnuncio.width - size) / 2;
        const cropY = (cropCanvasAnuncio.height - size) / 2;
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 512;
        outputCanvas.height = 512;
        const outCtx = outputCanvas.getContext('2d');
        
        outCtx.drawImage(
          cropCanvasAnuncio,
          cropX, cropY, size, size,
          0, 0, 512, 512
        );
        
        const d = outputCanvas.toDataURL('image/jpeg',.9);
        const preview = document.getElementById('anuncioPreview');
        preview.src=d;
        preview.style.display='block';
        
        modalCropAnuncio.style.display='none';
        cropStateAnuncio=null;
        document.getElementById('anuncioImg').value='';
      });
    }
    
    document.getElementById('btnAnuncioQuitarImg').addEventListener('click',()=>{
      const preview = document.getElementById('anuncioPreview');
      preview.src='';
      preview.style.display='none';
    });
    
    anuncioForm.addEventListener('submit',async(e)=>{
      e.preventDefault();
      
      const globalCheckbox = document.getElementById('anuncioGlobal');
      const preview = document.getElementById('anuncioPreview');
      const imgSrc = preview.src && preview.src.startsWith('data:') ? preview.src : '';
      
      const obj={
        id: document.getElementById('anuncioId').value||undefined,
        titulo: document.getElementById('anuncioTitulo').value.trim(),
        fecha: document.getElementById('anuncioFecha').value||new Date().toISOString().slice(0,10),
        texto: document.getElementById('anuncioTexto').value.trim(),
        img: imgSrc,
        global: globalCheckbox ? globalCheckbox.checked : true
      };
      
      try {
        await api('/anuncios', {
          method: 'POST',
          body: JSON.stringify(obj)
        });
        
        modalAn.style.display='none';
        await renderAnunciosAdmin();
        await renderAnunciosMain();
        toast('Anuncio guardado.','success');
      } catch (err) {
        toast('Error al guardar anuncio.','error');
      }
    });
    
    document.querySelectorAll('[data-close-anuncio]').forEach(x=>x.addEventListener('click',()=>modalAn.style.display='none'));
  }
  
  if(adminAnTable) await renderAnunciosAdmin();

  const adminGTable=document.getElementById('adminGuiasTable');
  const modalG=document.getElementById('modalGuia');
  const guiaForm=document.getElementById('guiaForm');
  const btnNuevaG=document.getElementById('btnNuevaGuia');
  
  async function renderGuiasAdmin(){
    if(!adminGTable) return;
    const tb=adminGTable.querySelector('tbody');
    
    try {
      const list = await api('/guias');
      tb.innerHTML=list.map(g=>`<tr><td>${g.titulo}</td><td>${g.fecha}</td><td>${g.url?`<a href='${g.url}' target='_blank'>Abrir</a>`:''}</td><td><div style='display:flex;gap:6px;white-space:nowrap'><button class='btn sm info' data-edit-g='${g.id}'>Editar</button><button class='btn sm danger' data-del-g='${g.id}'>Eliminar</button></div></td></tr>`).join('');
      
      tb.querySelectorAll('[data-edit-g]').forEach(b=>b.addEventListener('click',()=>openGuia(b.getAttribute('data-edit-g'))));
      tb.querySelectorAll('[data-del-g]').forEach(b=>b.addEventListener('click',async()=>{
        const id=b.getAttribute('data-del-g');
        try {
          await api(`/guias/${id}`, {method: 'DELETE'});
          await renderGuiasAdmin();
          await renderGuiasMain();
          toast('Guía eliminada.','info');
        } catch (err) {
          toast('Error al eliminar guía.','error');
        }
      }));
    } catch (err) {
      console.error('Error rendering guias admin:', err);
    }
  }
  
  async function openGuia(id){
    try {
      const list = await api('/guias');
      const g=list.find(x=>x.id===id)||{id:'',titulo:'',fecha:'',texto:'',url:'',global:true};
      
      document.getElementById('guiaId').value=g.id;
      document.getElementById('guiaTitulo').value=g.titulo||'';
      document.getElementById('guiaFecha').value=g.fecha||'';
      document.getElementById('guiaTexto').value=g.texto||'';
      document.getElementById('guiaURL').value=g.url||'';
      
      const globalCheckbox = document.getElementById('guiaGlobal');
      if(globalCheckbox) {
        globalCheckbox.checked = g.global !== false;
      }
      
      modalG.style.display='flex';
    } catch (err) {
      console.error('Error opening guia:', err);
    }
  }
  
  if(btnNuevaG) btnNuevaG.addEventListener('click',()=>openGuia(''));
  
  if(guiaForm){
    guiaForm.addEventListener('submit',async(e)=>{
      e.preventDefault();
      
      const globalCheckbox = document.getElementById('guiaGlobal');
      const g={
        id: document.getElementById('guiaId').value||undefined,
        titulo: document.getElementById('guiaTitulo').value.trim(),
        fecha: document.getElementById('guiaFecha').value||new Date().toISOString().slice(0,10),
        texto: document.getElementById('guiaTexto').value.trim(),
        url: document.getElementById('guiaURL').value.trim(),
        global: globalCheckbox ? globalCheckbox.checked : true
      };
      
      try {
        await api('/guias', {
          method: 'POST',
          body: JSON.stringify(g)
        });
        
        modalG.style.display='none';
        await renderGuiasAdmin();
        await renderGuiasMain();
        toast('Guía guardada.','success');
      } catch (err) {
        toast('Error al guardar guía.','error');
      }
    });
    
    document.querySelectorAll('[data-close-guia]').forEach(x=>x.addEventListener('click',()=>modalG.style.display='none'));
  }
  
  if(adminGTable) await renderGuiasAdmin();

  let anunciosRotationInterval = null;
  let currentAnuncioIndex = 0;
  let anunciosList = [];

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showAnuncio(index) {
    const items = document.querySelectorAll('.anuncio-item');
    const indicators = document.querySelectorAll('.anuncio-indicator');
    
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    
    currentAnuncioIndex = index;
  }

  function nextAnuncio() {
    const nextIndex = (currentAnuncioIndex + 1) % anunciosList.length;
    showAnuncio(nextIndex);
  }

  function prevAnuncio() {
    const prevIndex = (currentAnuncioIndex - 1 + anunciosList.length) % anunciosList.length;
    showAnuncio(prevIndex);
  }

  async function renderAnunciosMain(){
    const cont=document.getElementById('anunciosList');
    if(!cont) return;
    
    if(anunciosRotationInterval) {
      clearInterval(anunciosRotationInterval);
    }
    
    try {
      const list = await api('/anuncios');
      anunciosList = list.sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
      
      if(anunciosList.length === 0) {
        cont.innerHTML = '<div class="text-muted" style="padding:20px;text-align:center;">No hay anuncios disponibles</div>';
        return;
      }
      
      const anunciosHtml = anunciosList.map((a, index) => `
        <article class='anuncio-item${index === 0 ? ' active' : ''}'>
          <div class='anuncio-header'>
            <h3 class='anuncio-titulo'>${escapeHtml(a.titulo)}</h3>
            <span class='anuncio-fecha'>${a.fecha || 'Sin fecha'}</span>
          </div>
          <div class='anuncio-body'>
            ${a.img && a.img.startsWith('data:') ? 
              `<img src='${a.img}' alt='${escapeHtml(a.titulo)}' class='anuncio-imagen'>` : 
              ''}
            <div class='anuncio-texto'>${escapeHtml(a.texto)}</div>
          </div>
        </article>
      `).join('');
      
      const indicators = anunciosList.map((_, index) => 
        `<div class='anuncio-indicator${index === 0 ? ' active' : ''}' data-index='${index}'></div>`
      ).join('');
      
      cont.innerHTML = `
        <div class='anuncios-container'>
          ${anunciosHtml}
        </div>
        ${anunciosList.length > 1 ? `
          <div class='anuncios-controls'>
            <button class='anuncio-nav-btn' id='prevAnuncio' type='button'>◀</button>
            <div class='anuncios-indicators'>
              ${indicators}
            </div>
            <button class='anuncio-nav-btn' id='nextAnuncio' type='button'>▶</button>
          </div>
        ` : ''}
      `;
      
      if(anunciosList.length > 1) {
        document.getElementById('prevAnuncio')?.addEventListener('click', prevAnuncio);
        document.getElementById('nextAnuncio')?.addEventListener('click', nextAnuncio);
        
        document.querySelectorAll('.anuncio-indicator').forEach(ind => {
          ind.addEventListener('click', () => {
            const index = parseInt(ind.getAttribute('data-index'));
            showAnuncio(index);
            if(anunciosRotationInterval) {
              clearInterval(anunciosRotationInterval);
              anunciosRotationInterval = setInterval(nextAnuncio, 30000);
            }
          });
        });
        
        currentAnuncioIndex = 0;
        anunciosRotationInterval = setInterval(nextAnuncio, 30000);
      }
      
    } catch (err) {
      console.error('Error rendering anuncios main:', err);
    }
  }
  
  let guiasRotationInterval = null;
  let currentGuiaIndex = 0;
  let guiasList = [];

  function showGuia(index) {
    const items = document.querySelectorAll('.guia-item');
    const indicators = document.querySelectorAll('.guia-indicator');
    
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    
    currentGuiaIndex = index;
  }

  function nextGuia() {
    const nextIndex = (currentGuiaIndex + 1) % guiasList.length;
    showGuia(nextIndex);
  }

  function prevGuia() {
    const prevIndex = (currentGuiaIndex - 1 + guiasList.length) % guiasList.length;
    showGuia(prevIndex);
  }

  async function renderGuiasMain(){
    const cont=document.getElementById('guiasList');
    if(!cont) return;
    
    if(guiasRotationInterval) {
      clearInterval(guiasRotationInterval);
    }
    
    try {
      const list = await api('/guias');
      guiasList = list.sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
      
      if(guiasList.length === 0) {
        cont.innerHTML = '<div class="text-muted" style="padding:20px;text-align:center;">No hay guías disponibles</div>';
        return;
      }
      
      const guiasHtml = guiasList.map((g, index) => `
        <article class='guia-item${index === 0 ? ' active' : ''}'>
          <div class='anuncio-header'>
            <h3 class='anuncio-titulo'>${escapeHtml(g.titulo)}</h3>
            <span class='anuncio-fecha'>${g.fecha || 'Sin fecha'}</span>
          </div>
          <div class='anuncio-body'>
            <div class='anuncio-texto'>${escapeHtml(g.texto)}</div>
          </div>
          ${g.url ? `<div style='margin-top:16px;padding-top:16px;border-top:1px solid var(--border);'><a class='btn sm' target='_blank' href='${g.url}'>Abrir guía completa</a></div>` : ''}
        </article>
      `).join('');
      
      const indicators = guiasList.map((_, index) => 
        `<div class='guia-indicator${index === 0 ? ' active' : ''}' data-index='${index}'></div>`
      ).join('');
      
      cont.innerHTML = `
        <div class='anuncios-container'>
          ${guiasHtml}
        </div>
        ${guiasList.length > 1 ? `
          <div class='anuncios-controls'>
            <button class='anuncio-nav-btn' id='prevGuia' type='button'>◀</button>
            <div class='anuncios-indicators'>
              ${indicators}
            </div>
            <button class='anuncio-nav-btn' id='nextGuia' type='button'>▶</button>
          </div>
        ` : ''}
      `;
      
      if(guiasList.length > 1) {
        document.getElementById('prevGuia')?.addEventListener('click', prevGuia);
        document.getElementById('nextGuia')?.addEventListener('click', nextGuia);
        
        document.querySelectorAll('.guia-indicator').forEach(ind => {
          ind.addEventListener('click', () => {
            const index = parseInt(ind.getAttribute('data-index'));
            showGuia(index);
            if(guiasRotationInterval) {
              clearInterval(guiasRotationInterval);
              guiasRotationInterval = setInterval(nextGuia, 30000);
            }
          });
        });
        
        currentGuiaIndex = 0;
        guiasRotationInterval = setInterval(nextGuia, 30000);
      }
      
    } catch (err) {
      console.error('Error rendering guias main:', err);
    }
  }
  
  window.verTodasGuias = async function() {
    try {
      const list = await api('/guias');
      const guias = list.sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
      
      if(guias.length === 0) {
        toast('No hay guías disponibles', 'info');
        return;
      }
      
      const modalContent = `
        <div class="modal-overlay" onclick="this.remove()">
          <div class="modal glass" onclick="event.stopPropagation()" style="max-width:900px;max-height:90vh;overflow-y:auto;">
            <header>
              <h3>📚 Todas las Guías de Pediatría & Neonatología</h3>
              <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" type="button">✕</button>
            </header>
            <div class="stack" style="gap:16px;margin-top:20px;">
              ${guias.map(g => `
                <div class="card" style="padding:20px;background:var(--card);border:1px solid var(--border);border-radius:12px;transition:all 0.3s;">
                  <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
                    <h4 style="margin:0;font-size:18px;font-weight:700;color:var(--text);flex:1;">${escapeHtml(g.titulo)}</h4>
                    <span style="font-size:13px;color:var(--muted);white-space:nowrap;">${g.fecha || 'Sin fecha'}</span>
                  </div>
                  <p style="margin:0 0 16px 0;color:var(--muted);line-height:1.6;">${escapeHtml(g.texto)}</p>
                  ${g.url ? `<a class="btn sm" target="_blank" href="${g.url}" style="display:inline-flex;align-items:center;gap:6px;">Abrir guía completa <span>→</span></a>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalContent);
    } catch (err) {
      console.error('Error loading all guias:', err);
      toast('Error al cargar las guías', 'error');
    }
  };
  
  await renderAnunciosMain();
  await renderGuiasMain();

  const drugTable = document.getElementById('drugTable');
  const drugSearch = document.getElementById('drugSearch');
  
  async function renderDrugs(filter='') {
    if(!drugTable) return;
    const tbody = drugTable.querySelector('tbody');
    
    try {
      const list = await api('/medications');
      const filtered = filter ? list.filter(d => 
        d.nombre.toLowerCase().includes(filter.toLowerCase()) ||
        d.grupo.toLowerCase().includes(filter.toLowerCase()) ||
        d.comentarios.toLowerCase().includes(filter.toLowerCase())
      ) : list;
      
      tbody.innerHTML = filtered.sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(d => 
        `<tr><td><strong>${d.nombre}</strong></td><td>${d.grupo}</td><td>${d.dilucion}</td><td class='text-muted'>${d.comentarios}</td></tr>`
      ).join('');
    } catch (err) {
      console.error('Error rendering drugs:', err);
    }
  }
  
  if(drugSearch) {
    drugSearch.addEventListener('input', (e) => renderDrugs(e.target.value));
  }
  await renderDrugs();

  const adminMedsTable = document.getElementById('adminMedicamentosTable');
  const modalMed = document.getElementById('modalMedicamento');
  const medForm = document.getElementById('medicamentoForm');
  const btnNuevoMed = document.getElementById('btnNuevoMedicamento');
  
  async function renderMedsAdmin() {
    if(!adminMedsTable) return;
    const tbody = adminMedsTable.querySelector('tbody');
    
    try {
      const list = await api('/medications');
      tbody.innerHTML = list.sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(m => 
        `<tr><td>${m.nombre}</td><td>${m.grupo}</td><td>${m.dilucion}</td><td>${m.comentarios}</td><td><div style='display:flex;gap:6px;white-space:nowrap'><button class='btn sm info' data-edit-med='${m.id}'>Editar</button><button class='btn sm danger' data-del-med='${m.id}'>Eliminar</button></div></td></tr>`
      ).join('');
      
      tbody.querySelectorAll('[data-edit-med]').forEach(b => b.addEventListener('click', () => openMedicamento(b.getAttribute('data-edit-med'))));
      tbody.querySelectorAll('[data-del-med]').forEach(b => b.addEventListener('click', async () => {
        const id = b.getAttribute('data-del-med');
        if(!confirm('¿Eliminar este medicamento?')) return;
        
        try {
          await api(`/medications/${id}`, {method: 'DELETE'});
          await renderMedsAdmin();
          await renderDrugs();
          toast('Medicamento eliminado.', 'info');
        } catch (err) {
          toast('Error al eliminar medicamento.', 'error');
        }
      }));
    } catch (err) {
      console.error('Error rendering meds admin:', err);
    }
  }
  
  async function openMedicamento(id) {
    try {
      const list = await api('/medications');
      const m = list.find(x => x.id === id) || {id:'', nombre:'', grupo:'', dilucion:'', comentarios:''};
      
      document.getElementById('medId').value = m.id;
      document.getElementById('medNombre').value = m.nombre || '';
      document.getElementById('medGrupo').value = m.grupo || '';
      document.getElementById('medDilucion').value = m.dilucion || '';
      document.getElementById('medComentarios').value = m.comentarios || '';
      modalMed.style.display = 'flex';
    } catch (err) {
      console.error('Error opening medicamento:', err);
    }
  }
  
  if(btnNuevoMed) btnNuevoMed.addEventListener('click', () => openMedicamento(''));
  
  if(medForm) {
    medForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const obj = {
        id: document.getElementById('medId').value||undefined,
        nombre: document.getElementById('medNombre').value.trim(),
        grupo: document.getElementById('medGrupo').value.trim(),
        dilucion: document.getElementById('medDilucion').value.trim(),
        comentarios: document.getElementById('medComentarios').value.trim()
      };
      
      try {
        await api('/medications', {
          method: 'POST',
          body: JSON.stringify(obj)
        });
        
        modalMed.style.display = 'none';
        await renderMedsAdmin();
        await renderDrugs();
        toast('Medicamento guardado.', 'success');
      } catch (err) {
        toast('Error al guardar medicamento.', 'error');
      }
    });
    
    document.querySelectorAll('[data-close-med]').forEach(x => x.addEventListener('click', () => modalMed.style.display = 'none'));
  }
  
  if(adminMedsTable) await renderMedsAdmin();

  const sugerenciaForm = document.getElementById('sugerenciaForm');
  const sugerenciaTexto = document.getElementById('sugerenciaTexto');
  const charCount = document.getElementById('charCount');
  const misSugerenciasList = document.getElementById('misSugerenciasList');

  if(sugerenciaTexto && charCount) {
    sugerenciaTexto.addEventListener('input', () => {
      charCount.textContent = sugerenciaTexto.value.length;
    });
  }

  let lastUserSugerenciasCount = 0;

  async function updateUserSugerenciasNotifications() {
    const sugerenciasBadge = document.getElementById('sugerenciasBadge');
    const sugerenciasNavLink = document.querySelector('a[href="sugerencias.html"]');
    if(!sugerenciasBadge || !sugerenciasNavLink) return;

    try {
      const session = await checkSession();
      if(session.role === 'admin') {
        sugerenciasBadge.style.display = 'none';
        sugerenciasNavLink.classList.remove('has-notifications');
        return;
      }

      const list = await api('/sugerencias');
      const respuestasNuevas = list.filter(s => s.respondida && !s.vista).length;

      if(respuestasNuevas > 0) {
        if(respuestasNuevas > lastUserSugerenciasCount && lastUserSugerenciasCount >= 0) {
          toast('¡Tienes una nueva respuesta a tu sugerencia!', 'success', true);
        }
        sugerenciasBadge.textContent = respuestasNuevas;
        sugerenciasBadge.style.display = 'inline-block';
        sugerenciasNavLink.classList.add('has-notifications');
      } else {
        sugerenciasBadge.style.display = 'none';
        sugerenciasNavLink.classList.remove('has-notifications');
      }

      lastUserSugerenciasCount = respuestasNuevas;
    } catch (err) {
      console.error('Error updating user sugerencias notifications:', err);
    }
  }

  async function renderMisSugerencias() {
    if(!misSugerenciasList) return;

    try {
      const list = await api('/sugerencias');
      const sorted = list.sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
      
      if(sorted.length === 0) {
        misSugerenciasList.innerHTML = '<p class="text-muted">No has enviado sugerencias aún.</p>';
        return;
      }

      misSugerenciasList.innerHTML = sorted.map(s => `
        <div class="glass" style="padding:12px;border-radius:12px;margin-bottom:12px;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <span class="chip">${new Date(s.fecha).toLocaleDateString()}</span>
            <span class="chip" style="background:${s.respondida?'#16a34a':'#ff8c00'};color:#fff;">${s.respondida?'CONTESTADA':'PENDIENTE'}</span>
          </div>
          <div style="margin-bottom:8px;"><strong>Tu mensaje:</strong><br>${s.mensaje}</div>
          ${s.respondida?`<div style="padding:10px;border-left:3px solid var(--primary);background:rgba(var(--primary-rgb),0.1);border-radius:6px;"><strong>Respuesta del administrador:</strong><br>${s.respuesta}</div>`:''}
        </div>
      `).join('');
      
      await updateUserSugerenciasNotifications();
    } catch (err) {
      console.error('Error rendering mis sugerencias:', err);
    }
  }

  if(sugerenciaForm) {
    sugerenciaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mensaje = sugerenciaTexto.value.trim();
      if(!mensaje) return;

      try {
        await api('/sugerencias', {
          method: 'POST',
          body: JSON.stringify({mensaje})
        });

        toast('Sugerencia enviada correctamente.', 'success');
        sugerenciaTexto.value = '';
        charCount.textContent = '0';
        await renderMisSugerencias();
      } catch (err) {
        toast('Error al enviar sugerencia.', 'error');
      }
    });
  }

  if(misSugerenciasList) await renderMisSugerencias();

  const adminSugerenciasTable = document.getElementById('adminSugerenciasTable');
  const modalSugerencia = document.getElementById('modalSugerencia');
  const sugerenciaAdminForm = document.getElementById('sugerenciaAdminForm');
  const sugerenciasCounter = document.getElementById('sugerenciasCounter');

  let lastSugerenciasCount = 0;

  async function updateSugerenciasCounter() {
    if(!sugerenciasCounter) return;

    try {
      const data = await api('/sugerencias/count');
      const count = data.count || 0;

      if(count > 0) {
        sugerenciasCounter.textContent = count;
        sugerenciasCounter.style.display = 'inline-block';

        if(count > lastSugerenciasCount && lastSugerenciasCount > 0) {
          toast('Nueva sugerencia recibida', 'info', true);
        }
      } else {
        sugerenciasCounter.style.display = 'none';
      }

      lastSugerenciasCount = count;
      await updateAdminNotifications();
    } catch (err) {
      console.error('Error updating sugerencias counter:', err);
    }
  }

  async function updateUsuariosPendientesCounter() {
    const usuariosPendientesCounter = document.getElementById('usuariosPendientesCounter');
    if(!usuariosPendientesCounter) return 0;

    try {
      const users = await api('/users');
      const pendientes = users.filter(u => u.status === 'pendiente').length;

      if(pendientes > 0) {
        usuariosPendientesCounter.textContent = pendientes;
        usuariosPendientesCounter.style.display = 'inline-block';
      } else {
        usuariosPendientesCounter.style.display = 'none';
      }

      return pendientes;
    } catch (err) {
      console.error('Error updating usuarios pendientes counter:', err);
      return 0;
    }
  }

  let lastAdminNotifications = 0;

  async function updateAdminNotifications() {
    const adminBadge = document.getElementById('adminBadge');
    const adminNavLink = document.getElementById('adminNavLink');
    if(!adminBadge || !adminNavLink) return;

    const session = await checkSession();
    if(!session || session.role !== 'admin') {
      adminBadge.style.display = 'none';
      if(adminNavLink) adminNavLink.classList.remove('has-notifications');
      return;
    }

    try {
      const sugerenciasData = await api('/sugerencias/count');
      const sugerenciasPendientes = sugerenciasData.count || 0;

      const users = await api('/users');
      const usuariosPendientes = users.filter(u => u.status === 'pendiente').length;

      const totalNotificaciones = sugerenciasPendientes + usuariosPendientes;

      if(totalNotificaciones > 0) {
        if(totalNotificaciones > lastAdminNotifications && lastAdminNotifications > 0) {
          toast('Nueva notificación', 'info', true);
        }
        adminBadge.textContent = totalNotificaciones;
        adminBadge.style.display = 'inline-block';
        adminNavLink.classList.add('has-notifications');
      } else {
        adminBadge.style.display = 'none';
        adminNavLink.classList.remove('has-notifications');
      }
      
      lastAdminNotifications = totalNotificaciones;
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  }

  async function renderSugerenciasAdmin() {
    if(!adminSugerenciasTable) return;
    const tbody = adminSugerenciasTable.querySelector('tbody');

    try {
      const list = await api('/sugerencias');
      const sorted = list.sort((a,b)=>{
        if(a.respondida !== b.respondida) return a.respondida ? 1 : -1;
        return (b.fecha||'').localeCompare(a.fecha||'');
      });

      tbody.innerHTML = sorted.map(s => {
        const statusStyle = s.respondida ? 'background:#16a34a;color:#fff;' : 'background:#ff8c00;color:#fff;';
        const statusText = s.respondida ? 'CONTESTADA' : 'PENDIENTE';
        return `<tr>
          <td>${s.username}</td>
          <td>${new Date(s.fecha).toLocaleDateString()}</td>
          <td>${s.mensaje}</td>
          <td>${s.respuesta||'-'}</td>
          <td><div style='display:flex;gap:6px;white-space:nowrap'>
            <span class='chip' style='${statusStyle}'>${statusText}</span>
            <button class='btn sm info' data-resp-sug='${s.id}'>Responder</button>
            <button class='btn sm danger' data-del-sug='${s.id}'>Eliminar</button>
          </div></td>
        </tr>`;
      }).join('');

      tbody.querySelectorAll('[data-resp-sug]').forEach(b => b.addEventListener('click', () => openSugerencia(b.getAttribute('data-resp-sug'))));
      tbody.querySelectorAll('[data-del-sug]').forEach(b => b.addEventListener('click', async () => {
        const id = b.getAttribute('data-del-sug');
        if(!confirm('¿Eliminar esta sugerencia?')) return;

        try {
          await api(`/sugerencias/${id}`, {method: 'DELETE'});
          await renderSugerenciasAdmin();
          await updateSugerenciasCounter();
          toast('Sugerencia eliminada.', 'info');
        } catch (err) {
          toast('Error al eliminar sugerencia.', 'error');
        }
      }));

      await updateSugerenciasCounter();
    } catch (err) {
      console.error('Error rendering sugerencias admin:', err);
    }
  }

  async function openSugerencia(id) {
    try {
      const list = await api('/sugerencias');
      const s = list.find(x => x.id === id);
      if(!s) return;

      document.getElementById('sug_id').value = s.id;
      document.getElementById('sug_username').value = s.username;
      document.getElementById('sug_mensaje').value = s.mensaje;
      document.getElementById('sug_respuesta').value = s.respuesta || '';
      modalSugerencia.style.display = 'flex';
    } catch (err) {
      console.error('Error opening sugerencia:', err);
    }
  }

  window.usarRespuestaPredeterminada = function() {
    const respuestaTextarea = document.getElementById('sug_respuesta');
    const respuestaPredeterminada = 'Muchas gracias por tu sugerencia. Hemos tomado nota de tus comentarios y trabajaremos para implementar las mejoras necesarias. Tu retroalimentación es muy valiosa para nosotros.';
    respuestaTextarea.value = respuestaPredeterminada;
    respuestaTextarea.focus();
  }

  if(sugerenciaAdminForm) {
    sugerenciaAdminForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('sug_id').value;
      const respuesta = document.getElementById('sug_respuesta').value.trim();

      if(!respuesta) {
        toast('Debes escribir una respuesta.', 'error');
        return;
      }

      try {
        await api(`/sugerencias/${id}`, {
          method: 'PUT',
          body: JSON.stringify({respuesta})
        });

        modalSugerencia.style.display = 'none';
        await renderSugerenciasAdmin();
        await updateSugerenciasCounter();
        toast('Respuesta guardada.', 'success');
      } catch (err) {
        toast('Error al guardar respuesta.', 'error');
      }
    });

    document.querySelectorAll('[data-close-sugerencia]').forEach(x => x.addEventListener('click', () => modalSugerencia.style.display = 'none'));
  }

  if(adminSugerenciasTable) {
    await renderSugerenciasAdmin();
    setInterval(updateSugerenciasCounter, 10000);
  }

  const toggleMantenimiento = document.getElementById('toggleMantenimiento');
  const mantenimientoStatus = document.getElementById('mantenimientoStatus');
  const mantenimientoMensajeSection = document.getElementById('mantenimientoMensajeSection');

  async function loadMantenimientoStatus() {
    if(!toggleMantenimiento) return;
    
    try {
      const maintenance = await api('/maintenance');
      
      toggleMantenimiento.checked = maintenance.active;
      document.getElementById('mantenimientoMensaje').value = maintenance.message;
      
      if(maintenance.active) {
        mantenimientoStatus.textContent = 'ACTIVO';
        mantenimientoStatus.style.background = '#ef4444';
        mantenimientoMensajeSection.style.display = 'block';
      } else {
        mantenimientoStatus.textContent = 'INACTIVO';
        mantenimientoStatus.style.background = '#10b981';
        mantenimientoMensajeSection.style.display = 'none';
      }
    } catch (err) {
      console.error('Error loading maintenance status:', err);
    }
  }

  if(toggleMantenimiento) {
    toggleMantenimiento.addEventListener('change', async () => {
      const isActive = toggleMantenimiento.checked;
      const mensaje = document.getElementById('mantenimientoMensaje').value.trim();
      
      try {
        await api('/maintenance', {
          method: 'PUT',
          body: JSON.stringify({active: isActive, message: mensaje})
        });
        
        if(isActive) {
          mantenimientoStatus.textContent = 'ACTIVO';
          mantenimientoStatus.style.background = '#ef4444';
          mantenimientoMensajeSection.style.display = 'block';
          toast('Modo mantenimiento activado', 'warning');
        } else {
          mantenimientoStatus.textContent = 'INACTIVO';
          mantenimientoStatus.style.background = '#10b981';
          mantenimientoMensajeSection.style.display = 'none';
          toast('Modo mantenimiento desactivado', 'success');
        }
      } catch (err) {
        console.error('Error updating maintenance status:', err);
        toast('Error al actualizar modo mantenimiento', 'error');
        toggleMantenimiento.checked = !isActive;
      }
    });
    
    loadMantenimientoStatus();
  }

  window.guardarMantenimiento = async function() {
    const mensaje = document.getElementById('mantenimientoMensaje').value.trim();
    if(!mensaje) {
      toast('Por favor ingresa un mensaje', 'error');
      return;
    }
    
    try {
      const isActive = toggleMantenimiento.checked;
      await api('/maintenance', {
        method: 'PUT',
        body: JSON.stringify({active: isActive, message: mensaje})
      });
      toast('Mensaje de mantenimiento guardado', 'success');
    } catch (err) {
      console.error('Error saving maintenance message:', err);
      toast('Error al guardar mensaje', 'error');
    }
  };

  window.exportarBackup = async function() {
    const backupStatus = document.getElementById('backupStatus');
    try {
      backupStatus.style.display = 'block';
      backupStatus.style.background = 'rgba(33,150,243,0.1)';
      backupStatus.style.border = '1px solid #2196f3';
      backupStatus.textContent = 'Generando backup...';
      
      const response = await fetch('/api/backup/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al generar backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medtools-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      backupStatus.style.background = 'rgba(76,175,80,0.1)';
      backupStatus.style.border = '1px solid #4caf50';
      backupStatus.textContent = '✓ Backup descargado exitosamente';
      
      setTimeout(() => {
        backupStatus.style.display = 'none';
      }, 3000);
      
      toast('Backup descargado exitosamente', 'success');
    } catch (err) {
      console.error('Error exporting backup:', err);
      backupStatus.style.background = 'rgba(244,67,54,0.1)';
      backupStatus.style.border = '1px solid #f44336';
      backupStatus.textContent = '✗ Error al generar backup: ' + err.message;
      toast('Error al exportar backup', 'error');
    }
  };

  window.importarBackup = async function() {
    const backupStatus = document.getElementById('backupStatus');
    const fileInput = document.getElementById('backupFileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    if (!confirm('⚠️ ADVERTENCIA: Esta acción reemplazará TODOS los datos actuales del sistema con los datos del backup. ¿Estás seguro de que deseas continuar?')) {
      fileInput.value = '';
      return;
    }
    
    try {
      backupStatus.style.display = 'block';
      backupStatus.style.background = 'rgba(33,150,243,0.1)';
      backupStatus.style.border = '1px solid #2196f3';
      backupStatus.textContent = 'Importando backup...';
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          const response = await api('/backup/import', {
            method: 'POST',
            body: JSON.stringify(backupData)
          });
          
          backupStatus.style.background = 'rgba(76,175,80,0.1)';
          backupStatus.style.border = '1px solid #4caf50';
          backupStatus.textContent = '✓ Backup importado exitosamente. Recargando página...';
          
          toast('Backup importado exitosamente', 'success');
          
          setTimeout(() => {
            location.reload();
          }, 2000);
        } catch (err) {
          console.error('Error importing backup:', err);
          backupStatus.style.background = 'rgba(244,67,54,0.1)';
          backupStatus.style.border = '1px solid #f44336';
          backupStatus.textContent = '✗ Error al importar backup: ' + err.message;
          toast('Error al importar backup', 'error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      backupStatus.style.background = 'rgba(244,67,54,0.1)';
      backupStatus.style.border = '1px solid #f44336';
      backupStatus.textContent = '✗ Error al leer archivo';
      toast('Error al leer archivo de backup', 'error');
    }
    
    fileInput.value = '';
  };

  window.guardarBackupEnServidor = async function() {
    const backupStatus = document.getElementById('backupStatus');
    try {
      backupStatus.style.display = 'block';
      backupStatus.style.background = 'rgba(33,150,243,0.1)';
      backupStatus.style.border = '1px solid #2196f3';
      backupStatus.textContent = 'Creando backup en el servidor...';
      
      const response = await api('/backup/create', {
        method: 'POST'
      });
      
      backupStatus.style.background = 'rgba(76,175,80,0.1)';
      backupStatus.style.border = '1px solid #4caf50';
      backupStatus.textContent = `✓ Backup creado exitosamente: ${response.backup.filename} (${response.backup.sizeKB} KB)`;
      
      setTimeout(() => {
        backupStatus.style.display = 'none';
      }, 4000);
      
      toast('Backup guardado en el servidor', 'success');
      
      cargarListaBackups();
    } catch (err) {
      console.error('Error creating backup on server:', err);
      backupStatus.style.background = 'rgba(244,67,54,0.1)';
      backupStatus.style.border = '1px solid #f44336';
      backupStatus.textContent = '✗ Error al crear backup en el servidor: ' + err.message;
      toast('Error al guardar backup en el servidor', 'error');
    }
  };

  window.cargarListaBackups = async function() {
    const table = document.getElementById('backupsServerTable');
    const tbody = table.querySelector('tbody');
    const backupsCount = document.getElementById('backupsCount');
    
    try {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--muted);">Cargando backups...</td></tr>';
      
      const backups = await api('/backup/list');
      
      if (backups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--muted);">No hay backups guardados en el servidor</td></tr>';
        backupsCount.textContent = '';
        return;
      }
      
      backupsCount.textContent = `${backups.length} backup${backups.length !== 1 ? 's' : ''} encontrado${backups.length !== 1 ? 's' : ''}`;
      
      tbody.innerHTML = backups.map(backup => {
        const fecha = new Date(backup.created).toLocaleString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        return `
          <tr>
            <td style="font-family:monospace;font-size:13px;">${backup.filename}</td>
            <td>${fecha}</td>
            <td>${backup.sizeKB} KB</td>
            <td>
              <button class="btn sm" onclick="descargarBackupServidor('${backup.filename}')" title="Descargar backup">⬇️ Descargar</button>
              <button class="btn sm danger" onclick="eliminarBackupServidor('${backup.filename}')" title="Eliminar backup">🗑️ Eliminar</button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Error loading backups list:', err);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--danger);">Error al cargar la lista de backups</td></tr>';
      backupsCount.textContent = '';
      toast('Error al cargar lista de backups', 'error');
    }
  };

  window.descargarBackupServidor = async function(filename) {
    try {
      toast('Descargando backup...', 'info');
      
      const response = await fetch(`/api/backup/download/${filename}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast('Backup descargado exitosamente', 'success');
    } catch (err) {
      console.error('Error downloading backup from server:', err);
      toast('Error al descargar backup del servidor', 'error');
    }
  };

  window.eliminarBackupServidor = async function(filename) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el backup "${filename}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await api(`/backup/${filename}`, {
        method: 'DELETE'
      });
      
      toast('Backup eliminado exitosamente', 'success');
      cargarListaBackups();
    } catch (err) {
      console.error('Error deleting backup from server:', err);
      toast('Error al eliminar backup del servidor', 'error');
    }
  };

  const toolsControlList = document.getElementById('toolsControlList');
  let currentToolsStatus = {};

  async function loadToolsControl() {
    if (!toolsControlList) return;
    
    try {
      currentToolsStatus = await api('/tools/status');
      
      toolsControlList.innerHTML = Object.entries(currentToolsStatus).map(([key, tool]) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--card);border-radius:8px;border:1px solid var(--border);">
          <span style="font-weight:500;">${tool.name}</span>
          <label class="switch" style="margin:0;">
            <input type="checkbox" ${tool.enabled ? 'checked' : ''} onchange="toggleTool('${key}', this.checked)">
            <span class="slider"></span>
            <span style="font-size:13px;">${tool.enabled ? 'Activa' : 'Bloqueada'}</span>
          </label>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error loading tools control:', err);
    }
  }

  window.toggleTool = async function(toolKey, enabled) {
    try {
      currentToolsStatus[toolKey].enabled = enabled;
      
      await api('/tools/status', {
        method: 'PUT',
        body: JSON.stringify(currentToolsStatus)
      });
      
      toast(`Herramienta ${enabled ? 'activada' : 'bloqueada'} exitosamente`, 'success');
      await loadToolsControl();
    } catch (err) {
      console.error('Error toggling tool:', err);
      toast('Error al actualizar herramienta', 'error');
      await loadToolsControl();
    }
  };

  if (toolsControlList) {
    loadToolsControl();
  }

  const adminInfusionesTable = document.getElementById('adminInfusionesTable');
  const modalInfusion = document.getElementById('modalInfusion');
  const infusionForm = document.getElementById('infusionForm');
  const btnNuevaInfusion = document.getElementById('btnNuevaInfusion');

  function initDefaultInfusions() {
    const defaultMeds = [
        {
          id: 1,
          nombre: 'FENTANILO',
          presentacion: '500MCG/10ML = 50MCG/ML = 0.5MG/10ML',
          dosis: '1MCG/KG/HORA',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0.88, 0.44, 0.21, 0.11],
          ssn: '39,4',
          ssn_percentage: '0.9%'
        },
        {
          id: 2,
          nombre: 'MIDAZOLAM',
          presentacion: '15MG/3ML = 5MG/1ML',
          dosis: '0,1MG/KG/HORA',
          unidad: 'mg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0.42, 0.21, 0.10, 0.05],
          ssn: '38,5',
          ssn_percentage: '0.9%'
        },
        {
          id: 3,
          nombre: 'ADRENALINA',
          presentacion: '1MG/1ML = 1:1000',
          dosis: '0.1-0.3MCG/KG/MIN',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        },
        {
          id: 4,
          nombre: 'NOREPINEFRINA',
          presentacion: '4MG/4ML = 1MG/1ML',
          dosis: '0.1-0.3MCG/KG/MIN',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        },
        {
          id: 5,
          nombre: 'MILRINONE',
          presentacion: '250MG/5ML = 50MG/1ML = 50000MCG/1ML',
          dosis: '0.3-0.5MCG/KG/MIN',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        },
        {
          id: 6,
          nombre: 'DOBUTAMINA',
          presentacion: '250MG/5ML = 50MG/1ML = 50000MCG/1ML',
          dosis: '5-10MCG/KG/MIN',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        },
        {
          id: 7,
          nombre: 'DOPAMINA',
          presentacion: '200MG/5ML = 40MG/1ML',
          dosis: '5-10MCG/KG/MIN',
          unidad: 'mcg/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        },
        {
          id: 8,
          nombre: 'VASOPRESINA',
          presentacion: '20UI/ML',
          dosis: '0.0003-0.002UI/KG/MIN',
          unidad: 'UI/kg/h',
          diluciones: ['12CC', '24CC', '50CC', '100CC'],
          concentraciones: [0, 0, 0, 0],
          ssn: '0',
          ssn_percentage: '0.9%'
        }
    ];
    
    const existing = localStorage.getItem('infusion_medications_global');
    if (!existing) {
      localStorage.setItem('infusion_medications_global', JSON.stringify(defaultMeds));
    } else {
      const existingMeds = JSON.parse(existing);
      const existingIds = new Set(existingMeds.map(m => m.id));
      
      const newMeds = defaultMeds.filter(m => !existingIds.has(m.id));
      if (newMeds.length > 0) {
        const mergedMeds = [...existingMeds, ...newMeds];
        localStorage.setItem('infusion_medications_global', JSON.stringify(mergedMeds));
      }
    }
  }

  async function renderInfusionesAdmin() {
    if(!adminInfusionesTable) return;
    const tbody = adminInfusionesTable.querySelector('tbody');
    
    initDefaultInfusions();
    const list = JSON.parse(localStorage.getItem('infusion_medications_global') || '[]');
    
    tbody.innerHTML = list.map(m => 
      `<tr>
        <td>${m.nombre}</td>
        <td>${m.presentacion}</td>
        <td>${m.dosis}</td>
        <td>${m.diluciones.join(', ')}</td>
        <td>
          <div style='display:flex;gap:6px;white-space:nowrap'>
            <button class='btn sm info' data-edit-inf='${m.id}'>Editar</button>
            <button class='btn sm danger' data-del-inf='${m.id}'>Eliminar</button>
          </div>
        </td>
      </tr>`
    ).join('');

    tbody.querySelectorAll('[data-edit-inf]').forEach(b => b.addEventListener('click', () => openInfusion(b.getAttribute('data-edit-inf'))));
    tbody.querySelectorAll('[data-del-inf]').forEach(b => b.addEventListener('click', async () => {
      const id = parseInt(b.getAttribute('data-del-inf'));
      if(!confirm('¿Eliminar este medicamento de infusión?')) return;

      const meds = JSON.parse(localStorage.getItem('infusion_medications_global') || '[]');
      const filtered = meds.filter(m => m.id !== id);
      localStorage.setItem('infusion_medications_global', JSON.stringify(filtered));
      await renderInfusionesAdmin();
      toast('Medicamento eliminado.', 'info');
    }));
  }

  function openInfusion(id) {
    const meds = JSON.parse(localStorage.getItem('infusion_medications_global') || '[]');
    const m = meds.find(x => x.id === parseInt(id));
    
    if(m) {
      document.getElementById('infId').value = m.id;
      document.getElementById('infNombre').value = m.nombre;
      document.getElementById('infPresentacion').value = m.presentacion;
      document.getElementById('infDosis').value = m.dosis;
      document.getElementById('infUnidad').value = m.unidad || 'mcg/kg/h';
      document.getElementById('infDiluciones').value = m.diluciones.join(', ');
    } else {
      document.getElementById('infId').value = '';
      document.getElementById('infNombre').value = '';
      document.getElementById('infPresentacion').value = '';
      document.getElementById('infDosis').value = '';
      document.getElementById('infUnidad').value = 'mcg/kg/h';
      document.getElementById('infDiluciones').value = '';
    }
    
    modalInfusion.style.display = 'flex';
  }

  if(btnNuevaInfusion) {
    btnNuevaInfusion.addEventListener('click', () => openInfusion(''));
  }

  if(infusionForm) {
    infusionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('infId').value;
      const nombre = document.getElementById('infNombre').value.trim();
      const presentacion = document.getElementById('infPresentacion').value.trim();
      const dosis = document.getElementById('infDosis').value.trim();
      const unidad = document.getElementById('infUnidad').value;
      const diluciones = document.getElementById('infDiluciones').value.split(',').map(d => d.trim());
      
      const concentraciones = diluciones.map(() => 0);
      const ssn = '0';
      const ssn_percentage = '0.9%';

      if(!nombre || !presentacion || !dosis || diluciones.length === 0) {
        toast('Por favor completa todos los campos.', 'error');
        return;
      }

      const meds = JSON.parse(localStorage.getItem('infusion_medications_global') || '[]');
      
      if(id) {
        const index = meds.findIndex(m => m.id === parseInt(id));
        if(index !== -1) {
          meds[index] = {
            id: parseInt(id),
            nombre,
            presentacion,
            dosis,
            unidad,
            diluciones,
            concentraciones,
            ssn,
            ssn_percentage
          };
        }
      } else {
        const newId = meds.length > 0 ? Math.max(...meds.map(m => m.id)) + 1 : 1;
        meds.push({
          id: newId,
          nombre,
          presentacion,
          dosis,
          unidad,
          diluciones,
          concentraciones,
          ssn,
          ssn_percentage
        });
      }

      localStorage.setItem('infusion_medications_global', JSON.stringify(meds));
      modalInfusion.style.display = 'none';
      await renderInfusionesAdmin();
      toast('Medicamento guardado.', 'success');
    });

    document.querySelectorAll('[data-close-infusion]').forEach(x => x.addEventListener('click', () => modalInfusion.style.display = 'none'));
  }

  if(adminInfusionesTable) {
    await renderInfusionesAdmin();
  }

  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      const targetId = this.getAttribute('data-toggle');
      const content = document.getElementById(targetId);
      const icon = this.querySelector('.accordion-icon');
      
      if(content) {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        if(icon) {
          icon.textContent = isVisible ? '▼' : '▲';
        }
        
        if(!isVisible && targetId === 'backup') {
          cargarListaBackups();
        }
      }
    });
  });

  if (typeof window.initHerramientas === 'function') {
    window.initHerramientas();
  }
})();
