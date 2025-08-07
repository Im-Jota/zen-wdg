<template>
  <div class="container-search">
    <div class="search">
      <img v-if="logo" :src="logo" />
      <Input placeholder="Search something" full class="bg-glass" v-model="text" @enter-pressed="search()" />
      <Button icon="material-symbols-light:search-rounded" size="25px" flat class="text-color" @click="search()" />
    </div>
  </div>
</template>

<script>
import Input from '../components/UI/Input.vue';
import Button from '../components/UI/Button.vue';
export default {
  name: 'ZSearchWidget',

  data() {
    return {
      text: '',
    }
  },

  props: {
    searchTarget: {
      type: String,
      require: false,
      default: "Self Tab"
    },
    logo: {
      type: String,
      require: false,
    }
  },

  components: {
    Input,
    Button
  },

  methods: {
    search() {
      const query = encodeURIComponent(this.text);
      const url = `https://astiango.co/?q=${query}`;
      if(this.searchTarget == 'New Tab') {
        chrome.tabs.create({ url: url});
        this.text = '';
      } else if(this.searchTarget == 'Self Tab') {
        chrome.tabs.update({ url: url });
      }
    }
  }
}
</script>

<style scoped>
.container-search {
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background-color: rgba(20, 20, 20, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  padding: .5rem;
  border-radius: .6rem;
}

.search {
  width: 100%;
  background-color: rgba(10, 10, 10, .6);
  display: flex;
  align-items: center;
  padding: .2rem 1rem;
  border-radius: .5rem;
  box-shadow: 0 0 .4rem var(--border-color);
}

.bg-glass {
  background-color: transparent;
  color: var(--text-color);
}

.search img {
  width: 20px;
}
</style>
