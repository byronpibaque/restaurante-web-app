<template>
  <div id="error-page">
    <h1 class="text-rojo">Error</h1>
    <p>Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.</p>
    <p>Mensaje:</p>
    <p>{{ msg }}</p>
    <a href="/" class="goto-home">Volver a la página de inicio</a>
  </div>
</template>

<script>
export default {
  name: 'Error'
};
</script>

<style>
#error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2em;
}

#error-page .goto-home {
  margin-top: 2em;
  text-decoration: none;
  color: #000;
  border: 1px solid #000;
  padding: 0.5em 1em;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#error-page .goto-home:hover {
  background-color: #000;
  color: #fff;
}
</style>