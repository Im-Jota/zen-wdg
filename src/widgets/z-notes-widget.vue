<template>
  <div class="notes-widget">
    <div class="notes-header">
      <h2 class="notes-title">📝 Notas</h2>
      <div class="header-actions">
        <button @click="showCategoryManager = !showCategoryManager" class="icon-btn" title="Gestionar Categorías">
          🏷️
        </button>
        <button @click="exportNotes" class="icon-btn" title="Exportar Notas">
          💾
        </button>
        <button @click="toggleNewNote" class="icon-btn add-btn" title="Nueva Nota">
          ➕
        </button>
      </div>
    </div>

    <!-- Category Manager Modal -->
    <transition name="modal">
      <div v-if="showCategoryManager" class="modal-overlay" @click="showCategoryManager = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>🏷️ Gestionar Categorías</h3>
            <button @click="showCategoryManager = false" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="category-form">
              <input 
                v-model="newCategoryName" 
                @keypress.enter="addCategory"
                placeholder="Nombre de categoría"
                class="category-input"
              />
              <input 
                v-model="newCategoryColor" 
                type="color"
                class="color-picker"
              />
              <button @click="addCategory" class="add-category-btn">Agregar</button>
            </div>
            <div class="categories-list">
              <div 
                v-for="category in categories" 
                :key="category.id"
                class="category-item"
              >
                <span 
                  class="category-color-preview" 
                  :style="{ backgroundColor: category.color }"
                ></span>
                <span class="category-name">{{ category.name }}</span>
                <button 
                  v-if="category.id !== 'default'"
                  @click="deleteCategory(category.id)" 
                  class="delete-category-btn"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- New Note Form -->
    <transition name="slide">
      <div v-if="showNewNoteForm" class="new-note-form">
        <input 
          v-model="newNote.title"
          placeholder="Título de la nota..."
          class="note-title-input"
          ref="titleInput"
        />
        <textarea 
          v-model="newNote.content"
          placeholder="Escribe tu nota aquí..."
          class="note-content-input"
          rows="4"
        ></textarea>
        <div class="note-form-actions">
          <select v-model="newNote.categoryId" class="category-select">
            <option value="">Sin categoría</option>
            <option 
              v-for="category in categories.filter(c => c.id !== 'default')" 
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <div class="form-buttons">
            <button @click="cancelNewNote" class="cancel-btn">Cancelar</button>
            <button @click="saveNote" class="save-btn">Guardar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Filter and Sort -->
    <div class="notes-controls">
      <div class="filter-controls">
        <button 
          @click="filterCategory = null"
          :class="['filter-btn', { active: filterCategory === null }]"
        >
          📋 Todas
        </button>
        <button 
          @click="filterCategory = 'pinned'"
          :class="['filter-btn', { active: filterCategory === 'pinned' }]"
        >
          📌 Fijadas
        </button>
        <button 
          v-for="category in categories.filter(c => c.id !== 'default')" 
          :key="category.id"
          @click="filterCategory = category.id"
          :class="['filter-btn', { active: filterCategory === category.id }]"
          :style="{ borderColor: category.color, color: filterCategory === category.id ? category.color : '' }"
        >
          {{ category.name }}
        </button>
      </div>
      <div class="sort-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="date">📅 Fecha</option>
          <option value="title">🔤 Título</option>
          <option value="category">🏷️ Categoría</option>
        </select>
      </div>
    </div>

    <!-- Notes List -->
    <div class="notes-list">
      <div v-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No hay notas</p>
        <button @click="toggleNewNote" class="create-first-note-btn">
          Crear primera nota
        </button>
      </div>

      <transition-group name="note-list" tag="div" class="notes-grid">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          :class="['note-card', { pinned: note.isPinned }]"
          :style="{ borderLeftColor: getNoteColor(note) }"
        >
          <div class="note-card-header">
            <button 
              @click="togglePin(note.id)" 
              :class="['pin-btn', { pinned: note.isPinned }]"
              title="Fijar/Desfijar"
            >
              {{ note.isPinned ? '📌' : '📍' }}
            </button>
            <button @click="deleteNote(note.id)" class="delete-btn" title="Eliminar">
              🗑️
            </button>
          </div>
          
          <h3 class="note-title">{{ note.title || 'Sin título' }}</h3>
          <p class="note-content">{{ note.content }}</p>
          
          <div class="note-footer">
            <span 
              v-if="note.categoryId"
              class="note-category"
              :style="{ 
                backgroundColor: getCategoryColor(note.categoryId),
                color: 'white'
              }"
            >
              {{ getCategoryName(note.categoryId) }}
            </span>
            <span class="note-date">{{ formatDate(note.createdAt) }}</span>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Stats Footer -->
    <div class="notes-stats">
      <span>Total: {{ notes.length }} notas</span>
      <span v-if="pinnedNotesCount > 0">📌 {{ pinnedNotesCount }} fijadas</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZNotesWidget',
  data() {
    return {
      notes: [],
      categories: [
        { id: 'default', name: 'Sin categoría', color: '#6b7280' }
      ],
      showNewNoteForm: false,
      showCategoryManager: false,
      newNote: {
        title: '',
        content: '',
        categoryId: ''
      },
      newCategoryName: '',
      newCategoryColor: '#3b82f6',
      filterCategory: null,
      sortBy: 'date',
      storageKey: 'zen-notes-widget',
      categoriesKey: 'zen-notes-categories'
    }
  },
  computed: {
    filteredNotes() {
      let filtered = [...this.notes]

      // Filter by category
      if (this.filterCategory === 'pinned') {
        filtered = filtered.filter(note => note.isPinned)
      } else if (this.filterCategory) {
        filtered = filtered.filter(note => note.categoryId === this.filterCategory)
      }

      // Sort
      filtered.sort((a, b) => {
        if (this.sortBy === 'date') {
          return new Date(b.createdAt) - new Date(a.createdAt)
        } else if (this.sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '')
        } else if (this.sortBy === 'category') {
          const catA = this.getCategoryName(a.categoryId)
          const catB = this.getCategoryName(b.categoryId)
          return catA.localeCompare(catB)
        }
        return 0
      })

      // Pinned notes always first
      return filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
    },
    pinnedNotesCount() {
      return this.notes.filter(note => note.isPinned).length
    }
  },
  methods: {
    toggleNewNote() {
      this.showNewNoteForm = !this.showNewNoteForm
      if (this.showNewNoteForm) {
        this.$nextTick(() => {
          this.$refs.titleInput?.focus()
        })
      }
    },
    saveNote() {
      if (!this.newNote.content.trim()) return

      const note = {
        id: Date.now().toString(),
        title: this.newNote.title.trim(),
        content: this.newNote.content.trim(),
        categoryId: this.newNote.categoryId,
        isPinned: false,
        createdAt: new Date().toISOString()
      }

      this.notes.unshift(note)
      this.saveToStorage()
      this.cancelNewNote()
    },
    cancelNewNote() {
      this.newNote = {
        title: '',
        content: '',
        categoryId: ''
      }
      this.showNewNoteForm = false
    },
    async deleteNote(id) {
      const confirmed = await window.ZenModals.showDeleteConfirm('esta nota')
      if (confirmed) {
        this.notes = this.notes.filter(note => note.id !== id)
        this.saveToStorage()
      }
    },
    togglePin(id) {
      const note = this.notes.find(n => n.id === id)
      if (note) {
        note.isPinned = !note.isPinned
        this.saveToStorage()
      }
    },
    addCategory() {
      if (!this.newCategoryName.trim()) return

      const category = {
        id: Date.now().toString(),
        name: this.newCategoryName.trim(),
        color: this.newCategoryColor
      }

      this.categories.push(category)
      this.saveCategoriesToStorage()
      this.newCategoryName = ''
      this.newCategoryColor = '#3b82f6'
    },
    async deleteCategory(id) {
      const confirmed = await window.ZenModals.showConfirm({
        title: '¿Eliminar categoría?',
        message: 'Las notas de esta categoría no se eliminarán, solo la categoría.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmButtonClass: 'danger'
      })
      if (confirmed) {
        this.categories = this.categories.filter(cat => cat.id !== id)
        this.saveCategoriesToStorage()
      }
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.name : 'Sin categoría'
    },
    getCategoryColor(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.color : '#6b7280'
    },
    getNoteColor(note) {
      if (note.categoryId) {
        return this.getCategoryColor(note.categoryId)
      }
      return '#6b7280'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60))
          return minutes === 0 ? 'Ahora' : `Hace ${minutes}m`
        }
        return `Hace ${hours}h`
      } else if (days === 1) {
        return 'Ayer'
      } else if (days < 7) {
        return `Hace ${days} días`
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    },
    exportNotes() {
      if (this.notes.length === 0) {
        alert('No hay notas para exportar')
        return
      }

      let exportText = '# MIS NOTAS\n'
      exportText += `# Exportado el ${new Date().toLocaleString('es-ES')}\n\n`
      exportText += '═'.repeat(60) + '\n\n'

      const notesByCategory = {}
      
      this.notes.forEach(note => {
        const categoryName = this.getCategoryName(note.categoryId)
        if (!notesByCategory[categoryName]) {
          notesByCategory[categoryName] = []
        }
        notesByCategory[categoryName].push(note)
      })

      Object.keys(notesByCategory).sort().forEach(categoryName => {
        exportText += `## 🏷️ ${categoryName.toUpperCase()}\n`
        exportText += '─'.repeat(60) + '\n\n'

        notesByCategory[categoryName].forEach(note => {
          exportText += `### ${note.title || 'Sin título'}`
          if (note.isPinned) exportText += ' 📌'
          exportText += '\n'
          exportText += `Fecha: ${new Date(note.createdAt).toLocaleString('es-ES')}\n\n`
          exportText += `${note.content}\n\n`
          exportText += '─'.repeat(60) + '\n\n'
        })
      })

      exportText += '\n═'.repeat(60) + '\n'
      exportText += `Total de notas: ${this.notes.length}\n`
      exportText += `Notas fijadas: ${this.pinnedNotesCount}\n`

      // Create and download file
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `notas_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('✅ Notas exportadas exitosamente')
    },
    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notes))
      } catch (e) {
        console.error('Error al guardar notas:', e)
      }
    },
    loadFromStorage() {
      try {
        const data = localStorage.getItem(this.storageKey)
        if (data) {
          this.notes = JSON.parse(data)
        }
      } catch (e) {
        console.error('Error al cargar notas:', e)
      }
    },
    saveCategoriesToStorage() {
      try {
        localStorage.setItem(this.categoriesKey, JSON.stringify(this.categories))
      } catch (e) {
        console.error('Error al guardar categorías:', e)
      }
    },
    loadCategoriesFromStorage() {
      try {
        const data = localStorage.getItem(this.categoriesKey)
        if (data) {
          const loaded = JSON.parse(data)
          // Ensure default category exists
          if (!loaded.find(c => c.id === 'default')) {
            loaded.unshift({ id: 'default', name: 'Sin categoría', color: '#6b7280' })
          }
          this.categories = loaded
        }
      } catch (e) {
        console.error('Error al cargar categorías:', e)
      }
    }
  },
  mounted() {
    this.loadCategoriesFromStorage()
    this.loadFromStorage()
  }
}
</script>

<style scoped>
.notes-widget {
  width: 100%;
  max-width: 900px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 25px;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header */
.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.notes-title {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.add-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.add-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.5rem;
}

.close-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ef4444;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  max-height: 400px;
  overflow-y: auto;
}

/* Category Form */
.category-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.category-input {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.category-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

.color-picker {
  width: 60px;
  height: 45px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: transparent;
}

.add-category-btn {
  padding: 0 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Categories List */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-color-preview {
  width: 25px;
  height: 25px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.category-name {
  flex: 1;
  color: #e2e8f0;
  font-weight: 500;
}

.delete-category-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.delete-category-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

/* New Note Form */
.new-note-form {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.note-title-input,
.note-content-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-family: inherit;
  margin-bottom: 12px;
}

.note-title-input {
  font-size: 1.1rem;
  font-weight: 600;
}

.note-title-input:focus,
.note-content-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

.note-content-input {
  resize: vertical;
  min-height: 100px;
}

.note-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.category-select {
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.9rem;
}

.category-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-buttons {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Controls */
.notes-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.filter-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

.sort-controls {
  display: flex;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.85rem;
}

.sort-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Notes List */
.notes-list {
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.create-first-note-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-first-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Notes Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.note-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-left: 4px solid #6b7280;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.note-card.pinned {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.pin-btn,
.delete-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.pin-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.pin-btn.pinned {
  background: rgba(59, 130, 246, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.note-title {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-content {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.9rem;
  line-height: 1.6;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.note-category {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-date {
  color: #64748b;
  font-size: 0.75rem;
}

/* Stats */
.notes-stats {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.note-list-enter-active,
.note-list-leave-active {
  transition: all 0.3s ease;
}

.note-list-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.note-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.note-list-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .notes-widget {
    padding: 15px;
  }

  .notes-title {
    font-size: 1.5rem;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .notes-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls,
  .sort-controls {
    width: 100%;
  }

  .filter-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
