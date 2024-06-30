<template>
  <div>
    <div v-if="isAuthenticated">
      <div class="menu-container">
        <Menubar :model="mainItems">
          <template #item="{ item, props, hasSubmenu }">
            <a v-ripple class="flex align-items-center" v-bind="props.action" @click="handleClick(item.id)"
               v-tooltip="item.content">
              <i :class="item.icon"></i>
              <span class="ml-2">{{ item.content }}</span>
              <i v-if="hasSubmenu" class="pi pi-angle-right ml-auto"></i>
            </a>
          </template>
        </Menubar>
        <Menubar :model="profileItem" class="profile-item-menu">
          <template #item="{ item, props, hasSubmenu }">
            <a v-ripple class="flex align-items-center" v-bind="props.action" @click="handleClick(item.id)"
               v-tooltip="item.content">
              <i :class="item.icon"></i>
              <span class="ml-2">{{ item.content }}</span>
              <i v-if="hasSubmenu" class="pi pi-angle-right ml-auto"></i>
            </a>
          </template>
        </Menubar>
      </div>
      <Dialog v-model:visible="displayProfile" modal header="Perfil" :style="{ maxWidth: '20rem' }" :maximizable="true">
        <div class="row">
          <div class="col-sm-12 col-md-6">
            <p><strong class="text-subtitle">Nombre:</strong> <span class="text-body">{{ infoEmpleado.nombre_pila || 'No existe data.' }}</span></p>
            <p><strong class="text-subtitle">Identificación:</strong> <span class="text-body">{{
                infoEmpleado.numero_identificacion || 'No existe data.' }}</span></p>
            <p><strong class="text-subtitle">Roles:</strong>
              <ul v-if="this.$store.state.roles.length > 0">
                <li v-for="role in this.$store.state.roles" :key="role" class="text-body">{{ role.rol }}</li>
              </ul>
              <span v-else class="text-rojo"> No existe data</span>
            </p>
            <p><strong class="text-subtitle">Cajas:</strong>
              <ul v-if="this.$store.state.cajas.length > 0">
                <li v-for="caja in this.$store.state.cajas" :key="caja" class="text-body">{{ caja }}</li>
              </ul>
              <span v-else class="text-rojo"> No existe data.</span>
            </p>
            <p><strong class="text-subtitle">Cocinas:</strong>
              <ul v-if="this.$store.state.cocinas.length > 0">
                <li v-for="cocina in this.$store.state.cocinas" :key="cocina" class="text-body">{{ cocina }}</li>
              </ul>
              <span v-else class="text-rojo"> No existe data.</span>
            </p>
            <p><strong class="text-subtitle">Usuario:</strong> <span class="text-body">{{
                this.$store.state.empleado.usuario
                || 'No existe data.' }}</span></p>
            <p>
              <strong class="text-subtitle">Contraseña:</strong>
              <span v-if="showPassword">{{ $store.state.empleado.password }}</span>
              <span v-else>••••••••••</span>
              <i class="pi" :class="{ 'pi-eye': !showPassword, 'pi-eye-slash': showPassword }"
                 @click="togglePasswordVisibility" style="font-size: larger;"></i>
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-6">
            <div>
              <span class="text-subtitle">Cambio de contraseña</span>
              <input type="password" class="p-inputtext input-spacing" v-model="currentPassword"
                     placeholder="Clave actual" />
              <input type="password" class="p-inputtext input-spacing" v-model="newPassword"
                     placeholder="Nueva clave" />
              <button class="p-button p-button-success" @click="handleChangePassword">Cambiar contraseña</button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import Menubar from 'primevue/menubar';
import Dialog from 'primevue/dialog';
import Tooltip from 'primevue/tooltip';
import router from "@/router.js";
import store from './vuex_store.js'
import Swal from 'sweetalert2'
import { api , apiSocket } from './api.js';
import { infoEmpleadoGetById } from "@/components/services/infoEmpleadoService.js";
import changePasswordService from './components/services/changePasswordService.js';
import { toast } from 'vue3-toastify';
import useSocket from "@/components/services/useSocket.js";

