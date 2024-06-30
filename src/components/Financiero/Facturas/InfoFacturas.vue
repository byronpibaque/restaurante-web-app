<template>
  <span class="text-title">Facturas</span>

  <TabView :activeIndex.sync="activeIndex" @tab-change="limpiarTabs">
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-plus"></i>
          <span class="text-subtitle">Factura</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-6" v-if= "esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="nuevoRegistro.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal" dropdown
                        field="label" />
        </div>
        <div class="col-6">
          <AutoComplete id="mesas" :disabled="view" class="w-12" placeholder="Forma de Pago:" v-model="nuevoRegistro.formaPagoId"
                        :suggestions="formaPagoArray" @complete="searchFormaPago" dropdown field="label" />
        </div>
        <div class="col-6">
          <Button icon="pi pi-plus" class="boton-azul" @click="openPersonaDialog" v-tooltip="'Agrega cliente nuevo'" />
          <Button icon="pi pi-search" class="boton-verde" @click="buscaClientes(nuevoRegistro.busqueda)" v-tooltip="'Buscar cliente'" />
          <InputText :disabled="view" id="Código Barra" class="w-10" v-model="nuevoRegistro.busqueda"
                     placeholder="Busca Número Identificación:" @keypress.enter="buscaClientes(nuevoRegistro.busqueda)"/>
        </div>
        <div>
          <AdmiPersonaDialog :registro="nuevoCliente" :headerTitle="'Nuevo Cliente'"
                             ref="AdmiPersonaDialog"></AdmiPersonaDialog>
        </div>
      </div>
      <div>
        <DataTable :value="datos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="!slotProps.data.id_factura_det" icon="pi pi-trash" class="boton-rojo" @click="eliminarDetalle(slotProps.data)"></Button>
                <Button v-if="slotProps.data.id_factura_det" icon="pi pi-times" class="boton-rojo" @click="eliminarDetalleRegistrado(slotProps.data)" v-tooltip="'Eliminar de la factura.'"></Button>
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
                  <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
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
        </DataTable>
      </div>
      <br>
      <div>
        <Splitter style="height: 300px" class="mb-5">
          <SplitterPanel class="flex align-items-center justify-content-center" :size="60">
            <table>
              <tr>
                <span class="text-subtitle">Información del cliente</span>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>Identificación:</span></td>
                <td style="text-align: right;">{{this.clienteData.cliente.numero_identificacion}}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>Nombres:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.nombre_pila }}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>Email:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.email }}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>Cel:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.celular }}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="text-negrita"><span>Dirección:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.direccion }}</td>
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
                  v-tooltip="'Facturar.'"
                  @click="guardarFactura"></Button>
        </div>
      </div>

    </TabPanel>
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-history"></i>
          <span class="text-subtitle">Lista de Facturas</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3 xl:col-3" v-if="esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="busquedaJson.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal" dropdown
                        @keypress.enter="listarFacturas(estado_pedido,busquedaJson.sucursalId)" @input="getFormasPagos" field="label"
                        @change="listarFacturas(estado_pedido,busquedaJson.sucursalId)"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
          <AutoComplete id="estado_pedido" class="w-9" placeholder="Filtra por estados:" v-model="estado_pedido"
                        :suggestions="estados_facturas" @complete="searchEstadosFacturas" @keypress.enter="listarFacturas(estado_pedido,busquedaJson.sucursalId)"
                        @change="listarFacturas(estado_pedido,busquedaJson.sucursalId)"
                        dropdown />
        </div>
      </div>
      <div>
        <DataTable :value="datosPedidos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="['En Proceso', 'En Espera', 'Guardada'].includes(slotProps.data.estado)" icon="pi pi-times" class="boton-marron" @click="anularFactura(slotProps.data)"  v-tooltip="'Anular Factura'"></Button>
                <Button v-if="['En Proceso', 'En Espera','Autorizada', 'Guardada'].includes(slotProps.data.estado)" icon="pi pi-receipt" class="boton-azul" @click="descargarComprobantePdf(slotProps.data)"  v-tooltip="'Descargar PDF'"></Button>
              </div>
            </template>
          </Column>
          <Column field="pedido_id" header="N. Factura">
            <template #body="slotProps">
              {{slotProps.data.id_factura }}
              <Button icon="pi pi-eye" text rounded severity="success" aria-label="Filter" @click="verFactura(slotProps.data)" v-tooltip="'Ver factura'" />
            </template>
          </Column>
          <Column field="pedido_id" header="N. Orden">
            <template #body="slotProps">
              {{slotProps.data.pedido_id }}
            </template>
          </Column>
          <Column field="precio" header="Precio">
            <template #body="slotProps">
              {{ formatDate(slotProps.data) }}
            </template>
          </Column>
          <Column field="usuario_creacion" header="Usr. Creacion"></Column>
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
import infoFacturaService from '@/components/services/infoFacturasService.js';
import infoFacturaDetService from '@/components/services/infoFacturasDetService.js';
import admiParametrosService from "@/components/services/admiParametrosService.js";
import infoClienteService from "@/components/services/infoClienteService.js";
import admiPersonaService from "@/components/services/admiPersonasService.js";
import infoPedidoService from "@/components/services/infoPedidosService.js";
import infoPedidosDetService from "@/components/services/infoPedidosDetService.js";
import AdmiPersonaDialog from "@/components/Administracion/options/AdmiPersonaDialog.vue";


