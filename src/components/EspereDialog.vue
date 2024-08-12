<template>
  <Dialog
    header="Ejecutando"
    :visible="dialogShow"
    modal
    :closable="false"
    style="width: 50%;"
  >
    <p>Espere por favor{{ loadingText }}</p>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';

export default {
  name: 'EspereDialog',
  components: {
    Dialog
  },
  props: {

  },
  data() {
    return {
      loadingText: '',
      dialogShow: false,
    };
  },
  mounted() {
    this.startLoadingAnimation();
  },
  beforeDestroy() {
    this.stopLoadingAnimation();
  },
  methods: {
    startLoadingAnimation() {
      let count = 0;
      this.loadingInterval = setInterval(() => {
        count = (count + 1) % 6;
        this.loadingText = '.'.repeat(count);
      }, 500);
    },
    stopLoadingAnimation() {
      clearInterval(this.loadingInterval);
    },
    show() {
      this.dialogShow = true;
    },
    hide() {
      this.dialogShow = false;
    }
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>