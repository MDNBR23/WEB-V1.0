// Selector de idioma - Solo en IA Tool

function initLanguageSwitcher() {
  // Solo inicializar si estamos en herramientas.html
  if (!window.location.href.includes('herramientas')) return;
  
  // Agregar event listeners a botones de lenguaje en el IA tool
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      i18n.setLanguage(lang);
      
      // Actualizar estilos de botones
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.style.background = b.getAttribute('data-lang') === lang ? 'var(--primary)' : 'transparent';
        b.style.color = b.getAttribute('data-lang') === lang ? 'white' : 'var(--text)';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
