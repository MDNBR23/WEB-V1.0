// Sistema de Internacionalización Global (i18n)
const i18n = {
  currentLanguage: localStorage.getItem('currentLanguage') || 'es',
  
  messages: {
    es: {
      // Navegación/Header
      'header.principal': 'Principal',
      'header.vademecum': 'Vademecum',
      'header.herramientas': 'Herramientas',
      'header.turnos': 'Turnos',
      'header.sugerencias': 'Sugerencias',
      'header.configuracion': 'Configuración',
      'header.admin': 'Administración',
      'header.logout': 'Salir',
      
      // Páginas principales
      'page.principal.titulo': 'Panel Principal',
      'page.principal.subtitle': 'Accede a todas las herramientas médicas de Med Tools Hub',
      'page.vademecum.titulo': 'Vademecum Médico',
      'page.vademecum.subtitle': 'Base de datos farmacológica completa de medicamentos',
      'page.herramientas.titulo': 'Herramientas Médicas',
      'page.herramientas.subtitle': 'Acceso a calculadoras y herramientas clínicas especializadas',
      'page.turnos.titulo': 'Gestión de Turnos',
      'page.turnos.subtitle': 'Calendario, reportes y estadísticas de turnos médicos',
      'page.sugerencias.titulo': 'Centro de Sugerencias',
      'page.sugerencias.subtitle': 'Comparte tus ideas y retroalimentación sobre la plataforma',
      'page.configuracion.titulo': 'Configuración',
      'page.configuracion.subtitle': 'Personaliza tu perfil, seguridad y preferencias de la aplicación',
      'page.admin.titulo': 'Panel de Administración',
      'page.admin.subtitle': 'Gestiona usuarios, contenido y configuración de la plataforma',
      
      // Configuración
      'config.perfil': 'Perfil',
      'config.seguridad': 'Seguridad',
      'config.preferencias': 'Preferencias',
      'config.biometria': 'Biometría',
      'config.cuenta': 'Cuenta',
      'config.info_perfil': 'Información del Perfil',
      'config.cambiar_pass': 'Cambiar Contraseña',
      'config.temas': 'Temas Visuales',
      'config.modo_oscuro': 'Modo oscuro',
      'config.modo_oscuro_desc': 'Cambia entre tema claro y oscuro',
      'config.idioma': 'Idioma',
      'config.idioma_desc': 'Selecciona tu idioma preferido',
      'config.info_sistema': 'Información del Sistema',
      'config.version': 'Versión',
      'config.actualizacion': 'Última actualización',
      'config.autenticacion_biometrica': 'Autenticación Biométrica',
      'config.biometria_desc': 'Registra tu huella digital o Face ID para un acceso más rápido y seguro',
      'config.dispositivos_biometricos': 'Dispositivos biométricos registrados',
      'config.registrar_biometria': 'Registrar nuevo dispositivo',
      'config.zona_precaucion': 'Zona de Precaución',
      
      // Turnos
      'turnos.calendario': 'Calendario',
      'turnos.reportes': 'Reportes',
      'turnos.turnos': 'Turnos',
      'turnos.mas': 'Más',
      'turnos.agregar_turno': 'Agregar turno',
      'turnos.editar_turno': 'Editar turno',
      'turnos.eliminar_turno': 'Eliminar turno',
      'turnos.exportar_pdf': 'Exportar a PDF',
      'turnos.fecha': 'Fecha',
      'turnos.hora': 'Hora',
      'turnos.institucion': 'Institución',
      'turnos.tipo': 'Tipo',
      'turnos.moneda': 'Moneda',
      'turnos.valor': 'Valor',
      
      // Vademecum
      'vademecum.buscar': 'Buscar medicamento...',
      'vademecum.nombre': 'Nombre del medicamento',
      'vademecum.dosis': 'Dosis',
      'vademecum.presentacion': 'Presentación',
      'vademecum.indicaciones': 'Indicaciones',
      'vademecum.contraindicaciones': 'Contraindicaciones',
      'vademecum.efectos': 'Efectos secundarios',
      'vademecum.agregar': 'Agregar medicamento',
      'vademecum.editar': 'Editar medicamento',
      'vademecum.eliminar': 'Eliminar medicamento',
      
      // Herramientas
      'herramientas.corrector_texto': 'Corrector de Texto',
      'herramientas.corrector_desc': 'Corrector profesional para notas clínicas',
      'herramientas.gasa': 'Analizador de Gasometría',
      'herramientas.gasa_desc': 'Análisis de gases arteriales',
      'herramientas.infusion': 'Calculadora de Infusión',
      'herramientas.infusion_desc': 'Cálculo de dosis y velocidad de infusión',
      'herramientas.interacciones': 'Interacciones Medicamentosas',
      'herramientas.interacciones_desc': 'Verificar interacciones entre fármacos',
      'herramientas.plantillas': 'Plantillas Clínicas',
      'herramientas.plantillas_desc': 'Plantillas de notas y evoluciones clínicas',
      'herramientas.ia_medica': 'Asistente Médico IA',
      'herramientas.ia_medica_desc': 'Consultas médicas asistidas por inteligencia artificial',
      'herramientas.evaluaciones': 'Evaluaciones Interactivas',
      'herramientas.evaluaciones_desc': 'Cuestionarios y pruebas de conocimiento',
      
      // AI Assistant
      'ia.titulo': 'Asistente Médico IA',
      'ia.subtitle': 'Respuestas médicas precisas en tiempo real',
      'ia.placeholder': 'Escribe tu pregunta médica...',
      'ia.enviar': 'Enviar',
      'ia.nuevo': 'Nueva consulta',
      'ia.limpiar': 'Limpiar conversación',
      'ia.ayuda': '¿En qué puedo ayudarte?',
      'ia.dosispediatrica': 'Dosis pediátricas',
      'ia.neonatologia': 'Neonatología',
      'ia.contraindicaciones': 'Contraindicaciones',
      'ia.util': '¿Fue útil?',
      'ia.si': 'Sí',
      'ia.no': 'No',
      'ia.comentario': 'Agregar comentario',
      
      // Analytics
      'analytics.titulo': 'Estadísticas del Asistente de IA',
      'analytics.totalConsultas': 'Total Consultas',
      'analytics.respuestasUtiles': 'Respuestas Útiles',
      'analytics.mejoraNecesaria': 'Mejora Necesaria',
      'analytics.calidadPromedio': 'Calidad Promedio',
      'analytics.consultasFrecuentes': 'Consultas Más Frecuentes',
      'analytics.ultimasConsultas': 'Últimas Consultas',
      'analytics.recargar': 'Recargar',
      'analytics.exportar': 'Exportar CSV',
      
      // Administración
      'admin.usuarios': 'Usuarios',
      'admin.pendientes': 'Pendientes de Aprobación',
      'admin.anuncios': 'Anuncios',
      'admin.guias': 'Guías Clínicas',
      'admin.medicamentos': 'Medicamentos',
      'admin.modo_mantenimiento': 'Modo Mantenimiento',
      'admin.estadisticas': 'Estadísticas',
      'admin.aprobar': 'Aprobar',
      'admin.rechazar': 'Rechazar',
      'admin.agregar': 'Agregar',
      'admin.editar': 'Editar',
      'admin.eliminar': 'Eliminar',
      
      // Botones comunes
      'common.guardar': 'Guardar',
      'common.cancelar': 'Cancelar',
      'common.cerrar': 'Cerrar',
      'common.eliminar': 'Eliminar',
      'common.editar': 'Editar',
      'common.agregar': 'Agregar',
      'common.buscar': 'Buscar',
      'common.enviar': 'Enviar',
      'common.si': 'Sí',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.volver': 'Volver',
      'common.ayuda': 'Ayuda',
      'common.idioma': 'Idioma',
      'common.cargando': 'Cargando...',
      'common.error': 'Error',
      'common.exito': 'Éxito',
      'common.advertencia': 'Advertencia'
    },
    en: {
      // Navigation/Header
      'header.principal': 'Home',
      'header.vademecum': 'Vademecum',
      'header.herramientas': 'Tools',
      'header.turnos': 'Shifts',
      'header.sugerencias': 'Feedback',
      'header.configuracion': 'Settings',
      'header.admin': 'Administration',
      'header.logout': 'Logout',
      
      // Main pages
      'page.principal.titulo': 'Main Dashboard',
      'page.principal.subtitle': 'Access all medical tools from Med Tools Hub',
      'page.vademecum.titulo': 'Medical Vademecum',
      'page.vademecum.subtitle': 'Complete pharmacological database of medications',
      'page.herramientas.titulo': 'Medical Tools',
      'page.herramientas.subtitle': 'Access to calculators and specialized clinical tools',
      'page.turnos.titulo': 'Shift Management',
      'page.turnos.subtitle': 'Calendar, reports and statistics for medical shifts',
      'page.sugerencias.titulo': 'Feedback Center',
      'page.sugerencias.subtitle': 'Share your ideas and feedback about the platform',
      'page.configuracion.titulo': 'Settings',
      'page.configuracion.subtitle': 'Customize your profile, security and application preferences',
      'page.admin.titulo': 'Administration Panel',
      'page.admin.subtitle': 'Manage users, content and platform settings',
      
      // Settings
      'config.perfil': 'Profile',
      'config.seguridad': 'Security',
      'config.preferencias': 'Preferences',
      'config.biometria': 'Biometrics',
      'config.cuenta': 'Account',
      'config.info_perfil': 'Profile Information',
      'config.cambiar_pass': 'Change Password',
      'config.temas': 'Visual Themes',
      'config.modo_oscuro': 'Dark mode',
      'config.modo_oscuro_desc': 'Switch between light and dark theme',
      'config.idioma': 'Language',
      'config.idioma_desc': 'Select your preferred language',
      'config.info_sistema': 'System Information',
      'config.version': 'Version',
      'config.actualizacion': 'Last update',
      'config.autenticacion_biometrica': 'Biometric Authentication',
      'config.biometria_desc': 'Register your fingerprint or Face ID for faster and secure access',
      'config.dispositivos_biometricos': 'Registered biometric devices',
      'config.registrar_biometria': 'Register new device',
      'config.zona_precaucion': 'Caution Zone',
      
      // Shifts
      'turnos.calendario': 'Calendar',
      'turnos.reportes': 'Reports',
      'turnos.turnos': 'Shifts',
      'turnos.mas': 'More',
      'turnos.agregar_turno': 'Add shift',
      'turnos.editar_turno': 'Edit shift',
      'turnos.eliminar_turno': 'Delete shift',
      'turnos.exportar_pdf': 'Export to PDF',
      'turnos.fecha': 'Date',
      'turnos.hora': 'Time',
      'turnos.institucion': 'Institution',
      'turnos.tipo': 'Type',
      'turnos.moneda': 'Currency',
      'turnos.valor': 'Value',
      
      // Vademecum
      'vademecum.buscar': 'Search medication...',
      'vademecum.nombre': 'Medication name',
      'vademecum.dosis': 'Dosage',
      'vademecum.presentacion': 'Presentation',
      'vademecum.indicaciones': 'Indications',
      'vademecum.contraindicaciones': 'Contraindications',
      'vademecum.efectos': 'Side effects',
      'vademecum.agregar': 'Add medication',
      'vademecum.editar': 'Edit medication',
      'vademecum.eliminar': 'Delete medication',
      
      // Tools
      'herramientas.corrector_texto': 'Text Corrector',
      'herramientas.corrector_desc': 'Professional corrector for clinical notes',
      'herramientas.gasa': 'Gasometry Analyzer',
      'herramientas.gasa_desc': 'Arterial gas analysis',
      'herramientas.infusion': 'Infusion Calculator',
      'herramientas.infusion_desc': 'Calculate dosage and infusion rate',
      'herramientas.interacciones': 'Drug Interactions',
      'herramientas.interacciones_desc': 'Check interactions between drugs',
      'herramientas.plantillas': 'Clinical Templates',
      'herramientas.plantillas_desc': 'Templates for clinical notes and evolutions',
      'herramientas.ia_medica': 'Medical AI Assistant',
      'herramientas.ia_medica_desc': 'Medical queries assisted by artificial intelligence',
      'herramientas.evaluaciones': 'Interactive Assessments',
      'herramientas.evaluaciones_desc': 'Quizzes and knowledge tests',
      
      // AI Assistant
      'ia.titulo': 'Medical AI Assistant',
      'ia.subtitle': 'Accurate medical answers in real-time',
      'ia.placeholder': 'Type your medical question...',
      'ia.enviar': 'Send',
      'ia.nuevo': 'New query',
      'ia.limpiar': 'Clear conversation',
      'ia.ayuda': 'How can I help you?',
      'ia.dosispediatrica': 'Pediatric dosages',
      'ia.neonatologia': 'Neonatology',
      'ia.contraindicaciones': 'Contraindications',
      'ia.util': 'Was it helpful?',
      'ia.si': 'Yes',
      'ia.no': 'No',
      'ia.comentario': 'Add comment',
      
      // Analytics
      'analytics.titulo': 'AI Assistant Statistics',
      'analytics.totalConsultas': 'Total Queries',
      'analytics.respuestasUtiles': 'Useful Answers',
      'analytics.mejoraNecesaria': 'Needs Improvement',
      'analytics.calidadPromedio': 'Average Quality',
      'analytics.consultasFrecuentes': 'Top Queries',
      'analytics.ultimasConsultas': 'Recent Queries',
      'analytics.recargar': 'Refresh',
      'analytics.exportar': 'Export CSV',
      
      // Administration
      'admin.usuarios': 'Users',
      'admin.pendientes': 'Pending Approval',
      'admin.anuncios': 'Announcements',
      'admin.guias': 'Clinical Guides',
      'admin.medicamentos': 'Medications',
      'admin.modo_mantenimiento': 'Maintenance Mode',
      'admin.estadisticas': 'Statistics',
      'admin.aprobar': 'Approve',
      'admin.rechazar': 'Reject',
      'admin.agregar': 'Add',
      'admin.editar': 'Edit',
      'admin.eliminar': 'Delete',
      
      // Common buttons
      'common.guardar': 'Save',
      'common.cancelar': 'Cancel',
      'common.cerrar': 'Close',
      'common.eliminar': 'Delete',
      'common.editar': 'Edit',
      'common.agregar': 'Add',
      'common.buscar': 'Search',
      'common.enviar': 'Send',
      'common.si': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.volver': 'Back',
      'common.ayuda': 'Help',
      'common.idioma': 'Language',
      'common.cargando': 'Loading...',
      'common.error': 'Error',
      'common.exito': 'Success',
      'common.advertencia': 'Warning'
    },
    pt: {
      // Navegação/Header
      'header.principal': 'Início',
      'header.vademecum': 'Vademecum',
      'header.herramientas': 'Ferramentas',
      'header.turnos': 'Turnos',
      'header.sugerencias': 'Sugestões',
      'header.configuracion': 'Configurações',
      'header.admin': 'Administração',
      'header.logout': 'Sair',
      
      // Páginas principais
      'page.principal.titulo': 'Painel Principal',
      'page.principal.subtitle': 'Acesse todas as ferramentas médicas do Med Tools Hub',
      'page.vademecum.titulo': 'Vademecum Médico',
      'page.vademecum.subtitle': 'Base de dados farmacológica completa de medicamentos',
      'page.herramientas.titulo': 'Ferramentas Médicas',
      'page.herramientas.subtitle': 'Acesso a calculadoras e ferramentas clínicas especializadas',
      'page.turnos.titulo': 'Gestão de Turnos',
      'page.turnos.subtitle': 'Calendário, relatórios e estatísticas de turnos médicos',
      'page.sugerencias.titulo': 'Centro de Sugestões',
      'page.sugerencias.subtitle': 'Compartilhe suas ideias e comentários sobre a plataforma',
      'page.configuracion.titulo': 'Configurações',
      'page.configuracion.subtitle': 'Personalize seu perfil, segurança e preferências da aplicação',
      'page.admin.titulo': 'Painel de Administração',
      'page.admin.subtitle': 'Gerencie usuários, conteúdo e configurações da plataforma',
      
      // Configuração
      'config.perfil': 'Perfil',
      'config.seguridad': 'Segurança',
      'config.preferencias': 'Preferências',
      'config.biometria': 'Biometria',
      'config.cuenta': 'Conta',
      'config.info_perfil': 'Informações do Perfil',
      'config.cambiar_pass': 'Alterar Senha',
      'config.temas': 'Temas Visuais',
      'config.modo_oscuro': 'Modo escuro',
      'config.modo_oscuro_desc': 'Alterne entre tema claro e escuro',
      'config.idioma': 'Idioma',
      'config.idioma_desc': 'Selecione seu idioma preferido',
      'config.info_sistema': 'Informações do Sistema',
      'config.version': 'Versão',
      'config.actualizacion': 'Última atualização',
      'config.autenticacion_biometrica': 'Autenticação Biométrica',
      'config.biometria_desc': 'Registre sua impressão digital ou Face ID para acesso mais rápido e seguro',
      'config.dispositivos_biometricos': 'Dispositivos biométricos registrados',
      'config.registrar_biometria': 'Registrar novo dispositivo',
      'config.zona_precaucion': 'Zona de Precaução',
      
      // Turnos
      'turnos.calendario': 'Calendário',
      'turnos.reportes': 'Relatórios',
      'turnos.turnos': 'Turnos',
      'turnos.mas': 'Mais',
      'turnos.agregar_turno': 'Adicionar turno',
      'turnos.editar_turno': 'Editar turno',
      'turnos.eliminar_turno': 'Excluir turno',
      'turnos.exportar_pdf': 'Exportar para PDF',
      'turnos.fecha': 'Data',
      'turnos.hora': 'Hora',
      'turnos.institucion': 'Instituição',
      'turnos.tipo': 'Tipo',
      'turnos.moneda': 'Moeda',
      'turnos.valor': 'Valor',
      
      // Vademecum
      'vademecum.buscar': 'Pesquisar medicamento...',
      'vademecum.nombre': 'Nome do medicamento',
      'vademecum.dosis': 'Dosagem',
      'vademecum.presentacion': 'Apresentação',
      'vademecum.indicaciones': 'Indicações',
      'vademecum.contraindicaciones': 'Contra-indicações',
      'vademecum.efectos': 'Efeitos colaterais',
      'vademecum.agregar': 'Adicionar medicamento',
      'vademecum.editar': 'Editar medicamento',
      'vademecum.eliminar': 'Excluir medicamento',
      
      // Ferramentas
      'herramientas.corrector_texto': 'Corretor de Texto',
      'herramientas.corrector_desc': 'Corretor profissional para notas clínicas',
      'herramientas.gasa': 'Analisador de Gasometria',
      'herramientas.gasa_desc': 'Análise de gases arteriais',
      'herramientas.infusion': 'Calculadora de Infusão',
      'herramientas.infusion_desc': 'Cálculo de dosagem e velocidade de infusão',
      'herramientas.interacciones': 'Interações Medicamentosas',
      'herramientas.interacciones_desc': 'Verificar interações entre medicamentos',
      'herramientas.plantillas': 'Modelos Clínicos',
      'herramientas.plantillas_desc': 'Modelos para notas e evoluções clínicas',
      'herramientas.ia_medica': 'Assistente Médico IA',
      'herramientas.ia_medica_desc': 'Consultas médicas assistidas por inteligência artificial',
      'herramientas.evaluaciones': 'Avaliações Interativas',
      'herramientas.evaluaciones_desc': 'Questionários e testes de conhecimento',
      
      // Assistente IA
      'ia.titulo': 'Assistente Médico IA',
      'ia.subtitle': 'Respostas médicas precisas em tempo real',
      'ia.placeholder': 'Digite sua pergunta médica...',
      'ia.enviar': 'Enviar',
      'ia.nuevo': 'Nova consulta',
      'ia.limpiar': 'Limpar conversa',
      'ia.ayuda': 'Como posso ajudá-lo?',
      'ia.dosispediatrica': 'Dosagens pediátricas',
      'ia.neonatologia': 'Neonatologia',
      'ia.contraindicaciones': 'Contra-indicações',
      'ia.util': 'Foi útil?',
      'ia.si': 'Sim',
      'ia.no': 'Não',
      'ia.comentario': 'Adicionar comentário',
      
      // Analytics
      'analytics.titulo': 'Estatísticas do Assistente de IA',
      'analytics.totalConsultas': 'Total de Consultas',
      'analytics.respuestasUtiles': 'Respostas Úteis',
      'analytics.mejoraNecesaria': 'Precisa de Melhoria',
      'analytics.calidadPromedio': 'Qualidade Média',
      'analytics.consultasFrecuentes': 'Consultas Mais Frequentes',
      'analytics.ultimasConsultas': 'Consultas Recentes',
      'analytics.recargar': 'Atualizar',
      'analytics.exportar': 'Exportar CSV',
      
      // Administração
      'admin.usuarios': 'Usuários',
      'admin.pendientes': 'Pendentes de Aprovação',
      'admin.anuncios': 'Anúncios',
      'admin.guias': 'Guias Clínicos',
      'admin.medicamentos': 'Medicamentos',
      'admin.modo_mantenimiento': 'Modo Manutenção',
      'admin.estadisticas': 'Estatísticas',
      'admin.aprobar': 'Aprovar',
      'admin.rechazar': 'Rejeitar',
      'admin.agregar': 'Adicionar',
      'admin.editar': 'Editar',
      'admin.eliminar': 'Excluir',
      
      // Botões comuns
      'common.guardar': 'Salvar',
      'common.cancelar': 'Cancelar',
      'common.cerrar': 'Fechar',
      'common.eliminar': 'Excluir',
      'common.editar': 'Editar',
      'common.agregar': 'Adicionar',
      'common.buscar': 'Pesquisar',
      'common.enviar': 'Enviar',
      'common.si': 'Sim',
      'common.no': 'Não',
      'common.ok': 'OK',
      'common.volver': 'Voltar',
      'common.ayuda': 'Ajuda',
      'common.idioma': 'Idioma',
      'common.cargando': 'Carregando...',
      'common.error': 'Erro',
      'common.exito': 'Sucesso',
      'common.advertencia': 'Aviso'
    }
  },
  
  t(key) {
    return this.messages[this.currentLanguage]?.[key] || this.messages.es[key] || key;
  },
  
  setLanguage(lang) {
    if (['es', 'en', 'pt'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('currentLanguage', lang);
      
      // Re-aplicar traducciones a TODA la página
      this.applyTranslations();
      
      // Forzar re-render de contenido dinámico
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
      
      // Actualizar botones de idioma en configuración
      const langButtons = {
        'langES': 'es',
        'langEN': 'en',
        'langPT': 'pt'
      };
      
      Object.entries(langButtons).forEach(([id, btnLang]) => {
        const btn = document.getElementById(id);
        if (btn) {
          if (btnLang === lang) {
            btn.style.background = 'var(--primary)';
            btn.classList.remove('secondary');
          } else {
            btn.style.background = '';
            btn.classList.add('secondary');
          }
        }
      });
    }
  },
  
  applyTranslations() {
    // Traducir elementos con data-i18n - solo si no está ya traducido
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      // Solo reemplazar si el elemento no está vacío o es diferente
      if (el.children.length === 0) { // Solo si no tiene hijos (no es un contenedor)
        el.textContent = translated;
      }
    });
    
    // Traducir placeholders - aplicar siempre
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // Traducir titles - aplicar siempre
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
  },
  
  // Función para re-aplicar traducciones (útil para contenido dinámico)
  refreshTranslations() {
    this.applyTranslations();
  },
  
  init() {
    this.applyTranslations();
  }
};

// Inicializar cuando DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}

// Hacer disponible globalmente
window.i18n = i18n;

// Traducciones adicionales para textos dinámicos
i18n.dynamicTexts = {
  es: {
    'profile.bienvenido': 'Bienvenido',
    'profile.miembro_desde': 'Miembro desde',
    'loading': 'Cargando...',
    'no_data': 'Sin datos disponibles',
    'error': 'Error',
    'success': 'Éxito',
  },
  en: {
    'profile.bienvenido': 'Welcome',
    'profile.miembro_desde': 'Member since',
    'loading': 'Loading...',
    'no_data': 'No data available',
    'error': 'Error',
    'success': 'Success',
  },
  pt: {
    'profile.bienvenido': 'Bem-vindo',
    'profile.miembro_desde': 'Membro desde',
    'loading': 'Carregando...',
    'no_data': 'Sem dados disponíveis',
    'error': 'Erro',
    'success': 'Sucesso',
  }
};

// Función auxiliar para obtener textos dinámicos
i18n.tDynamic = function(key) {
  return this.dynamicTexts[this.currentLanguage]?.[key] || this.messages[this.currentLanguage]?.[key] || key;
};
