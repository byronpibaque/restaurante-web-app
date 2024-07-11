<script>
import useSocket from "@/components/services/useSocket.js";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import DataView from "primevue/dataview";
import Tag from "primevue/tag";
import Button from "primevue/button";
import infoArqueoCajaEmpleadoService from "@/components/services/infoArqueoCajaEmpleadoService.js";
import {api} from "@/api.js";

export default {
  components: {
    TabView,
    TabPanel,
    DataTable,
    Column,
    DataView,
    Tag,
    Button,
  },
  data() {
    return {
      mesasDisponibles: [],
      activeIndex: 0,
      estadoCaja:false,

    };
  },
  created() {
    this.getMesasDisponibles();
    this.comprobarEstadoCaja();

  },
  methods: {
    async obtenerRoles() {
      const roles = this.$store.state.roles;
      const listaRoles = [];
      roles.forEach((rol) => {
        listaRoles.push(rol.rol);
      });
      return listaRoles;
    },
    async comprobarEstadoCaja(){
      try {
        const empleado_caja = this.$store.state.cajas[0];
        const roles = await this.obtenerRoles();
        const rolesEsAdminOCaja = roles.map((rol) => {
          return rol === "ADMINISTRADOR-SISTEMA" || rol === "ADMINISTRADOR-RESTAURANTE"|| rol === "CAJERO";
        });
        if(empleado_caja && rolesEsAdminOCaja ){
          const response = await infoArqueoCajaEmpleadoService.getByIdCajaEmpleado(api, empleado_caja.id_empleado_caja);
          if(response){
            if(response.estado==='Activo'){
              this.estadoCaja=true;
            }else if(response.estado==='Finalizado'){
              this.estadoCaja=false;
              this.$swal.fire({
                icon: "warning",
                title: "Ups 😢",
                text: `El arqueo de caja esta cerrado, no se pueden realizar mas acciones.`,
              });
            }
          }else{
            this.$swal.fire({
              icon: "error",
              title: "Ups 😢",
              text: `${response.data}`,
            });
          }
        }else{
          this.estadoCaja=true;
        }
      }
      catch (e){
        console.error(e);
        this.$swal.fire({
          icon: "error",
          title: "Ups 😢",
          text: `${e.data}`,
        });
      }
    },
    enviaACrearPedido(item){
      const params = {sucursal_id: item.sucursal_id,mesa_id:item.id_mesa};
      this.$router.push({
        name: 'info-pedidos',
        query: {params: JSON.stringify(params)}
      });
    },
    getMesasDisponibles() {
      const { emitEvent, listenEvent } = useSocket(this.$apiSocket);
      const sucursalId = this.$store.state.empleado.sucursal_id;
      const data = {
        sucursal_id: sucursalId,
      };
      emitEvent('getMesasDisponibles', { data });
      listenEvent('mesasDisponibles', (data) => {
        data.sort((a, b) => {
          const estadoOrder = {
            'Disponible': 0,
            'Reservada': 1,
            'Ocupada': 2
          };
          return estadoOrder[a.estado] - estadoOrder[b.estado];
        });
        this.mesasDisponibles = data;
      });
    },
    getStatusCategory(item) {
      switch (item.estado) {
        case 'Ocupada':
          return 'danger';
        case 'Reservada':
          return 'warning';
        case 'Disponible':
          return 'success';
      }
    },
  },
};
</script>

<template>
  <TabView :activeIndex.sync="activeIndex" @tab-change="limpiarTabs">
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="fas fa-utensils"></i>
          <span class="text-subtitle">Mesero</span>
        </div>
      </template>
      <div>
        <div>
          <DataView :value="mesasDisponibles">
            <template #list="slotProps">
              <div class="grid grid-nogutter">
                <div
                    v-for="(item, index) in slotProps.items"
                    :key="index"
                    class="col-12 sm:col-6 md:col-4 xl:col-6 p-2"
                >
                  <div class="p-4 border-1 surface-border surface-card border-round flex flex-column">
                    <div class="surface-50 flex justify-content-center border-round p-3">
                      <div class="relative mx-auto">
                        <img
                            class="border-round w-full"
                            src="@/assets/round-table.png"
                            style="max-width: 200px"
                        />
                        <Tag
                            :value="item.estado"
                            :severity="getStatusCategory(item)"
                            class="absolute"
                            style="left: 4px; top: 4px"
                        ></Tag>
                      </div>
                    </div>
                    <div class="pt-4">
                      <div class="flex flex-row justify-content-between align-items-start gap-2">
                        <div>

                          <div class="text-lg font-medium text-900 mt-1">
                           Mesa #{{ item.numero_mesa }}
                          </div>
                        </div>
                        <div class="surface-100 p-1" style="border-radius: 30px">
                          <div
                              class="surface-0 flex align-items-center gap-2 justify-content-center py-1 px-2"
                              style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                          >
                            <span class="text-900 font-medium text-sm">Capacidad: {{ item.capacidad }}</span>
                            <i class="pi pi-star-fill text-yellow-500"></i>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-column gap-4 mt-4">
                        <span class="text-2xl font-semibold text-900">
                          {{ item.estado }}
                        </span>
                        <div class="flex gap-2">
                          <Button
                              icon="pi pi-shopping-cart"
                              label="Crear Pedido"
                              :disabled="item.estado === 'Ocupada' || !estadoCaja"
                              class="flex-auto white-space-nowrap"
                              @click="enviaACrearPedido(item)"
                          ></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DataView>
        </div>
      </div>
    </TabPanel>
    <!--<TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="fas fa-cart-shopping"></i>
          <span class="text-subtitle">Cajero</span>
        </div>
      </template>
    </TabPanel>
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="fas fa-bicycle"></i>
          <span class="text-subtitle">Repartidor</span>
        </div>
      </template>
    </TabPanel>
    -->
  </TabView>
</template>
