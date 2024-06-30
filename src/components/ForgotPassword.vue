<template>
<div class="container">
  <Card style="width: 25rem;">
    <template #header>

    </template>
    <template #title><span class="text-title">
          Cambio de contraseña
      </span></template>
    <template #subtitle>Olvidaste tu contraseña</template>
    <template #content>
      <p class="m-0">
        Si olvidaste tu contraseña, digita a continuación, tu numero de identificacion, y la nueva contraseña que deseas actualizar.
      </p>
      <input type="text" class="p-inputtext input-spacing" v-model="numero_identificacion" placeholder="Numero de identificacion"/>
      <input type="password" class="p-inputtext input-spacing" v-model="newPassword" placeholder="Nueva clave"/>
    </template>
    <template #footer>
      <div class="flex gap-3 mt-1">
        <button class="p-button p-button-success" @click="handleChangePassword">Cambiar contraseña</button>
      </div>
      <div class="flex gap-3 mt-1">
        <a href="/" class="goto-home">Volver a la página de inicio</a>
      </div>
    </template>
  </Card>
</div>
</template>
<script>

import Card from 'primevue/card';
import changePasswordService from './services/changePasswordService';
export default {
  components:{
    Card
  },
  data() {
    return {
      numero_identificacion: '',
      newPassword: ''
    };
  },
  methods: {
    limpiar(){
      this.numero_identificacion= '',
      this.newPassword= ''
    },
    async handleChangePassword() {
      try {
        const response = await changePasswordService.changePasswordByCi(this.$api, {
          password: this.newPassword,
          numero_identificacion: this.numero_identificacion
        });
        if (response.success === true) {
          this.$swal.fire({
            icon: 'success',
            title: `OK`,
            text: `Contraseña actualizada...`
          });
          this.limpiar();
        } else {
          this.$swal.fire({
            icon: 'error',
            title: `Upss.. 😢`,
            text: `Error: ${response.data}`
          });
        }
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        this.$swal.fire({
          icon: 'error',
          title: `Upss.. 😢`,
          text: `Error:${error.data}`
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2em;
}

.goto-home {
  margin-top: 2em;
  text-decoration: none;
  color: #000;
  border: 1px solid #000;
  padding: 0.5em 1em;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.goto-home:hover {
  background-color: #000;
  color: #fff;
}
</style>