<template>
  <span class="text-title">Pedidos</span>

  <TabView :activeIndex.sync="activeIndex" @tab-change="limpiarTabs">
    <TabPanel :disabled="!estadoCaja">
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-plus"></i>
          <span class="text-subtitle">Pedido</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-6" v-if="esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="nuevoRegistro.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
                        dropdown
                        @keypress.enter="getMesas" @input="getMesas" field="label"/>
        </div>
        <div class="col-6">
          <AutoComplete id="mesas" :disabled="esDelivery" class="w-12" placeholder="Mesas:" v-model="nuevoRegistro.mesaId"
                        :suggestions="mesaArray" @complete="searchMesas" dropdown field="label"/>
        </div>
        <div class="col-6">
          <Button icon="pi pi-eye" class="boton-verde" @click="mostrarDialogo = true" v-tooltip="'Ver items'"/>
          <InputText :disabled="view" id="Código Barra" class="w-10" v-model="nuevoRegistro.busqueda"
                     placeholder="Busca Plato/Producto:" @keypress.enter="abreMenuItems(nuevoRegistro.busqueda)"
                     @input="convertToUppercase"
                     @change="abreMenuItems(nuevoRegistro.busqueda)"/>
        </div>
        <div class="col-6">
          <AutoComplete id="menus" :disabled="view" class="w-12" placeholder="Menú:" v-model="nuevoRegistro.menuId"
                        :suggestions="menuArray" @complete="searchMenus" dropdown
                        @keypress.enter="procesarMenuDetalle(nuevoRegistro.menuId.value)"
                        @input="procesarMenuDetalle(nuevoRegistro.menuId.value)" field="label"/>
        </div>

        <div class="col-6">
          <Checkbox v-model="esDelivery" indeterminate binary />
          <label for="ingredient1" class="ml-2">
            <i class="fas fa-bicycle" style="font-size: 1.5rem"></i> Es delivery?
          </label>
        </div>
        <div class="col-9">
          <InputText v-if="esDelivery" class="input-spacing" v-model="nombre_cliente" placeholder="Nombre cliente:"/>
          <InputText v-if="esDelivery" class="input-spacing" v-model="direccion_cliente" placeholder="Dirección cliente:"/>
          <InputText v-if="esDelivery" class="input-spacing" v-model="telefono_cliente" placeholder="Teléfono cliente:"/>
        </div>
        <br>
        <Dialog :header="'Items'" v-model:visible="mostrarDialogo" style="width: 90%;"
                @hide="nuevoRegistro.busqueda='',nuevoRegistro.filtraBusqueda=''"
                class="responsive-dialog1">
          <div class="card">
            <InputText :disabled="view" id="Buscar" v-model="nuevoRegistro.filtraBusqueda"
                       placeholder="Busca Plato/Producto:"
                       @keypress.enter="buscaPlatoProducto(nuevoRegistro.filtraBusqueda)"/>
            <Divider></Divider>
            <DataView :value="items">
              <template #list="slotProps">
                <div class="grid grid-nogutter">
                  <div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
                    <div class="flex flex-column sm:flex-row sm:align-items-center p-4 gap-3"
                         :class="{ 'border-top-1 surface-border': index !== 0 }">
                      <div class="md:w-10rem relative">
                        <img v-if="item.categoria==='BEBIDAS'" class="block xl:block mx-auto border-round w-full"
                             :src="`src/assets/soda.png`"
                             :alt="item.nombre"/>
                        <img v-else-if="['PLATO PRINCIPAL', 'POSTRES', 'DESAYUNOS', 'SALIDAS', 'ENTRADAS'].includes(item.categoria)"
                             class="block xl:block mx-auto border-round w-full"
                             :src="`src/assets/dish.png`"
                             :alt="item.nombre"/>
                        <img v-else class="block xl:block mx-auto border-round w-full"
                             :src="`src/assets/list.png`"
                             :alt="item.nombre"/>
                      </div>
                      <div
                          class="flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4">
                        <div class="flex flex-row md:flex-column justify-content-between align-items-start gap-2">
                          <div>
                            <span class="font-medium text-secondary text-sm">#{{ item.categoria }}</span>
                            <div class="text-lg font-medium text-900 mt-2">{{ item.nombre }}</div>
                          </div>
                          <div class="surface-100 p-1" style="border-radius: 30px" v-if="item.existencias">
                            <div class="surface-0 flex align-items-center gap-2 justify-content-center py-1 px-2"
                                 style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                              <span>Stock: {{ item.existencias }}</span>
                            </div>
                          </div>
                          <div class="surface-100 p-1" style="border-radius: 30px" v-if="item.tiempo">
                            <div class="surface-0 flex align-items-center gap-2 justify-content-center py-1 px-2"
                                 style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                              <span>Tiempo: {{ item.tiempo }}min.</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-column md:align-items-end gap-5">
                          <span class="text-xl font-semibold text-900">${{ item.precio }}</span>
                          <div class="flex flex-row-reverse md:flex-row gap-2">
                            <Button icon="pi pi-shopping-cart" label="Añadir" :disabled="item.existencias <= 0"
                                    class="flex-auto md:flex-initial white-space-nowrap"
                                    @click="agregarDetalle(item)"></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </DataView>
          </div>
        </Dialog>
      </div>
      <div>
        <DataTable :value="datos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="!slotProps.data.id_pedido_det" icon="pi pi-trash" class="boton-rojo"
                        @click="eliminarDetalle(slotProps.data)"></Button>
                <Button v-if="slotProps.data.id_pedido_det" icon="pi pi-times" class="boton-rojo"
                        @click="eliminarDetalleRegistrado(slotProps.data)" v-tooltip="'Eliminar del pedido.'"></Button>
              </div>

            </template>
          </Column>
          <Column field="nombre" header="Items">
            <template #body="slotProps">
              <div v-if="slotProps.data.id_plato">
                <span class="text-verde">Plato</span>
              </div>
              <div v-else-if="slotProps.data.id_producto">
                <span class="text-azul">Producto</span>
              </div>
              {{ slotProps.data.nombre }}
            </template>
          </Column>
          <Column field="cantidad" header="Cantidad">
            <template #body="slotProps">
              <InputNumber v-model="slotProps.data.cantidad" showButtons buttonLayout="horizontal" :min="0"
                           :max="slotProps.data.existencias" @input="calculoValTotales">
                <template #incrementbuttonicon>
                  <span class="pi pi-plus"/>
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus"/>
                </template>
              </InputNumber>
            </template>
          </Column>
          <Column field="existencia" header="Stock">
            <template #body="slotProps">
              <div v-if="slotProps.data.existencias">
                {{ slotProps.data.existencias }}
              </div>
              <div v-else>No data.</div>
            </template>
          </Column>
          <Column field="tiempo" header="Tiempo">
            <template #body="slotProps">
              <div v-if="slotProps.data.tiempo">
                {{ formtatStringTime(slotProps.data.tiempo) }}
              </div>
              <div v-else>No data.</div>
            </template>
          </Column>
          <Column field="precio" header="Precio">
            <template #body="slotProps">
              <div v-if="slotProps.data.precio">
                {{ formatCurrency(slotProps.data.precio) }}
              </div>
              <div v-else>No data.</div>
            </template>
          </Column>
          <Column field="estado" header="Estado"></Column>
        </DataTable>
      </div>
      <br>
      <div>
        <Splitter style="height: 300px" class="mb-5">
          <SplitterPanel class="flex align-items-center justify-content-center" :size="60">
            <table>
              <tr>
                <span class="text-subtitle">Tiempo de Preparación</span>
              </tr>
              <tr>
                <td style="text-align: right;"><span>Tiempo apróx.</span></td>
                <td style="text-align: right;">{{ sumaTiemposPreparacion }}min.</td>
              </tr>
            </table>
          </SplitterPanel>
          <SplitterPanel class="flex align-items-center justify-content-center" :size="40">
            <table>
              <tr>
                <span class="text-subtitle">Totales</span>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>SubTotal</span></td>
                <td style="text-align: right;" class="text-body">{{ valSubtotal }}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>SubTotal 12%</span></td>
                <td style="text-align: right;" class="text-body">{{ valSubtotal12 }}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>SubTotal 15%</span></td>
                <td style="text-align: right;" class="text-body">{{ valSubtotal15 }}</td>
              </tr>
              <tr>
                <td style="text-align: right;"><span>Total</span></td>
                <td style="text-align: right;">{{ valTotal }}</td>
              </tr>
            </table>

          </SplitterPanel>
        </Splitter>
      </div>
      <br>
      <div class="grid">
        <div class="col-1">
          <Button v-if="!view && !update" label="" icon="pi pi-check" class="p-button-success"
                  v-tooltip="'Guardar Pedido'"
                  @click="guardarPedido"></Button>
        </div>
        <div class="col-1">
          <Button v-if="!view && !update && esFacturador" label="" icon="pi pi-send" class="p-button-info"
                  v-tooltip="'Guardar y enviar a facturar'"
                  @click="guardaryfacturarPedido"></Button>
        </div>
        <div class="col-1">
          <Button v-if="update" label="" icon="pi pi-pencil" class="p-button-warning"
                  v-tooltip="'Editar Pedido'"
                  @click="actualizarPedido"></Button>
        </div>
      </div>

    </TabPanel>
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-history"></i>
          <span class="text-subtitle">Lista de Pedidos</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3 xl:col-3" v-if="esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="busquedaJson.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
                        dropdown
                        @keypress.enter="listarPedido(estado_pedido,busquedaJson.sucursalId)" @input="getMesas"
                        field="label"
                        @change="listarPedido(estado_pedido,busquedaJson.sucursalId)"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
          <AutoComplete id="estado_pedido" class="w-9" placeholder="Filtra por estados:" v-model="estado_pedido"
                        :suggestions="estados_pedidos" @complete="searchEstadosPedidos"
                        @keypress.enter="listarPedido(estado_pedido,busquedaJson.sucursalId)"
                        @change="listarPedido(estado_pedido,busquedaJson.sucursalId)"
                        dropdown/>
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <Calendar v-model="dates" selectionMode="range" :manualInput="false" />
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
          <Button icon="pi pi-search" severity="success" rounded aria-label="Search" @click="listarPedido(estado_pedido,busquedaJson.sucursalId,dates)" />
        </div>


      </div>
      <div>
        <DataTable :value="datosPedidos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="['En Proceso', 'En Espera', 'Pendiente'].includes(slotProps.data.estado)"
                        icon="pi pi-send" color="boton-azul" @click="facturarPedido(slotProps.data)"
                        v-tooltip="'Enviar a Facturar'"></Button>
                <Button v-if="['En Proceso', 'En Espera', 'Pendiente'].includes(slotProps.data.estado)"
                        icon="pi pi-pencil" class="boton-verde" @click="editarPedido(slotProps.data)"
                        v-tooltip="'Editar pedido'"></Button>
                <Button v-if="['En Proceso', 'En Espera', 'Pendiente'].includes(slotProps.data.estado)"
                        icon="pi pi-times" class="boton-marron" @click="anularPedido(slotProps.data)"
                        v-tooltip="'Anular Pedido'"></Button>
                <Button v-if="['En Proceso', 'En Espera', 'Pendiente'].includes(slotProps.data.estado)"
                        icon="pi pi-trash"
                        class="boton-rojo"
                        @click="cancelarPedido(slotProps.data)"
                        v-tooltip="'Cancelar Pedido'">
                </Button>
                <Button v-if="slotProps.data.mesa_id!==null"
                        v-tooltip="'Imprimir Recibo'" class="boton-azul" icon="pi pi-receipt"
                        @click="descargarComprobantePdf(slotProps.data)"></Button>
                <Button v-else
                        v-tooltip="'Imprimir Recibo'" class="boton-azul" icon="pi pi-receipt"
                        @click="descargarComprobantePdfDelivery(slotProps.data)"></Button>
                <Button v-if="['Anulado'].includes(slotProps.data.estado)" icon="pi pi-history" class="boton-naranja"
                        @click="restaurarPedidoAnulado(slotProps.data)" v-tooltip="'Restaurar pedido'"></Button>
              </div>
            </template>
          </Column>
          <Column field="id_pedido" header="Numero Orden"></Column>
          <Column field="numero_mesa" header="Numero Mesa">
            <template #body="slotProps">
              <div v-if="slotProps.data.mesa_id === null">
                Es delivery. <i class="fas fa-bicycle" style="font-size: 1.5rem"></i>
              </div>
              <div v-else>
                  {{slotProps.data.numero_mesa}}
              </div>
            </template>
          </Column>
          <Column field="usuario" header="Usr. Creacion"></Column>
          <Column field="estado" header="Estado"></Column>
        </DataTable>
      </div>
    </TabPanel>
  </TabView>
