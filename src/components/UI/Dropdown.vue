<template>
  <div class="container" ref="dropdown">
    <div class="row select" @click="toggleDropdown">
      <span v-if="selected">
        <img v-if="selected.logo" :src="selected.logo" class="logo" />
      </span>
      <span v-else class="placeholder">Selecciona una opción</span>
    </div>

    <div class="column list" v-if="isOpen">
      <template v-for="(item, index) in options">
        <div class="item row" :class="{ 'active' : item.id == selected.id }" @click="selectItem(item)">
          <span v-if="item.logo">
            <img :src="item.logo" class="logo" />
          </span>
          <span v-if="item.label">{{ item.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dropdown',
  props: {
    modelValue: Object,
    options: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Seleccionar...',
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },

  created() {},

  computed: {
    selected() {
      return this.modelValue;
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },

    selectItem(item) {
      this.$emit("update:modelValue", item);
      this.isOpen = false;
    },

    selectOption(option) {
      this.selectedOption = option
      this.isOpen = false

      this.$emit('update:modelValue', option)
      this.$emit('change', option) // <- este es el que usás desde afuera
    },
    handleClickOutside(event) {
      if (!this.$refs.dropdown.contains(event.target)) {
        this.isOpen = false
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
}
</script>

<style scoped>
.container {
  position: relative;
}

.select {
  border-radius: var(--zen-radius-sm);
  gap: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select > span {
  display: flex;
  align-items: center;
}

.list {
  position: absolute;
  width: 200px;
  top: 110%;
  left: 0;
  padding: .2rem;
  border-radius: var(--zen-radius-sm);
  gap: .2rem;
  display: flex;
  flex-direction: column;
  
  box-shadow: var(--zen-shadow);
  background-color: var(--zen-surface-overlay);
  border: 1px solid var(--zen-border-light);
}

.item {
  gap: 1rem;
  padding: .2rem .4rem;
  border-radius: var(--zen-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: var(--zen-bg-secondary);
  height: 40px;
}

.item.active {
  background-color: var(--zen-accent);
}

.item:hover {
  background-color: var(--zen-accent);
}

.theme-selector-popup {
  max-height: 200px;
}

.logo {
  width: 30px;
  border-radius: var(--zen-radius-sm);
  border: 1px solid var(--zen-border);
}
</style>