export default {
  components: {
    Menubar,
    Dialog
  },
  setup() {
    const displayProfile = ref(false);
    const mainItems = ref([
      {
        id: 'home',
        content: 'Home',
        icon: 'pi pi-home'
      },
      {
        content: 'Administración',
        icon: 'pi pi-briefcase',
        items: [
          {
            id: 'parametros',
            content: 'Parámetros',
            icon: 'pi pi-sliders-v',
          },
          {
            id: 'categorias',
            content: 'Categorías',
            icon: 'pi pi-tags'
          },
          {
            id: 'f_pagos',
            content: 'Formas de Pago',
            icon: 'pi pi-money-bill'
          },
          {
            id: 'impuestos',
            content: 'Impuestos',
            icon: 'pi pi-dollar'
          },
          {
            id: 'roles',
            content: 'Roles',
            icon: 'pi pi-id-card'
          },
          {
            id: 'personas',
            content: 'Personas',
            icon: 'pi pi-users'
          },
          {
            id: 'propietarios',
            content: 'Propietarios',
            icon: 'pi pi-users'
          },
          {
            id: 'usuarios',
            content: 'Usuarios',
            icon: 'pi pi-users'
          }
        ]
      }, {
        content: 'Contabilidad',
        icon: 'pi pi-wallet',
        items: [
          {
            id: 'compras',
            content: 'Compras',
            icon: 'fas fa-cart-shopping',
          },
          {
            id: 'facturas',
            content: 'Facturas',
            icon: 'pi pi-shopping-bag',
          },
          {
            id: 'pedidos',
            content: 'Pedidos',
            icon: 'pi pi-book'
          },
          {
            id: 'clientes',
            content: 'Clientes',
            icon: 'pi pi-user'
          },
          {
            id: 'proveedores',
            content: 'Proveedores',
            icon: 'fas fa-dolly'
          },
          {
            id: 'arqueos',
            content: 'Arqueos de caja',
            icon: 'fas fa-cash-register'
          }
        ]
      }, {
        content: 'Restaurante',
        icon: 'pi pi-bars',
        items: [
          {
            id: 'restaurantes',
            content: 'Restaurantes',
            icon: 'pi pi-building'
          },
          {
            id: 'sucursales',
            content: 'Sucursales',
            icon: 'pi pi-shop'
          },
          {
            id: 'mesas',
            content: 'Mesas',
            icon: 'fas fa-utensils',
          },
          {
            id: 'cocinas',
            content: 'Cocinas',
            icon: 'fas fa-fire-burner'
          },
          {
            id: 'cajas',
            content: 'Cajas',
            icon: 'pi pi-desktop'
          },
          {
            id: 'menus',
            content: 'Menús',
            icon: 'pi pi-receipt'
          },
          {
            id: 'platos',
            content: 'Platos',
            icon: 'pi pi-book'
          },
          {
            id: 'productos',
            content: 'Productos',
            icon: 'fas fa-kitchen-set'
          },
          {
            id: 'reservaciones',
            content: 'Reservaciones',
            icon: 'fas fa-book-open'
          }
        ]
      }
    ]);
    const logout = () => {
      store.dispatch('removeToken');
      displayProfile.value = false;
      router.push('/login');
      window.location.reload();
    }
    const profileItem = ref([
      {
        id: 'perfil',
        icon: 'pi pi-user',
        content: 'Perfil',
        command: () => {
          displayProfile.value = true;
        }
      },
      {
        id: 'logout',
        icon: 'pi pi-sign-out',
        content: 'Cerrar sesión',
        command: () => {
          logout()
        }
      }
    ]);

    const isAuthenticated = computed(() => store.state.isAuthenticated);
    const showPassword = ref(false);

    function togglePasswordVisibility() {
      showPassword.value = !showPassword.value;
    }

    function handleClick(content) {
      switch (content) {
        case 'home':
          router.push('/');
          break;
        case 'administrador':
          break;
        case 'parametros':
          router.push('/admi-parametros');
          break;
        case 'categorias':
          router.push('/admi-categorias');
          break;
        case 'f_pagos':
          router.push('/admi-formapago');
          break;
        case 'impuestos':
          router.push('/admi-impuesto');
          break;
        case 'roles':
          router.push('/admi-roles');
          break;
        case 'personas':
          router.push('/admi-personas')
          break;
        case 'propietarios':
          router.push('/admi-propietarios')
          break;
        case 'usuarios':
          router.push('/admi-usuarios')
          break;
        case 'restaurantes':
          router.push('/admi-restaurantes')
          break;
        case 'sucursales':
          router.push('/admi-sucursales')
          break;
        case 'mesas':
          router.push('/info-mesas')
          break;
        case 'cocinas':
          router.push('/info-cocinas')
          break;
        case 'cajas':
          router.push('/info-cajas')
          break;
        case 'platos':
          router.push('/info-platos')
          break;
        case 'productos':
          router.push('/info-productos')
          break;
        case 'menus':
          router.push('/info-menus')
          break;
        case 'clientes':
          router.push('/info-clientes')
          break;
        case 'pedidos':
          router.push('/info-pedidos')
          break;
        case 'facturas':
          router.push('/info-facturas')
          break;
      }
    }

    const currentPassword = ref("");
    const newPassword = ref("");

    const handleChangePassword = async () => {
      const currentPwd = currentPassword.value;
      const newPwd = newPassword.value;
      try {
        const response = await changePasswordService.changePassword(api, store.state.empleado, { currentPwd, newPwd });
        if (response.success === true) {
          logout();
        } else {
          displayProfile.value = false;
          Swal.fire({
            icon: 'error',
            title: `Upss.. 😢`,
            text: `Error: ${response.data}`
          });
        }
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        displayProfile.value = false;
        Swal.fire({
          icon: 'error',
          title: `Upss.. 😢`,
          text: `Error:${error.data}`
        });
      }
    };

    const { emitEvent,listenEvent } = useSocket(apiSocket);

    let infoEmpleado = ref({});
    listenEvent('mensaje',(data)=>{
      console.log(data)
      toast(data,{
        autoClose: 2000,
      });
    });
    const handleInfoEmpleadoById = async () => {
      if (store.state.isAuthenticated) {
        const response = await infoEmpleadoGetById(api, store.state.empleado.empleado_id);
        try {
          if (response.success === true) {
            infoEmpleado.value = response.data;
            listenEvent('notificacion',(data)=>{
              toast(data.notify.message,{
                autoClose: 2000,
              });
            });

          }
        } catch (error) {
          console.error('Error al cambiar la contraseña:', error);
          displayProfile.value = false;
          Swal.fire({
            icon: 'error',
            title: `Upss.. 😢`,
            text: `Error:${error.data}`
          });
        }

      }

    }
    watch(
        () => store.state.isAuthenticated,
        (newValue, oldValue) => {
          if (newValue && !oldValue) {
            handleInfoEmpleadoById();
          }
        }
    );
    onMounted(() => {
      store.dispatch('loadToken');
    });
    return {
      logout,
      mainItems,
      profileItem,
      displayProfile,
      handleClick,
      Tooltip,
      isAuthenticated,
      togglePasswordVisibility,
      showPassword,
      handleChangePassword,
      currentPassword,
      newPassword,
      handleInfoEmpleadoById,
      infoEmpleado,
    }
  },
}
</script>
