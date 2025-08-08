<template>
    <div class="container" :class="{ 'show': show }" @click="toggleModal"></div>
</template>

<script>
export default {
    data() {
        return {
            show: false,
        }
    },

    methods: {
        toggleModal() {
            this.show = !this.show
        }
    }
}
</script>

<style scoped>
.container {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0);
    opacity: 0;
    transition: background-color 0.3s ease, opacity 0.3s ease;
    visibility: hidden;
    z-index: 5;
}

.container.show {
  visibility: visible;
  opacity: 1;
  background-color: rgba(10, 10, 10, .4);
}
</style>