</template>

<script>
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Divider from 'primevue/divider';
import Fieldset from 'primevue/fieldset';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Dropdown from 'primevue/dropdown';
import Tooltip from 'primevue/tooltip';
import infoPlatoService from '@/components/services/infoPlatosService';
import infoProductoService from '@/components/services/infoProductoService';
import admiImpuestoService from '@/components/services/admiImpuestosService';
import infoPedidoService from '@/components/services/infoPedidosService';
import infoPedidoDetService from '@/components/services/infoPedidosDetService';
import admiParametrosService from "@/components/services/admiParametrosService.js";
import infoArqueoCajaEmpleadoService from "@/components/services/infoArqueoCajaEmpleadoService.js";
import {api} from "@/api.js";
import Calendar from 'primevue/calendar';
import moment from "moment";
import Checkbox from "primevue/checkbox";
import infoMesaService from "@/components/services/infoMesaService.js";
import generaPdfService from "@/components/services/generatePdfService.js";


export default {
  name: 'InfoPedido',
  components: {
    DataTable,
    Column,
    TabPanel,
    TabView,
    InputText,
    InputNumber,
    Dialog,
    AutoComplete,
    Button,
    DataView,
    Divider,
    Fieldset,
    Splitter,
    SplitterPanel,
    Dropdown,
    Tooltip,
    Calendar,
    Checkbox
  },
  created() {
    this.listarPedido();
    this.buscaPlatoProducto();
    this.getSucursal();
    this.getMenus();
    this.getEstadosPedidos();
    this.comprobarEstadoCaja();

    if (this.params.sucursal_id) {
      this.cargaDataParaPedido(this.params);
    }
  },
  data() {
    return {
      endPointSucursales: "/admiSucursal",
      endPointMesas: "/infoMesa",
      endPointMenu: "/infoMenu",
      endPointMenuDet: "/infoMenuDet",
      endPointPedido: "/infoPedido",
      endPointPedidoDet: "/infoPedidoDet",
      datos: [],
      datosPedidos: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      nuevoRegistro: {mesaId: null, sucursalId: null},
      busquedaJson: {},
      mostrarDialogo: false,
      items: [],
      sucursalArray: [],
      mesaArray: [],
      menuArray: [],
      valSubtotal: 0,
      valSubtotal12: 0,
      valSubtotal15: 0,
      valTotal: 0,
      estados_pedidos: [],
      estado_pedido: "",
      update: false,
      activeIndex: 1,
      estadoCaja:false,
      dates:null,
      esDelivery:false,
      nombre_cliente:"",
      direccion_cliente:"",
      telefono_cliente:"",
    }
  },
  props: {
    params: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    sumaTiemposPreparacion() {
      let sum = 0;
      for (const element of this.datos) {
        if (typeof element.tiempo === 'number') {
          sum += element.tiempo;
        }
      }
      return sum;
    },
    rolesAdmin() {
      return ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'];
    },
    rolesPermitidosFacturar(){
      return ['CAJERO']
    },
    esFacturador(){
      const rolesSesion = this.getDataUserSesion();
      const esFacturador = rolesSesion.some(element => this.rolesPermitidosFacturar.includes(element.rol));
      return esFacturador;
    },
    esAdminSistema() {
      const rolesSesion = this.getDataUserSesion();
      const esAdmin = rolesSesion.some(element => this.rolesAdmin.includes(element.rol));
      return esAdmin && rolesSesion.some(element => element.rol === 'ADMINISTRADOR-SISTEMA');
    }
  },
  mounted() {
  },
  methods: {
    async descargarComprobantePdfDelivery(item){
      try {
        const responsePedidoDet = await infoPedidoDetService.getByFilter(this.$api,{pedido_id:item.id_pedido});
        const infoCliente = item.observacion.split('|')
        const data = {
          "clienteDireccion": null,
          "clienteNombre": null,
          "clienteTelefono": null,
          "detalles": null
        };
        const detalle = [];

        data.clienteNombre = infoCliente[0] || 'No definido';
        data.clienteDireccion = infoCliente[1] || 'No definido';
        data.clienteTelefono = infoCliente[2] || 'No definido';
        for (const pedidoDetResponse of responsePedidoDet) {
          const items = {
            producto: null,
            cantidad: null
          };
          if (pedidoDetResponse) {
            if (pedidoDetResponse.plato_id != null) {
              const responsePlato = await infoPlatoService.getById(this.$api, pedidoDetResponse.plato_id);
              items.producto = responsePlato.nombre;
              items.cantidad = pedidoDetResponse.cantidad;
            }
            if (pedidoDetResponse.producto_id != null) {
              const responseProducto = await infoProductoService.getById(this.$api, pedidoDetResponse.producto_id);
              items.producto = responseProducto.nombre;
              items.cantidad = pedidoDetResponse.cantidad;
            }
            detalle.push(items);
          }
          data.detalles = detalle;
        }
        const response = await generaPdfService.generatePdf(this.$api, 'pdf-ticket-pedido', data)
        if (response) {
          window.open(response, '_blank');
        }
      }
      catch (e) {
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async descargarComprobantePdf(item){
      try{
        const responseMesa = await infoMesaService.getById(this.$api,item.mesa_id);
        const responsePedidoDet = await infoPedidoDetService.getByFilter(this.$api,{pedido_id:item.id_pedido});
        const detalle = [];
        const data = {
          "mesa": null,
          "detalles": null
        };
        if (responseMesa) {
          data.mesa=responseMesa.numero_mesa;
        }
        for (const pedidoDetResponse of responsePedidoDet) {
          const items = {
            producto: null,
            cantidad: null
          };
          if (pedidoDetResponse) {
            if (pedidoDetResponse.plato_id != null) {
              const responsePlato = await infoPlatoService.getById(this.$api, pedidoDetResponse.plato_id);
              items.producto = responsePlato.nombre;
              items.cantidad = pedidoDetResponse.cantidad;
            }
            if (pedidoDetResponse.producto_id != null) {
              const responseProducto = await infoProductoService.getById(this.$api, pedidoDetResponse.producto_id);
              items.producto = responseProducto.nombre;
              items.cantidad = pedidoDetResponse.cantidad;
            }
            detalle.push(items);
          }
          data.detalles = detalle;
        }
        const response = await generaPdfService.generatePdf(this.$api, 'pdf-ticket-pedido-mesa', data)
        if (response) {
          window.open(response, '_blank');
        }
      }
      catch(e){
        console.error(e)
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }

    },
    convertToUppercase(event) {
      this.nuevoRegistro.busqueda = event.target.value.toUpperCase();
    },
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
          if(response.estado){
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
              title: "Ups1 😢",
              text: `${response.data}`,
            });
          }
        }else{
          this.estadoCaja=true;
        }
      }
      catch (e){
        console.error(e);
      }
    },
    async cargaDataParaPedido(params) {
      this.activeIndex = 0;
      await this.getMesas(params);
      await this.getSucursal();
      if (!this.nuevoRegistro) {
        this.nuevoRegistro = {mesaId: {value: "", label: ""}};
      } else if (!this.nuevoRegistro.mesaId) {
        this.nuevoRegistro.mesaId = {value: "", label: ""};
      }
      if (!this.nuevoRegistro) {
        this.nuevoRegistro = {sucursalId: {value: "", label: ""}};
      } else if (!this.nuevoRegistro.sucursalId) {
        this.nuevoRegistro.sucursalId = {value: "", label: ""};
      }
      const mesaEncontrada = this.mesaArray.find(m => m.id_mesa === params.mesa_id);
      if (mesaEncontrada) {
        this.nuevoRegistro.mesaId.value = mesaEncontrada.id_mesa;
        this.nuevoRegistro.mesaId.label = mesaEncontrada.numero_mesa;
      }

      const sucursalEncontrada = this.sucursalArray.find(m => m.id_sucursal === params.sucursal_id);
      if (sucursalEncontrada) {
        this.nuevoRegistro.sucursalId.value = sucursalEncontrada.id_sucursal;
        this.nuevoRegistro.sucursalId.label = sucursalEncontrada.nombre;
      }
    },
    async guardaryfacturarPedido() {
      try {
        let bandera = false;
        let requestPedido = {};
        if (this.esAdminSistema) {
          requestPedido.sucursal_id = this.nuevoRegistro.sucursalId.value;
        } else {
          requestPedido.sucursal_id = this.sucursal_id;
        }
        if(!this.esDelivery){
          requestPedido.mesa_id = this.nuevoRegistro.mesaId.value;
        }else{
          requestPedido.observacion = `${this.nombre_cliente}|${this.direccion_cliente}|${this.telefono_cliente}`;
          requestPedido.mesa_id = null;
        }
        requestPedido.empleado_id = this.$store.state.empleado.empleado_id;
        requestPedido.estado = 'Pendiente';
        requestPedido.total = parseFloat(this.valTotal);
        requestPedido.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestPedido.usuario_creacion = this.$store.state.empleado.usuario;
        requestPedido.usuario_modificacion = this.$store.state.empleado.usuario;
        const responsePedido = await infoPedidoService.insert(this.$api, requestPedido);
        const resPedido = responsePedido.data;
        if (responsePedido.success === true) {
          for (const element of this.datos) {

            let requestPedidoDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
            const subUni = parseInt(element.cantidad) * parseFloat(element.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestPedidoDet.pedido_id = resPedido.id_pedido;
            requestPedidoDet.subtotal_impuesto = imp;
            requestPedidoDet.precio_unitario = parseFloat(element.precio);
            requestPedidoDet.total_detalle = subUni;
            requestPedidoDet.cantidad = element.cantidad;
            requestPedidoDet.estado = 'Pendiente';
            requestPedidoDet.usuario_creacion = this.$store.state.empleado.usuario;
            requestPedidoDet.usuario_modificacion = this.$store.state.empleado.usuario;

            if (element.id_producto) {
              requestPedidoDet.producto_id = element.id_producto;
            }
            if (element.id_plato) {
              requestPedidoDet.plato_id = element.id_plato;
            }
            if (element.menu_id) {
              requestPedidoDet.menu_id = element.menu_id;
            }


            const responsePedidoDet = await infoPedidoDetService.insert(this.$api, requestPedidoDet);
            if (responsePedidoDet.success === true) {
              bandera = true;
            }

          }
          if (bandera) {
            this.$router.push({name: 'info-facturas', params: {pedido_id: resPedido.id_pedido}});
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async facturarPedido(item) {
      try {
        this.$router.push({name: 'info-facturas', params: {pedido_id: item.id_pedido}});
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async eliminarDetalleRegistrado(dato) {
      try {
        let requestPedidoDet = {};

        const responseImpuesto = await admiImpuestoService.getById(this.$api, dato.impuesto_id);
        const subUni = parseInt(dato.cantidad) * parseFloat(dato.precio);
        const imp = (subUni * responseImpuesto.porcentaje) / 100;

        requestPedidoDet.subtotal_impuesto = imp;
        requestPedidoDet.precio_unitario = parseFloat(dato.precio);
        requestPedidoDet.total_detalle = subUni;
        requestPedidoDet.cantidad = dato.cantidad;
        requestPedidoDet.estado = 'Eliminado';
        requestPedidoDet.usuario_modificacion = this.$store.state.empleado.usuario;

        if (dato.id_producto) {
          requestPedidoDet.producto_id = dato.id_producto;
        }
        if (dato.id_plato) {
          requestPedidoDet.plato_id = dato.id_plato;
        }
        if (dato.menu_id) {
          requestPedidoDet.menu_id = dato.menu_id;
        }
        requestPedidoDet.id_pedido_det = dato.id_pedido_det;
        requestPedidoDet.pedido_id = this.nuevoRegistro.id_pedido;
        const responseEditPedidoDet = await infoPedidoDetService.update(this.$api, dato.id_pedido_det, requestPedidoDet);
        if (responseEditPedidoDet.success === true) {
          this.datos = this.datos.filter(item => item.nombre !== dato.nombre);
        }
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async actualizarPedido() {
      try {
        this.nuevoRegistro.total = parseFloat(this.valTotal);
        this.nuevoRegistro.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);

        const responseEditPedido = await infoPedidoService.update(this.$api, this.nuevoRegistro.id_pedido, this.nuevoRegistro);
        if (responseEditPedido) {
          let bandera = false;
          for (const dato of this.datos) {
            let requestPedidoDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, dato.impuesto_id);
            const subUni = parseInt(dato.cantidad) * parseFloat(dato.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestPedidoDet.subtotal_impuesto = imp;
            requestPedidoDet.precio_unitario = parseFloat(dato.precio);
            requestPedidoDet.total_detalle = subUni;
            requestPedidoDet.cantidad = dato.cantidad;
            requestPedidoDet.estado = 'Pendiente';
            requestPedidoDet.usuario_modificacion = this.$store.state.empleado.usuario;

            if (dato.id_producto) {
              requestPedidoDet.producto_id = dato.id_producto;
            }
            if (dato.id_plato) {
              requestPedidoDet.plato_id = dato.id_plato;
            }
            if (dato.menu_id) {
              requestPedidoDet.menu_id = dato.menu_id;
            }

            if (dato.id_pedido_det) {
              // Actualiza el detalle existente
              requestPedidoDet.id_pedido_det = dato.id_pedido_det;
              requestPedidoDet.pedido_id = this.nuevoRegistro.id_pedido;
              const responseEditPedidoDet = await infoPedidoDetService.update(this.$api, dato.id_pedido_det, requestPedidoDet);
              if (responseEditPedidoDet) {
                bandera = true;
              }
            } else {
              // Crea un nuevo detalle
              requestPedidoDet.pedido_id = this.nuevoRegistro.id_pedido;
              requestPedidoDet.usuario_creacion = this.$store.state.empleado.usuario;
              const responseCreatePedidoDet = await infoPedidoDetService.insert(this.$api, requestPedidoDet);
              if (responseCreatePedidoDet) {
                bandera = true;
              }
            }
          }

          if (bandera) {
            this.$swal.fire({
              icon: "success",
              title: "¡Bien hecho!",
              text: `Pedido actualizado.`,
            });
            this.activeIndex = 1;
            this.limpiar();
            this.listarPedido('Pendiente', this.sucursal_id);
          }
        }
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async editarPedido(item) {
      try {
        this.nuevoRegistro = item;
        if(item.mesa_id === null){
          this.esDelivery = true;
          const infoCliente = item.observacion.split('|')
          this.nombre_cliente = infoCliente[0] || 'No definido';
          this.direccion_cliente = infoCliente[1] || 'No definido';
          this.telefono_cliente = infoCliente[2] || 'No definido';
        }
        const params = {
          pedido_id: item.id_pedido,
          estado: 'Pendiente'
        };
        const responsePedidoDet = await infoPedidoDetService.getByFilter(this.$api, params);
        if (responsePedidoDet) {
          for (const responsePedidoDetElement of responsePedidoDet) {
            if (responsePedidoDetElement.plato_id) {
              const respPlato = await infoPlatoService.getById(this.$api, responsePedidoDetElement.plato_id);
              if (respPlato) {
                respPlato.menu_id = responsePedidoDetElement.menu_id;
                respPlato.cantidad = responsePedidoDetElement.cantidad;
                respPlato.id_pedido_det = responsePedidoDetElement.id_pedido_det;
                respPlato.pedido_id = responsePedidoDetElement.pedido_id;
                this.datos.push(respPlato);
              }
            } else if (responsePedidoDetElement.producto_id) {
              const respProducto = await infoProductoService.getById(this.$api, responsePedidoDetElement.producto_id);
              if (respProducto) {
                respProducto.menu_id = responsePedidoDetElement.menu_id;
                respProducto.cantidad = responsePedidoDetElement.cantidad;
                respProducto.id_pedido_det = responsePedidoDetElement.id_pedido_det;
                respProducto.pedido_id = responsePedidoDetElement.pedido_id;
                this.datos.push(respProducto);
              }
            }
          }
        }
        this.calculoValTotales();
        this.update = true;
        this.activeIndex = 0;
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async anularPedido(item) {
      try {
        item.estado = "Anulado";
        const response = await infoPedidoService.update(this.$api, item.id_pedido, item);
        if (response.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarPedido('Pendiente', this.sucursal_id);
        }
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async cancelarPedido(item) {
      try {
        item.estado = "Cancelado";
        const response = await infoPedidoService.update(this.$api, item.id_pedido, item);
        if (response.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarPedido('Pendiente', this.sucursal_id);
        }
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async restaurarPedidoAnulado(item) {
      try {
        item.estado = "Pendiente";
        const response = await infoPedidoService.update(this.$api, item.id_pedido, item);
        if (response.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarPedido('Pendiente', this.sucursal_id);
        }
      } catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async listarPedido(filtro = "", busqueda = {},dates = null) {
      try {
        this.limpiar();
        this.datosPedidos = [];
        let params = {
          sucursal_id: this.sucursal_id,
          estado: filtro || 'Pendiente'
        };

        if (this.esAdminSistema) {
          if (busqueda && busqueda.value) {
            params.sucursal_id = busqueda.value;
          }
        }

        if (dates && dates.length > 0) {
          let fechaInicial = this.formatFecha(dates[0]);
          let fechaFinal = dates.length > 1 ? this.formatFecha(dates[1]) : fechaInicial;

          params.fecha_inicio = fechaInicial;
          params.fecha_fin = fechaFinal;
        } else {
          let fechaActual = moment().format("YYYY-MM-DD");
          params.fecha_inicio = fechaActual;
          params.fecha_fin = fechaActual;
        }

        const response = await this.$api.post(`${this.endPointPedido}/filter`, params);
        const resp = response.data;
        if (resp.success === true) {
          this.datosPedidos = resp.data;
        }
      } catch (e) {
        console.error(e);
      }
    },
    formatFecha(fecha) {
      const momentFecha = moment(fecha).utc();
      if (momentFecha.isValid()) {
        return momentFecha.format("YYYY-MM-DD");
      } else {
        return 'Fecha inválida';
      }
    },
    async calculoValTotales() {
      let subtotal = 0.00;
      let subtotal12 = 0.00;
      let subtotal15 = 0.00;
      if (this.datos.length > 0) {
        for (const element of this.datos) {
          if (typeof parseFloat(element.precio) === 'number') {
            try {
              const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
              const subUni = parseInt(element.cantidad) * parseFloat(element.precio);
              const imp = (subUni * responseImpuesto.porcentaje) / 100;

              subtotal = (subtotal + subUni) - imp;

              if (responseImpuesto.porcentaje === 12) {
                const sub12 = parseInt(element.cantidad) * parseFloat(element.precio);
                const imp12 = (sub12 * responseImpuesto.porcentaje) / 100;
                subtotal12 += imp12;
              }
              if (responseImpuesto.porcentaje === 15) {
                const sub15 = parseInt(element.cantidad) * parseFloat(element.precio);
                const imp15 = (sub15 * responseImpuesto.porcentaje) / 100;
                subtotal15 += imp15;
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
        this.valSubtotal = (subtotal).toFixed(2);
        this.valSubtotal12 = (subtotal12).toFixed(2);
        this.valSubtotal15 = (subtotal15).toFixed(2);
        this.valTotal = (subtotal + subtotal12 + subtotal15).toFixed(2);
      }
    },
    async guardarPedido() {
      try {
        let bandera = false;
        let requestPedido = {};
        if (this.esAdminSistema) {
          requestPedido.sucursal_id = this.nuevoRegistro.sucursalId.value;
        } else {
          requestPedido.sucursal_id = this.sucursal_id;
        }
        if(!this.esDelivery){
          requestPedido.mesa_id = this.nuevoRegistro.mesaId.value;
        }else{
          requestPedido.observacion = `${this.nombre_cliente}|${this.direccion_cliente}|${this.telefono_cliente}`;
          requestPedido.mesa_id = null;
        }
        requestPedido.empleado_id = this.$store.state.empleado.empleado_id;
        requestPedido.estado = 'Pendiente';
        requestPedido.total = parseFloat(this.valTotal);
        requestPedido.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestPedido.usuario_creacion = this.$store.state.empleado.usuario;
        requestPedido.usuario_modificacion = this.$store.state.empleado.usuario;

        const responsePedido = await infoPedidoService.insert(this.$api, requestPedido);
        const resPedido = responsePedido.data;
        if (responsePedido.success === true) {
          for (const element of this.datos) {

            let requestPedidoDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
            const subUni = parseInt(element.cantidad) * parseFloat(element.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestPedidoDet.pedido_id = resPedido.id_pedido;
            requestPedidoDet.subtotal_impuesto = imp;
            requestPedidoDet.precio_unitario = parseFloat(element.precio);
            requestPedidoDet.total_detalle = subUni;
            requestPedidoDet.cantidad = element.cantidad;
            requestPedidoDet.estado = 'Pendiente';
            requestPedidoDet.usuario_creacion = this.$store.state.empleado.usuario;
            requestPedidoDet.usuario_modificacion = this.$store.state.empleado.usuario;

            if (element.id_producto) {
              requestPedidoDet.producto_id = element.id_producto;
            }
            if (element.id_plato) {
              requestPedidoDet.plato_id = element.id_plato;
            }
            if (element.menu_id) {
              requestPedidoDet.menu_id = element.menu_id;
            }


            const responsePedidoDet = await infoPedidoDetService.insert(this.$api, requestPedidoDet);
            if (responsePedidoDet.success === true) {
              bandera = true;
            }

          }
          if (bandera) {
            this.$swal.fire({
              icon: "success",
              title: "Bien.. ✅",
              text: `Guardado!`,
            });
            this.limpiar();
            this.listarPedido('Pendiente', this.sucursal_id)
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async procesarMenuDetalle(item) {
      try {
        let params = {};
        params.menu_id = item;
        params.estado = "Activo";
        const response = await this.$api.post(`${this.endPointMenuDet}/filter`, params);
        const res = response.data;
        if (res.success === true) {
          for (const element of res.data) {
            if (element.plato_id) {
              const respPlato = await infoPlatoService.getById(this.$api, element.plato_id);
              if (respPlato) {
                respPlato.menu_id = element.menu_id;
                respPlato.cantidad = 1;
                this.datos.push(respPlato);
              }
            } else if (element.producto_id) {
              const respProducto = await infoProductoService.getById(this.$api, element.producto_id);
              if (respProducto) {
                respProducto.cantidad = 1;
                respProducto.menu_id = element.menu_id;
                this.datos.push(respProducto);
              }
            }
          }
          this.calculoValTotales();
        }
      } catch (error) {
        console.log(error);
      }
    },
    async searchMenus(event) {
      try {
        const response = await this.$api.get(`${this.endPointMenu}`);
        const data = response.data;
        const filter = data.data.filter(param =>
            param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.menuArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_menu
          };
        });
      } catch (error) {
        const data = error;
        console.error(data);
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.message}`,
        });
      }
    },
    async getMenus() {
      try {

        const response = await this.$api.get(`${this.endPointMenu}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.menuArray = respuesta.data;
        }
      } catch (e) {
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
          timer: 2000,
        });
      }
    },
    async searchMesas(event) {
      try {
        let params = {};
        if (this.esAdminSistema) {
          if (this.nuevoRegistro.sucursalId) {
            params.sucursal_id = this.nuevoRegistro.sucursalId.value;
          } else {
            this.$swal.fire({
              title: "Error",
              text: "Debe seleccionar una sucursal.",
              timer: 2000,
              icon: "error"
            })
          }
        } else {
          params.sucursal_id = this.sucursal_id;
        }
        params.estado = "Disponible";
        const response = await this.$api.post(`${this.endPointMesas}/filter`, params);
        const data = response.data;
        const filter = data.data.filter(param =>
            param.numero_mesa.toString().includes(event.query)
        );
        this.mesaArray = filter.map(param => {
          return {
            label: param.numero_mesa,
            value: param.id_mesa
          };
        });
      } catch (error) {
        const data = error.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `No hay mesas disponibles.`,
        });
      }
    },
    async getMesas(data = {}) {
      try {
        let params = {};
        if (this.esAdminSistema) {
          if (this.nuevoRegistro.sucursalId) {
            params.sucursal_id = this.nuevoRegistro.sucursalId.value;
          } else if (data) {
            params.sucursal_id = data.sucursal_id;
            params.id_mesa = data.mesa_id;
          } else {
            this.$swal.fire({
              title: "Error",
              text: "Debe seleccionar una sucursal.",
              timer: 2000,
              icon: "error"
            });
          }
        } else {
          if (data) {
            params.sucursal_id = data.sucursal_id;
            params.id_mesa = data.mesa_id;
          } else {
            params.sucursal_id = this.sucursal_id;
          }
        }

        params.estado = "Disponible";
        const response = await this.$api.post(`${this.endPointMesas}/filter`, params);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.mesaArray = respuesta.data;
        }
      } catch (e) {
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
          timer: 2000,
        });
      }
    },
    async searchSucursal(event) {
      try {
        const response = await this.$api.get(`${this.endPointSucursales}`);
        const data = response.data;
        const filter = data.data.filter(param =>
            param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.sucursalArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_sucursal
          };
        });
      } catch (error) {
        const data = error;
        console.error(data);
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.message}`,
        });
      }
    },
    async getSucursal() {
      try {
        const response = await this.$api.get(`${this.endPointSucursales}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.sucursalArray = respuesta.data;
        }
      } catch (e) {
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async searchEstadosPedidos(event) {
      try {
        const params = {descripcion: "estados_pedidos", estado: "Activo"};
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
        this.estados_pedidos = data.filter(param =>
            param.valor.toLowerCase().includes(event.query.toLowerCase()) ||
            param.clave.toLowerCase().includes(event.query.toLowerCase())
        ).map(param => param.valor);
      } catch (error) {
        const data = error;
        console.error(data);
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.message}`,
        });
      }
    },
    async getEstadosPedidos() {
      try {
        const params = {descripcion: "estados_pedidos", estado: "Activo"};
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
        if (respuesta.success === true) {
          this.estados_pedidos = respuesta.data;
        }
      } catch (e) {
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    eliminarDetalle(data) {
      this.datos = this.datos.filter(item => item.nombre !== data.nombre);
    },
    agregarDetalle(item) {
      const existe = this.datos.some(elemento => elemento.nombre === item.nombre);

      if (existe) {
        this.mostrarDialogo = false;
        this.$swal.fire({
          title: "Ups!!! 🥲",
          icon: "warning",
          text: 'Ya ha sido agregado el item: ' + item.nombre,
          timer: 2000
        })
      } else {
        item.cantidad = 1;
        this.datos.push(item);
        this.calculoValTotales();
        this.nuevoRegistro.filtraBusqueda="";
      }
    },
    async buscaPlatoProducto(item) {
      try {
        let params = {};
        //Realizar busqueda para Plato
        if (item) {
          params = {
            nombre: item,
            estado: 'Activo'
          }
        } else {
          params = {
            estado: 'Activo'
          }
        }

        let arrayData = [];
        const responsePlato = await infoPlatoService.getByFilter(this.$api, params)
        if (responsePlato) {
          if (responsePlato.success === false) {
          } else {
            for (const element of responsePlato) {
              arrayData.push(element);
            }
          }
        }
        //Realizar busqueda para producto
        const responseProducto = await infoProductoService.getByFilter(this.$api, params)
        if (responseProducto) {
          if (responseProducto.success === false) {

          } else {
            for (const element of responseProducto) {
              arrayData.push(element);
            }
          }
        }
        this.items = arrayData;
      } catch (error) {
        console.log(error);
      }
    },
    abreMenuItems(item) {
      this.nuevoRegistro.filtraBusqueda = item;
      this.mostrarDialogo = true;
      this.buscaPlatoProducto(item)
    },
    getDataUserSesion() {
      const roles = this.$store.state.roles;
      return roles;
    },
    formtatStringTime(value) {
      return `${value}min.`;
    },
    formatCurrency(value) {
      let numberValue = Number(value);
      if (isNaN(numberValue)) {
        throw new TypeError('Value must be a number or a string representing a number');
      }
      return numberValue.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    },
    limpiar() {
      this.datos = [];
      this.valSubtotal = 0.0;
      this.valSubtotal12 = 0.0;
      this.valSubtotal15 = 0.0;
      this.valTotal = 0.0;
      this.nuevoRegistro = {};
      this.activeIndex = 1;
      this.telefono_cliente="";
      this.nombre_cliente = "";
      this.direccion_cliente = "";
      this.update="";
    },
    limpiarTabs() {
      this.limpiar()
    },
  },
}
</script>

<style lang="scss" scoped></style>
