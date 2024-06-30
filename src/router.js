import { createRouter, createWebHistory } from 'vue-router';
import Home from "@/components/Home.vue";
import AdmiParametro from "@/components/Administracion/AdmiParametro.vue";
import Login from "@/components/Login.vue";
import ErrorPage from "@/components/ErrorPage.vue";
import AccessDenied from "@/components/AccessDenied.vue";
import store from './vuex_store.js'
import ForgotPassword from "@/components/ForgotPassword.vue";
import AdmiCategoria from './components/Administracion/AdmiCategoria.vue';
import AdmiFormaPago from './components/Administracion/AdmiFormaPago.vue'
import AdmiImpuesto from './components/Administracion/AdmiImpuesto.vue';
import AdmiRoles from './components/Administracion/AdmiRoles.vue';
import AdmiPersona from './components/Administracion/AdmiPersona.vue';
import AdmiPropietario from './components/Administracion/AdmiPropietario.vue';
import AdmiEmpleado from './components/Administracion/AdmiEmpleado.vue';
import AdmiRestaurante from './components/Restaurante/AdmiRestaurante.vue';
import AdmiSucursal from './components/Restaurante/AdmiSucursal.vue';
import InfoMesa from './components/Restaurante/InfoMesa.vue'
import InfoCocina from './components/Restaurante/InfoCocina.vue';
import InfoCaja from './components/Restaurante/InfoCaja.vue';
import InfoMenu from './components/Restaurante/InfoMenu.vue';
import InfoPlato from './components/Restaurante/InfoPlato.vue';
import InfoProducto from './components/Restaurante/InfoProducto.vue';
import InfoCliente from './components/Financiero/InfoCliente.vue';
import InfoPedido from './components/Financiero/Pedidos/InfoPedido.vue';
import InfoFacturas from "@/components/Financiero/Facturas/InfoFacturas.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/admi-parametros', component: AdmiParametro, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-categorias', component: AdmiCategoria, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE']} },
    { path: '/admi-formapago', component: AdmiFormaPago, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-impuesto', component: AdmiImpuesto, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE']} },
    { path: '/admi-roles', component: AdmiRoles, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-personas', component: AdmiPersona, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-propietarios', component: AdmiPropietario, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-usuarios', component: AdmiEmpleado, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-restaurantes', component: AdmiRestaurante, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/admi-sucursales', component: AdmiSucursal, meta: { roles: ['ADMINISTRADOR-SISTEMA']} },
    { path: '/info-mesas', component: InfoMesa, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    { path: '/info-cocinas', component: InfoCocina, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE']}},
    { path: '/info-cajas', component: InfoCaja, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE']}},
    { path: '/info-menus', component: InfoMenu, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    { path: '/info-platos', component: InfoPlato, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    { path: '/info-productos', component: InfoProducto, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    { path: '/info-menus', component: InfoMenu, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    { path: '/info-clientes', component: InfoCliente, meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    {
        path: '/info-pedidos',
        name: 'info-pedidos',
        component: InfoPedido,
        props: route => ({ params: JSON.parse(route.query.params || '{}') }),
        meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','MESERO','CAJERO']}},
    {
        path: '/info-facturas/:pedido_id',
        name: 'info-facturas',
        component: InfoFacturas,
        props: true,
        meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','CAJERO']}
    },
    {
        path: '/info-facturas',
        name: 'info-facturas-sin-pedido',
        component: InfoFacturas,
        meta: { roles: ['ADMINISTRADOR-SISTEMA','ADMINISTRADOR-RESTAURANTE','CAJERO']}
    },
    { path: '/login', component: Login},
    { path: '/forgotyourpassword', name: 'forgotpassword', component: ForgotPassword },
    { path: '/access-denied', component: AccessDenied},
    { path: '/error-page/:msg', component: ErrorPage, props: true},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = store.state.isAuthenticated;
    const userRoles = store.state.roles.map(role => role.rol.toUpperCase());

    if (to.path === '/login' && isAuthenticated) {
        next({ path: '/' });
    }
    else if (to.path === '/forgotyourpassword') {
        next();
    }else if (to.path !== '/login' && !isAuthenticated) {
        next({ path: '/login' });
    }
    else if (to.meta.roles && !to.meta.roles.some(role => userRoles.includes(role.toUpperCase()))) {
        next({path: '/access-denied' });
    } else {
        next();
    }
})

export default router;