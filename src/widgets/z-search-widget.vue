<template>
  <div class="container-search">
    <div class="search">
      <div>
        <Dropdown :options="engines" v-model="engine" />
      </div>
      <Input placeholder="Search something" full class="bg-glass" v-model="text" @enter-pressed="search()" />
      <Button icon="material-symbols-light:search-rounded" size="25px" flat class="text-color" @click="search()" />
    </div>
  </div>
</template>

<script>
import Input from '../components/UI/Input.vue';
import Button from '../components/UI/Button.vue';
import Dropdown from '../components/UI/Dropdown.vue';
export default {
  name: 'ZSearchWidget',

  data() {
    return {
      text: '',
      engines: [
        {
          id: 1,
          logo: 'https://s1.qwant.com/thumbr/474x474/b/c/eae6b919559217567ef067dec4aa1e425d560667e5b8e51333bea1b60f4de7/OIP.G3kcQIn5w4kJtUilFbWaigHaHa.jpg?u=https%3A%2F%2Fthf.bing.com%2Fth%2Fid%2FOIP.G3kcQIn5w4kJtUilFbWaigHaHa%3Fr%3D0%26cb%3Dthfc1%26pid%3DApi&q=0&b=1&p=0&a=0',
          label: 'Qwant',
          search: `https://www.qwant.com/?l=es&q=`
        },
        {
          id: 2,
          logo: 'https://astian.org/wp-content/uploads/2025/06/favicon-1.png',
          label: 'MidoriGO',
          search: 'https://astiango.com/?q='
        }
      ],
      engine: {
        id: 1,
        logo: 'https://s1.qwant.com/thumbr/474x474/b/c/eae6b919559217567ef067dec4aa1e425d560667e5b8e51333bea1b60f4de7/OIP.G3kcQIn5w4kJtUilFbWaigHaHa.jpg?u=https%3A%2F%2Fthf.bing.com%2Fth%2Fid%2FOIP.G3kcQIn5w4kJtUilFbWaigHaHa%3Fr%3D0%26cb%3Dthfc1%26pid%3DApi&q=0&b=1&p=0&a=0',
        label: 'Qwant',
        search: `https://www.qwant.com/?l=es&q=`
      },
      urls: {
        url: 'https://www.qwant.com/?l=es&q=facebook+login&t=web',
      }
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
    Button,
    Dropdown
  },

  methods: {
    search() {
      console.log(this.engine.search)
      const url = `${this.engine.search}${this.text}`
      if (this.searchTarget == 'New Tab') {
        chrome.tabs.create({ url: url });
        this.text = '';
      } else if (this.searchTarget == 'Self Tab') {
        chrome.tabs.update({ url: url });
      }
    }
  }
}
</script>

<style scoped>
.container-search {
  width: 100%;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  background-color: rgba(20, 20, 20, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  padding: .4rem;
  border-radius: .6rem;
}

.search {
  width: 100%;
  background-color: rgba(10, 10, 10, .6);
  display: flex;
  align-items: center;
  padding: .3rem .8rem;
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
