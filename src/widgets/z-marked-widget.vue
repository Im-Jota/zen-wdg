<template>
  <div class="container-marked">
    <div class="tabs" :class="[theme == 'dark' ? 'dark' : 'light']">
      <div v-for="tab in categories" :key="tab" class="container-tab" >
        <button
          class="tab"
          :class="{ active: tab === activeTab }"
          @click="setActiveTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div class="grid">
      <div
        v-for="(item, index) in currentBookmarks"
        :key="index"
        :class="['card', small ? 'small' : '' ]"
      >
        <div class="option-app">
          <button class="edit-app" @click.prevent="editBookmark(index)">✏️</button>
          <button class="delete-app" @click.prevent="deleteBookmark(index)">🗑️</button>
        </div>
        <a 
          :href="item.url"
          class="card-link"
          :class="theme == 'dark' ? 'dark' : 'light'"
          :target="open == 'Self Tab' ? '_self' : '_blank'">
          <div class="column">
            <div
              class="logo-container"
            >
              <img
                :src="getFaviconUrl(item)"
                :alt="item.title + ' logo'"
                :class="{ small: small }"
                @error="onImageError($event, item)"
              />
            </div>
            {{ item.title }}
          </div>
        </a>
      </div>

      <!-- Add Button -->
      <div v-if="currentBookmarks.length < 8" :class="['card', small ? 'small' : '']">
        <a href="#" class="card-link" @click.prevent="addBookmarkPrompt" :class="theme == 'dark' ? 'dark' : 'light'">
          <div class="column">
            <span class="add">+</span>
            Add
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZMarkedWidget',
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    small: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      default: () => ['Personal', 'Work', 'Study']
    },
    open: {
      type: String,
      default: 'Self Tab'
    },
    useStorage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const STORAGE_KEY = 'bookmark_manager_state';

    const defaultBookmarks = {
      Personal: [
        {
          title: 'Astian',
          url: 'https://astian.org/',
          domain: 'astian.org'
        },
        { 
          title: 'Amazon',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM9HD56Q0VD2QZXQ2AR505&url=https%3A%2F%2Famazon.com',
          domain: 'amazon.com'
        },
        {
          title: 'Avast',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM8H9350F4CBP07A8V7C5T&url=http%3A%2F%2Favast.com%2F',
          domain: 'avast.com'
        },
        {
          title: 'Youtube',
          url: 'https://youtube.com',
          domain: 'youtube.com'
        },
        {
          title: 'Instagram',
          url: 'https://instagram.com',
          domain: 'instagram.com'
        },
        {
          title: 'Wish.com',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM8H9350F4CBP07A8V7C5T&url=http%3A%2F%2Fwish.com',
          domain: 'wish.com'
        },
        { 
          title: 'Prime',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM8H9350F4CBP07A8V7C5T&url=http%3A%2F%2Fprimevideo.com',
          domain: 'primevideo.com'
        },
        { 
          title: 'Shein',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM8H9350F4CBP07A8V7C5T&url=http%3A%2F%2Fshein.com',
          domain: 'shein.com'
        }
      ],
      Work: [
        { 
          title: 'GitHub',
          url: 'https://github.com',
          domain: 'github.com'
        },
        {
          title: 'Notion',
          url: 'https://notion.so',
          domain: 'notion.so'
        }
      ],
      Study: [
        {
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          domain: 'mozilla.org'
        },
        {
          title: 'FreeCodeCamp',
          url: 'https://freecodecamp.org',
          domain: 'freecodecamp.org'
        },
        {
          title: 'Udemy',
          url: 'https://r.v2i8b.com/api/v1/bid/redirect?campaign_id=01JVSM8H9350F4CBP07A8V7C5T&url=http%3A%2F%2Fudemy.com%2F',
          domain: 'udemy.com'
        }
      ]
    };

    const bookmarks = this.useStorage
      ? JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultBookmarks
      : defaultBookmarks;

    return {
      STORAGE_KEY,
      bookmarks,
      activeTab: 'Personal',
      faviconAttempts: {}
    };
  },
  computed: {
    currentBookmarks() {
      return this.bookmarks[this.activeTab] || [];
    }
  },
  methods: {
    saveState() {
      if (this.useStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bookmarks));
      }
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    openLink(url) {
      if (this.open === 'self') {
        window.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    },
    deleteBookmark(index) {
      const item = this.bookmarks[this.activeTab][index];
      if (confirm(`¿Estás seguro de eliminar ${item.title}?`)) {
        this.bookmarks[this.activeTab].splice(index, 1);
        this.saveState();
      }
    },
    editBookmark(index) {
      const item = this.bookmarks[this.activeTab][index];
      const newTitle = prompt('Nuevo título:', item.title);
      if (newTitle === null) return;
      const newUrl = prompt('Nueva URL:', item.url);
      if (newUrl === null) return;
      item.title = newTitle;
      item.url = newUrl;
      item.domain = new URL(newUrl).hostname;
      delete item.logo; // Limpiar logo antiguo para regeneración
      this.saveState();
    },
    addBookmarkPrompt() {
      const title = prompt('Nombre del marcador:');
      if (!title) return;
      const url = prompt('URL del marcador:');
      if (!url) return;
      const domain = new URL(url).hostname;
      this.bookmarks[this.activeTab].push({ title, url, domain });
      this.saveState();
    },
    getFaviconUrl(item) {
      // Si ya existe logo guardado, usarlo
      if (item.logo) return item.logo;
      
      const domain = item.domain || this.extractDomain(item.url);
      const attempt = this.faviconAttempts[domain] || 0;
      
      // Lista de servicios de favicon en orden de prioridad
      const services = [
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://logo.clearbit.com/${domain}`,
        `https://favicons.githubusercontent.com/${domain}`,
        `https://${domain}/favicon.ico`
      ];
      
      return services[Math.min(attempt, services.length - 1)];
    },
    
    extractDomain(url) {
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    },
    
    onImageError(event, item) {
      const img = event.target;
      const domain = item.domain || this.extractDomain(item.url);
      const currentAttempt = this.faviconAttempts[domain] || 0;
      
      // Máximo 5 intentos (todos los servicios)
      if (currentAttempt < 4) {
        // Intentar siguiente servicio
        this.faviconAttempts[domain] = currentAttempt + 1;
        img.src = this.getFaviconUrl(item);
      } else {
        // Fallback final: mostrar letra inicial
        img.style.display = 'none';
        const iconContainer = img.parentNode;
        
        // Generar color basado en el título
        const colors = ['#066D5A', '#0891b2', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a'];
        const colorIndex = item.title.charCodeAt(0) % colors.length;
        
        iconContainer.style.backgroundColor = colors[colorIndex];
        iconContainer.style.display = 'flex';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.justifyContent = 'center';
        iconContainer.style.fontSize = '1.5rem';
        iconContainer.style.fontWeight = 'bold';
        iconContainer.style.color = 'white';
        iconContainer.textContent = item.title.charAt(0).toUpperCase();
      }
    }
  },
  watch: {
    bookmarks: {
      handler() {
        this.saveState();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.container-marked {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tabs {
  width: auto;
  height: auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #444444;
  padding: 0.2rem;
  border-radius: 0.6rem;
  align-self: start;
}

.tabs.dark {
  background: rgba(20, 20, 20, 0.3);
  color: #dfdfdf;
}

.container-tab {
  position: relative;
}


.tab {
  padding: 8px 2rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-color: transparent;
  color: unset;
}

.tab.active {
  background-color: rgba(6, 109, 90, 0.3);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 0.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: .4rem;
}

.grid.small {
  gap: 1.4rem;
}

.card {
  position: relative;
  flex: 1 1 80px;
}

.card.small {
  flex: 1 1 180px;
}

.card-link {
  height: 115px;
  padding: 16px;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(225, 225, 225, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  color: #202020;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.card-link:hover {
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background-color: rgba(220, 220, 220, .6);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-link.dark {
  background-color: rgba(20, 20, 20, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.card-link.dark:hover {
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background-color: rgba(10, 10, 10, .6);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.option-app {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  gap: 0.4rem;
}

.card:hover .option-app {
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-app,
.edit-app {
  cursor: pointer;
  border-radius: 0.2rem;
  width: 23px;
  height: 23px;
  border: none;
  font-size: 0.8rem;
}

.edit-app {
  font-size: 1rem;
}

.logo-container {
  width: 50px;
  height: 50px;
  border-radius: 0.4rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card.small .logo-container {
  width: 55px;
  height: 55px;
}

.card-link img {
  width: 100%;
  max-width: 50px;
  height: 100%;
  height: 50px;
  border-radius: 0.4rem;
  object-fit: cover;
}

.card-link img.small {
  max-width: 55px;
  height: 55px;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.add {
  width: 50px;
  height: 50px;
  background: gray;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  font-size: 2rem;
  line-height: 50px;
  color: white;
  user-select: none;
}
</style>