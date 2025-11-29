// Theme Customizer - Color themes with superior contrast and readability

const themeCustomizer = {
  themes: {
    default: {
      name: 'Slate (Por Defecto)',
      light: {
        '--bg': '#fafbfc',
        '--text': '#000000',
        '--muted': '#374151',
        '--primary': '#5dade2',
        '--secondary': '#48c9b0',
        '--accent': '#f8b8d1',
        '--card': '#f0f4f8',
        '--border': '#dce4ed',
        '--success': '#52b788',
        '--error': '#c53030',
        '--warning': '#d97706',
        '--info': '#5dade2',
        '--sidebar-bg': 'rgba(200,220,235,.3)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#1a1f28',
        '--text': '#e5e7eb',
        '--muted': '#9ca3af',
        '--primary': '#7eb3d4',
        '--secondary': '#6db8a0',
        '--accent': '#d9a8c2',
        '--card': '#242d3a',
        '--border': '#3a4a56',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#7eb3d4',
        '--sidebar-bg': 'rgba(60,80,100,.3)',
        '--sidebar-text': '#e5e7eb',
        '--sidebar-active': '#ffffff'
      }
    },

    medical: {
      name: 'Médico (Azul)',
      light: {
        '--bg': '#f5f9fd',
        '--text': '#000000',
        '--muted': '#1e40af',
        '--primary': '#6ba3d4',
        '--secondary': '#7eb3d4',
        '--accent': '#e8a8c8',
        '--card': '#e8f1f8',
        '--border': '#c9ddf0',
        '--success': '#047857',
        '--error': '#b91c1c',
        '--warning': '#d97706',
        '--info': '#6ba3d4',
        '--sidebar-bg': 'rgba(200,220,240,.3)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#172135',
        '--text': '#dbeafe',
        '--muted': '#93c5fd',
        '--primary': '#7eb3d4',
        '--secondary': '#8ab5d4',
        '--accent': '#d4a0b8',
        '--card': '#203050',
        '--border': '#3a4a70',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#7eb3d4',
        '--sidebar-bg': 'rgba(50,70,100,.3)',
        '--sidebar-text': '#dbeafe',
        '--sidebar-active': '#ffffff'
      }
    },

    ocean: {
      name: 'Océano (Cian)',
      light: {
        '--bg': '#f5fbfd',
        '--text': '#000000',
        '--muted': '#0c4a6e',
        '--primary': '#6ab8c8',
        '--secondary': '#7ab8c8',
        '--accent': '#f0a8b0',
        '--card': '#e0f2f5',
        '--border': '#b8dfe6',
        '--success': '#047857',
        '--error': '#b91c1c',
        '--warning': '#d97706',
        '--info': '#6ab8c8',
        '--sidebar-bg': 'rgba(180,220,230,.3)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#152a35',
        '--text': '#cffafe',
        '--muted': '#7ee8f7',
        '--primary': '#7ab8d4',
        '--secondary': '#7ab8d0',
        '--accent': '#d0a0a8',
        '--card': '#1f3a4a',
        '--border': '#3a5a6a',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#7ab8d4',
        '--sidebar-bg': 'rgba(60,100,120,.3)',
        '--sidebar-text': '#cffafe',
        '--sidebar-active': '#ffffff'
      }
    },

    forest: {
      name: 'Bosque (Verde)',
      light: {
        '--bg': '#f8fbf8',
        '--text': '#000000',
        '--muted': '#14532d',
        '--primary': '#6ba87a',
        '--secondary': '#7ab08a',
        '--accent': '#e8a8c8',
        '--card': '#e8f5ea',
        '--border': '#c8e0ca',
        '--success': '#047857',
        '--error': '#b91c1c',
        '--warning': '#d97706',
        '--info': '#6ba87a',
        '--sidebar-bg': 'rgba(180,220,190,.3)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#1a2720',
        '--text': '#dcfce7',
        '--muted': '#86efac',
        '--primary': '#7aaa88',
        '--secondary': '#7aa880',
        '--accent': '#d4a0b8',
        '--card': '#243028',
        '--border': '#3a4a38',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#7aaa88',
        '--sidebar-bg': 'rgba(70,110,80,.3)',
        '--sidebar-text': '#dcfce7',
        '--sidebar-active': '#ffffff'
      }
    },

    sunset: {
      name: 'Atardecer (Naranja)',
      light: {
        '--bg': '#fffbf5',
        '--text': '#000000',
        '--muted': '#7c2d12',
        '--primary': '#d4a070',
        '--secondary': '#e0b080',
        '--accent': '#e8a8c8',
        '--card': '#fff0e6',
        '--border': '#f0d4b8',
        '--success': '#047857',
        '--error': '#b91c1c',
        '--warning': '#d97706',
        '--info': '#d4a070',
        '--sidebar-bg': 'rgba(240,200,160,.2)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#2a1f15',
        '--text': '#fedd97',
        '--muted': '#fdba74',
        '--primary': '#b8956a',
        '--secondary': '#c0a080',
        '--accent': '#d0a0b0',
        '--card': '#3a2818',
        '--border': '#4a3828',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#b8956a',
        '--sidebar-bg': 'rgba(120,80,60,.3)',
        '--sidebar-text': '#fedd97',
        '--sidebar-active': '#ffffff'
      }
    },

    lavender: {
      name: 'Lavanda (Púrpura)',
      light: {
        '--bg': '#faf8fd',
        '--text': '#000000',
        '--muted': '#6b21a8',
        '--primary': '#9a7ab8',
        '--secondary': '#aa88c8',
        '--accent': '#e8a8c8',
        '--card': '#f0e8f8',
        '--border': '#dcc8e8',
        '--success': '#047857',
        '--error': '#b91c1c',
        '--warning': '#d97706',
        '--info': '#9a7ab8',
        '--sidebar-bg': 'rgba(210,190,240,.3)',
        '--sidebar-text': '#000000',
        '--sidebar-active': '#000000'
      },
      dark: {
        '--bg': '#22153a',
        '--text': '#e9d5ff',
        '--muted': '#d8b4fe',
        '--primary': '#a890c8',
        '--secondary': '#a888c0',
        '--accent': '#d0a0b8',
        '--card': '#30203a',
        '--border': '#483860',
        '--success': '#86efac',
        '--error': '#fca5a5',
        '--warning': '#fbbf24',
        '--info': '#a890c8',
        '--sidebar-bg': 'rgba(100,70,140,.3)',
        '--sidebar-text': '#e9d5ff',
        '--sidebar-active': '#ffffff'
      }
    }
  },

  apply: function(themeName, mode = 'light') {
    const theme = this.themes[themeName];
    if (!theme) return;

    const colors = theme[mode];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('currentTheme', themeName);
    localStorage.setItem('themeMode', mode);
    
    // Force recalculation of all CSS variables
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.querySelectorAll('[style*="color:var"]').forEach(el => {
        el.style.transition = 'color 0.3s ease';
      });
    }, 0);
  },

  loadSaved: function() {
    const savedTheme = localStorage.getItem('currentTheme') || 'default';
    const savedMode = localStorage.getItem('themeMode') || 'light';
    this.apply(savedTheme, savedMode);
  }
};

// Auto-load saved theme on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => themeCustomizer.loadSaved());
} else {
  themeCustomizer.loadSaved();
}
