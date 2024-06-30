<template>
  <div id="app" class="container-login">
    <h1 class="text-azul">Login</h1>
    <form @submit.prevent="login">
      <div class="input-group">
        <label for="user">Usuario:</label>
        <input id="user" v-model="user" type="text" required>
      </div>
      <div class="input-group">
        <label for="password">Contraseña:</label>
        <input id="password" v-model="password" type="password" required>
      </div>
      <a :href="$router.resolve({ name: 'forgotpassword' }).href">¿Olvidaste tu contraseña?</a>
      <button type="submit" class="boton-verde-login" @click="login">Login</button>

    </form>
  </div>

</template>

<script>

export default {
  data() {
    return {
      user: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const params = {
          usuario: this.user,
          password: this.password
        }
        const response = await this.$api.post('/infoAccesoEmpleado/login',params);
        const resp = response.data;
        if(resp.success===true){
          let payload = {
            token: resp.data.token,
            empleado: resp.data.empleado,
            roles: resp.data.roles,
            cocinas: resp.data.cocinas,
            cajas: resp.data.cajas
          };
          this.$store.dispatch('saveToken', payload);
          this.$router.push('/');
        }
      }catch(e) {
        const data = e.response;
        console.log(e);
        console.log('Error Response:', data);
        this.$swal.fire({
          icon:'error',
          title:`Upss.. 😢 ${data.status}`,
          text:`${data?.data?.data}`
        });
      }
    }
  }
};
</script>
