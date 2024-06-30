import './assets/style-global.css'
import './assets/theme-global.css'
import { createApp } from 'vue'
import router from './router'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import store from './vuex_store.js'
import Swal from 'sweetalert2'
import ripple from 'vue-ripple-directive'
import Tooltip from 'primevue/tooltip';
import { api, apiSocket } from './api.js'
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'vue3-toastify/dist/index.css';
import Vue3Toastify, { toast } from 'vue3-toastify';
const app = createApp(App);

app.config.globalProperties.$swal = Swal;
app.config.globalProperties.$api = api;
app.config.globalProperties.$apiSocket = apiSocket;
app.config.globalProperties.$toast = toast;
app.use(PrimeVue);
app.use(Vue3Toastify);
app.use(router);
app.directive('tooltip', Tooltip);
app.directive('ripple', ripple)

app.use(store).mount('#app');