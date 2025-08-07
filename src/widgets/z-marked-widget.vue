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

.card-link img {
  width: 100%;
  max-width: 50px;
  height: 100%;
  height: 50px;
  border-radius: 0.4rem;
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