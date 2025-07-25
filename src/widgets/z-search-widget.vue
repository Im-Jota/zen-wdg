<template>
  <div class="search">
    <img v-if="logo" :src="logo" />
    <Input placeholder="Search something" full class="bg" v-model="text" @enter-pressed="search()" />
    <Button icon="material-symbols-light:search-rounded" size="25px" flat class="text-color" @click="search()" />
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
      default: "same"
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
      if(this.searchTarget == 'new') {
        chrome.tabs.create({ url: url});
      } else if(this.searchTarget == 'same') {
        chrome.tabs.update({ url: url });
      }
    }
  }
}
</script>

<style scoped>
.search {
  width: 100%;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  padding: .2rem 1rem;
  border-radius: 5rem;
  border: .01rem solid var(--orange);
  box-shadow: 0 0 .4rem var(--border-color);
}

.search img {
  width: 20px;
}
</style>
