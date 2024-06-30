<template>
  <div id="access-denied">
    <h1>Acceso Denegado</h1>
    <p>No tienes permisos para acceder a esta página.</p>
    <a href="/" class="goto-home">Volver a la página de inicio</a>
  </div>
</template>

<script>
export default {
  name: 'AccessDenied'
};
</script>

<style scoped>
#access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2em;
}

#access-denied .goto-home {
  margin-top: 2em;
  text-decoration: none;
  color: #000;
  border: 1px solid #000;
  padding: 0.5em 1em;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#access-denied .goto-home:hover {
  background-color: #000;
  color: #fff;
}
</style>