export default {
  name: 'InfoFactura',
  components: {
    AdmiPersonaDialog,
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
    Tooltip
  },
  created() {
    this.listarFacturas();
    this.getSucursal();
    this.getEstadosFacturas();
    this.buscaClientes('9999999999999');
    this.fetchPedido(this.$route.params.pedido_id);
  },
  data() {
    return {
      endPointSucursales: "/admiSucursal",
      endPointFormaPago: "/admiFormaPago",
      endPointMenu: "/infoMenu",
      endPointMenuDet: "/infoMenuDet",
      endPointPedido: "/infoPedido",
      endPointPedidoDet: "/infoPedidoDet",
      datos: [],
      datosPedidos: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      nuevoRegistro: {busqueda:'9999999999999'},
      clienteData:{cliente:{},persona:{}},
      busquedaJson: {},
      mostrarDialogoCliente: false,
      items: [],
      sucursalArray: [],
      formaPagoArray: [],
      menuArray: [],
      valSubtotal: 0,
      valSubtotal12: 0,
      valSubtotal15: 0,
      valTotal: 0,
      estados_facturas:[],
      estado_pedido:"",
      update:false,
      view:false,
      activeIndex: 1,
      pedido: null,
      nuevoCliente:{
          id_persona: "",
          tipo_documento: "",
          numero_identificacion: "",
          nombre: "",
          apellido: "",
          nombre_pila: "",
          direccion: "",
          email: "",
          celular: "+593",
          id_cliente:"",
          razon_social:"",
          estado: "",
          usuario_creacion: "",
          usuario_modificacion: "",
      },
    }
  },
  props: ['pedido_id'],
  computed: {
    rolesAdmin() {
      return ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'];
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
   async verFactura(item){
      const responseFormaPago = await this.$api.get(this.endPointFormaPago+'/'+item.forma_pago_id);
      if(responseFormaPago.success=true){
        const respuesta = responseFormaPago.data;
      }
      this.fetchPedido(item.pedido_id);
      this.view=true
      this.activeIndex=0;
    },
    openPersonaDialog() {
      this.$refs.AdmiPersonaDialog.openDialogCliente();
    },
    formatDate(rowData) {
      const fecha = new Date(rowData.fecha_factura);
      return `${fecha.getFullYear()}-${this.pad(fecha.getMonth() + 1)}-${this.pad(fecha.getDate())}`;
    },
    pad(num) {
      return num < 10 ? '0' + num : num;
    },
    async fetchPedido(pedido_id){
      try {
        if(pedido_id){
          const responsePedido = await infoPedidoService.getById(this.$api,pedido_id);
          if(responsePedido){
            this.activeIndex=0;
            const params = {
              pedido_id:pedido_id
            };
            const responsePedidoDet = await infoPedidosDetService.getByFilter(this.$api,params);
            for (const element of responsePedidoDet) {
              if (element.plato_id) {
                const respPlato = await infoPlatoService.getById(this.$api, element.plato_id);
                if (respPlato) {
                  respPlato.pedido_id = element.pedido_id;
                  respPlato.id_pedido_det = element.id_pedido_det;
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
        }

      }catch (e) {
        console.error(e.message);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? (data.data ? data.data : e.message) : e.message}`,
        });
      }
    },
    async buscaClientes(numeroIdentificacion){
     try {
       this.clienteData={cliente:{},persona:{}};
      if(numeroIdentificacion){
        const params = {
          numero_identificacion: numeroIdentificacion,
          estado: 'Activo'
        };
        const responseCliente = await infoClienteService.getByFilter(this.$api,params);
        if(responseCliente.success===false){
          throw new Error('No se encontró un registro con N. Id:'+numeroIdentificacion);
        }else{
          const responseAdmiPersona = await admiPersonaService.getById(this.$api,responseCliente[0].persona_id);
          if(responseAdmiPersona){
            this.clienteData.numero_identificacion=responseAdmiPersona.numero_identificacion;
            this.clienteData={
              persona:responseAdmiPersona,
              cliente:responseCliente[0]
            }
          }
        }
      }else{
        throw new Error('Debe ingresar un numero de identificacion.')
      }
     }catch (e) {
       console.error(e.message);
       const data = e.response?.data;
       this.$swal.fire({
         icon: "error",
         title: "Upss.. 😢",
         text: `Algo salió mal: ${data ? (data.data ? data.data : e.message) : e.message}`,
       });
     }
    },
    async anularFactura(item){
      try {
        item.estado="Anulado";
        const response = await infoFacturaService.update(this.$api,item.id_pedido,item);
        if (response.success === true) {
          this.$swal.fire({
            icon:"success",
            title:"Actualizado",
            text:"Registro actualizado exitosamente!",
            timer:2000
          });
          this.listarFacturas('Guardada',this.sucursal_id);
        }
      }catch (e) {
        console.error(e);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? data.data : "Error desconocido"}`,
        });
      }
    },
    async listarFacturas(filtro = "", busqueda = {}) {
      try {
        this.limpiar();
        this.datosPedidos=[];
        let params = {
          sucursal_id: this.sucursal_id,
          estado: filtro || 'Guardada'
        };

        if (this.esAdminSistema) {
          if (busqueda && busqueda.value) {
            params.sucursal_id = busqueda.value;
          }
        }

        const response = await infoFacturaService.getByFilter(this.$api,params)
        if (response) {
          this.datosPedidos = response;
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
    async guardarFactura() {
      try {
        let bandera = false;
        let requestFactura = {};
        if (this.esAdminSistema) {
          requestFactura.sucursal_id = this.nuevoRegistro.sucursalId.value;
        } else {
          requestFactura.sucursal_id = this.sucursal_id;
        }
        requestFactura.forma_pago_id = this.nuevoRegistro.formaPagoId.value;
        requestFactura.empleado_id = this.$store.state.empleado.empleado_id;
        requestFactura.cliente_id = this.clienteData.cliente.id_cliente;
        requestFactura.pedido_id = parseInt(this.$route.params.pedido_id);
        requestFactura.estado = 'Guardada';
        requestFactura.total_factura = parseFloat(this.valTotal);
        requestFactura.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestFactura.impuesto_total = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestFactura.total_con_impuesto = parseFloat(this.valTotal) + parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestFactura.usuario_creacion = this.$store.state.empleado.usuario;
        requestFactura.usuario_modificacion = this.$store.state.empleado.usuario;
        const responseFactura = await infoFacturaService.insert(this.$api, requestFactura);
        const resFactura = responseFactura.data;
        if (responseFactura.success === true) {
          for (const element of this.datos) {

            let requestFacturaDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
            const subUni = parseInt(element.cantidad) * parseFloat(element.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestFacturaDet.factura_id = resFactura.id_factura;
            requestFacturaDet.pedido_det_id = element.id_pedido_det;
            requestFacturaDet.subtotal_impuesto = imp;
            requestFacturaDet.precio_unitario = parseFloat(element.precio);
            requestFacturaDet.total_detalle = subUni;
            requestFacturaDet.cantidad = element.cantidad;
            requestFacturaDet.estado = 'Guardada';
            requestFacturaDet.usuario_creacion = this.$store.state.empleado.usuario;
            requestFacturaDet.usuario_modificacion = this.$store.state.empleado.usuario;

            const responsePedidoDet = await infoFacturaDetService.insert(this.$api, requestFacturaDet);
            if (responsePedidoDet.success === true) {
              bandera = true;
            }
          }
          if (bandera) {
            this.$swal.fire({
              icon: "success",
              title: "Bien.. ✅",
              text: `Guardado!`,
              timer: 2000
            });
            this.limpiar();
            this.listarFacturas('Guardada',this.sucursal_id)
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async searchFormaPago(event) {
      try {
        let params = {};
        params.estado = "Activo";
        const response = await this.$api.post(`${this.endPointFormaPago}/filter`, params);
        const data = response.data;
        const filter = data.data.filter(param =>
            param.nombre.toString().includes(event.query)
        );
        this.formaPagoArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_forma_pago
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
    async getFormasPagos() {
      try {
        let params = {};
        params.estado = "Activo";
        const response = await this.$api.post(`${this.endPointFormaPago}/filter`, params);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.formaPagoArray = respuesta.data;
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
    async searchEstadosFacturas(event) {
      try {
        const params = { descripcion: "estados_facturas", estado: "Activo" };
        const data = await admiParametrosService.getbyfilterCab(this.$api,params)
        this.estados_facturas = data.filter(param =>
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
    async getEstadosFacturas() {
      try {
        const params = { descripcion: "estados_facturas", estado: "Activo" };
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api,params)
        if (respuesta.success === true) {
          this.estados_facturasd = respuesta.data;
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
    getDataUserSesion() {
      const roles = this.$store.state.roles;
      return roles;
    },
    formatCurrency(value) {
      let numberValue = Number(value);
      if (isNaN(numberValue)) {
        throw new TypeError('Value must be a number or a string representing a number');
      }
      return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
    limpiar() {
      this.datos = [];
      this.valSubtotal = 0.0;
      this.valSubtotal12 = 0.0;
      this.valSubtotal15 = 0.0;
      this.valTotal = 0.0;
      this.activeIndex = 1;
    },
    limpiarTabs() {
      this.limpiar()
    },
  },
}
</script>

<style lang="scss" scoped></style>
