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
        <a href="#" class="card-link" :class="theme == 'dark' ? 'dark' : 'light'" @click.prevent="openLink(item.url)">
          <div class="column">
            <div
              class="icon-container"
              :style="getIconStyle"
            >
              <img
                :src="item.logo"
                :alt="item.title + ' logo'"
                :class="{ small: small }"
                @error="onImageError($event, item.title)"
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
      default: true
    },
    categories: {
      type: Array,
      default: () => ['Personal', 'Work', 'Study']
    },
    open: {
      type: String,
      default: 'self'
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
        { title: 'Reddit', url: 'https://reddit.com', logo: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64' },
        { title: 'Spotify', url: 'https://spotify.com', logo: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64' },
        { title: 'Youtube', url: 'https://youtube.com', logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
        { title: 'Instagram', url: 'https://instagram.com', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
        { title: 'Facebook', url: 'https://facebook.com', logo: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64' },
        { title: 'WhatsApp', url: 'https://whatsapp.com', logo: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64' },
        { title: 'Telegram', url: 'https://web.telegram.org/', logo: 'https://www.google.com/s2/favicons?domain=web.telegram.org&sz=64' },
        { title: 'Spotify', url: 'https://spotify.com', logo: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64' }
      ],
      Work: [
        { title: 'GitHub', url: 'https://github.com', logo: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
        { title: 'Notion', url: 'https://notion.so', logo: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64' }
      ],
      Study: [
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', logo: 'https://www.google.com/s2/favicons?domain=mozilla.org&sz=64' },
        { title: 'FreeCodeCamp', url: 'https://freecodecamp.org', logo: 'https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64' }
      ]
    };

    const bookmarks = this.useStorage
      ? JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultBookmarks
      : defaultBookmarks;

    return {
      STORAGE_KEY,
      bookmarks,
      activeTab: 'Personal'
    };
  },
  computed: {
    currentBookmarks() {
      return this.bookmarks[this.activeTab] || [];
    },
    getIconStyle() {
      return {
        position: 'relative',
        width: this.small ? '50px' : '40px',
        height: this.small ? '50px' : '40px',
        marginBottom: '8px',
        borderRadius: '.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.8rem',
        color: this.theme === 'light' ? '#555' : '#eee',
        userSelect: 'none'
      };
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
      item.logo = `https://www.google.com/s2/favicons?domain=${new URL(newUrl).hostname}&sz=64`;
      this.saveState();
    },
    addBookmarkPrompt() {
      const title = prompt('Nombre del marcador:');
      if (!title) return;
      const url = prompt('URL del marcador:');
      if (!url) return;
      const logo = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
      this.bookmarks[this.activeTab].push({ title, url, logo });
      this.saveState();
    },
    onImageError(event, title) {
      const img = event.target;
      img.style.display = 'none';
      const iconContainer = img.parentNode;
      iconContainer.style.backgroundColor = '#066D5A';
      iconContainer.textContent = title.charAt(0).toUpperCase();
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
  background: rgba(220, 220, 220, 0.4);
  color: #444444;
  padding: 0.2rem;
  border-radius: 0.6rem;
  align-self: start;
}

.tabs.dark {
  background: rgba(0, 0, 0, 0.4);
  color: #dfdfdf;
}

.container-tab {
  position: relative;
}


.tab {
  padding: 8px 2rem;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
  background-color: transparent;
  color: unset;
}

.tab.active {
  background-color: #066D5A;
  color: white;
  border-radius: 0.5rem;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
}

.card {
  position: relative;
  flex: 1 1 100px;
}

.card.small {
  flex: 1 1 180px;
}

.card-link {
  height: 106px;
  padding: 16px;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(200, 200, 200, 0.3);
  backdrop-filter: blur(0.2rem);
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  color: #202020;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.card-link.dark {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(0.2rem);
  color: #fff;
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

.card-link img {
  width: 100%;
  max-width: 40px;
  border-radius: 0.4rem;
  margin-bottom: 8px;
}

.card-link img.small {
  max-width: 50px;
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