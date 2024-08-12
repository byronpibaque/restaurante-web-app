<template>
  <span class="text-title">Facturas</span>
  <TabView :activeIndex.sync="activeIndex" @tab-change="limpiarTabs">
    <TabPanel :disabled="estadoCaja">
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-plus"></i>
          <span class="text-subtitle">Factura</span>
        </div>
      </template>
      <div class="grid">
        <div v-if="esAdminSistema" class="col-6">
          <AutoComplete id="sucursales" v-model="nuevoRegistro.sucursalId" :disabled="view" :suggestions="sucursalArray"
                        class="w-12" dropdown field="label"
                        placeholder="Sucursal:"
                        @complete="searchSucursal"/>
        </div>
        <div class="col-6">
          <AutoComplete id="mesas" v-model="nuevoRegistro.formaPagoId" :disabled="view" :suggestions="formaPagoArray"
                        class="w-12"
                        dropdown field="label" placeholder="Forma de Pago:" @complete="searchFormaPago"/>
        </div>
        <div class="col-6">
          <Button v-tooltip="'Agrega cliente nuevo'" class="boton-azul" icon="pi pi-plus" @click="openPersonaDialog"/>
          <Button v-tooltip="'Buscar cliente'" class="boton-verde" icon="pi pi-search"
                  @click="buscaClientes(nuevoRegistro.busqueda)"/>
          <InputText id="Código Barra" v-model="nuevoRegistro.busqueda" :disabled="view" class="w-10"
                     placeholder="Busca Número Identificación:"
                     @keypress.enter="buscaClientes(nuevoRegistro.busqueda)"/>
        </div>
        <div>
          <AdmiPersonaDialog ref="AdmiPersonaDialog" :headerTitle="'Nuevo Cliente'"
                             :registro="nuevoCliente"></AdmiPersonaDialog>
        </div>
      </div>
      <div>
        <DataTable :value="datos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="!slotProps.data.id_factura_det" class="boton-rojo" icon="pi pi-trash"
                        @click="eliminarDetalle(slotProps.data)"></Button>
                <Button v-if="slotProps.data.id_factura_det" v-tooltip="'Eliminar de la factura.'" class="boton-rojo"
                        icon="pi pi-times"
                        @click="eliminarDetalleRegistrado(slotProps.data)"></Button>
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
              <InputNumber v-model="slotProps.data.cantidad" :max="slotProps.data.existencias" :min="0" buttonLayout="horizontal"
                           showButtons @input="calculoValTotales">
                <template #incrementbuttonicon>
                  <span class="pi pi-plus"/>
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus"/>
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
        <Splitter class="mb-5" style="height: 300px">
          <SplitterPanel :size="60" class="flex align-items-center justify-content-center">
            <table>
              <tr>
                <span class="text-subtitle">Información del cliente</span>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>Identificación:</span></td>
                <td style="text-align: right;">{{ this.clienteData.cliente.numero_identificacion }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>Nombres:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.nombre_pila }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>Email:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.email }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>Cel:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.celular }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>Dirección:</span></td>
                <td style="text-align: right;">{{ this.clienteData.persona.direccion }}</td>
              </tr>
            </table>
          </SplitterPanel>
          <SplitterPanel :size="40" class="flex align-items-center justify-content-center">
            <table>
              <tr>
                <span class="text-subtitle">Totales</span>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>SubTotal</span></td>
                <td class="text-body" style="text-align: right;">{{ valSubtotal }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>SubTotal 12%</span></td>
                <td class="text-body" style="text-align: right;">{{ valSubtotal12 }}</td>
              </tr>
              <tr>
                <td class="text-negrita" style="text-align: right;"><span>SubTotal 15%</span></td>
                <td class="text-body" style="text-align: right;">{{ valSubtotal15 }}</td>
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
          <Button v-if="!view && !update" v-tooltip="'Facturar.'" class="p-button-success" icon="pi pi-check"
                  label=""
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
        <div v-if="esAdminSistema" class="col-12 md:col-6 lg:col-3 xl:col-3">
          <AutoComplete id="sucursales" v-model="busquedaJson.sucursalId" :disabled="view" :suggestions="sucursalArray"
                        class="w-12" dropdown field="label"
                        placeholder="Sucursal:"
                        @change="listarFacturas(estado_pedido,busquedaJson.sucursalId)" @complete="searchSucursal"
                        @input="getFormasPagos"
                        @keypress.enter="listarFacturas(estado_pedido,busquedaJson.sucursalId)"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
          <AutoComplete id="estado_pedido" v-model="estado_pedido" :suggestions="estados_facturas" class="w-9"
                        dropdown placeholder="Filtra por estados:"
                        @change="listarFacturas(estado_pedido,busquedaJson.sucursalId)"
                        @complete="searchEstadosFacturas"
                        @keypress.enter="listarFacturas(estado_pedido,busquedaJson.sucursalId)"/>
        </div>
      </div>
      <div>
        <DataTable :value="datosPedidos" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">
                <Button v-if="['En Proceso', 'En Espera', 'Guardada'].includes(slotProps.data.estado)"
                        v-tooltip="'Anular Factura'" class="boton-marron" icon="pi pi-times"
                        @click="anularFactura(slotProps.data)"></Button>
                <Button v-if="['En Proceso', 'En Espera','Autorizada', 'Guardada'].includes(slotProps.data.estado)"
                        v-tooltip="'Imprimir Recibo'" class="boton-azul" icon="pi pi-receipt"
                        @click="descargarComprobantePdf(slotProps.data)"></Button>
                <Button v-if="['En Proceso', 'En Espera','Autorizada', 'Guardada'].includes(slotProps.data.estado)"
                        v-tooltip="'Descargar PDF'" class="boton-azul" icon="pi pi-receipt"
                        @click="descargarPdfFactura(slotProps.data)"></Button>
              </div>
            </template>
          </Column>
          <Column field="pedido_id" header="N. Factura">
            <template #body="slotProps">
              {{ slotProps.data.id_factura }}
              <Button v-tooltip="'Ver factura'" aria-label="Filter" icon="pi pi-eye" rounded severity="success"
                      text @click="verFactura(slotProps.data)"/>
            </template>
          </Column>
          <Column field="pedido_id" header="N. Orden">
            <template #body="slotProps">
              {{ slotProps.data.pedido_id }}
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
  <EspereDialog  ref="EspereDialog"></EspereDialog>
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
import infoArqueoCajaEmpleadoService from "@/components/services/infoArqueoCajaEmpleadoService.js";
import {api} from "@/api.js";
import generaPdfService from "@/components/services/generatePdfService.js";
import moment from "moment";
import admiFormaPagoService from "@/components/services/admiFormaPagoService.js";
import infoCajaService from "@/components/services/infoCajaService.js";
import EspereDialog from "@/components/EspereDialog.vue";

export default {
  name: 'InfoFactura',
  components: {
    EspereDialog,
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
    this.comprobarEstadoCaja();
  },
  data() {
    return {
      endPointSucursales: "/admiSucursal",
      endPointFormaPago: "/admiFormaPago",
      endPointMenu: "/infoMenu",
      endPointMenuDet: "/infoMenuDet",
      endPointPedido: "/infoPedido",
      endPointPedidoDet: "/infoPedidoDet",
      endPointGeneraPdf: "/generapdf",
      datos: [],
      datosPedidos: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      nuevoRegistro: {busqueda: '9999999999999'},
      clienteData: {cliente: {}, persona: {}},
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
      estados_facturas: [],
      estado_pedido: "",
      update: false,
      view: false,
      activeIndex: 1,
      pedido: null,
      nuevoCliente: {
        id_persona: "",
        tipo_documento: "",
        numero_identificacion: "",
        nombre: "",
        apellido: "",
        nombre_pila: "",
        direccion: "",
        email: "",
        celular: "+593",
        id_cliente: "",
        razon_social: "",
        estado: "",
        usuario_creacion: "",
        usuario_modificacion: "",
        estadoCaja: false,
        loadingDialog: false,
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
                timer: 1000,
                text: `El arqueo de caja esta cerrado, no se pueden realizar mas acciones.`,
              });
            }
          }else{
            this.$swal.fire({
              icon: "error",
              title: "Ups 😢",
              timer: 1000,
              text: `${response}`,
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
    async verFactura(item) {
      const responseFormaPago = await this.$api.get(this.endPointFormaPago + '/' + item.forma_pago_id);
      if (responseFormaPago.success === true) {
        const respuesta = responseFormaPago.data;
      }
      this.fetchPedido(item.pedido_id);
      this.view = true
      this.activeIndex = 0;
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
    async fetchPedido(pedido_id) {
      try {
        if (pedido_id) {
          const responsePedido = await infoPedidoService.getById(this.$api, pedido_id);
          if (responsePedido) {
            this.activeIndex = 0;
            const params = {
              pedido_id: pedido_id
            };
            const responsePedidoDet = await infoPedidosDetService.getByFilter(this.$api, params);
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
                  respProducto.pedido_id = element.pedido_id;
                  respProducto.id_pedido_det = element.id_pedido_det;
                  respProducto.cantidad = 1;
                  respProducto.menu_id = element.menu_id;
                  this.datos.push(respProducto);
                }
              }
            }
            this.calculoValTotales();
          }
        }

      } catch (e) {
        console.error(e.message);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? (data.data ? data.data : e.message) : e.message}`,
        });
      }
    },
    async buscaClientes(numeroIdentificacion) {
      try {
        this.clienteData = {cliente: {}, persona: {}};
        if (numeroIdentificacion) {
          const params = {
            numero_identificacion: numeroIdentificacion,
            estado: 'Activo'
          };
          const responseCliente = await infoClienteService.getByFilter(this.$api, params);
          if (responseCliente.success === false) {
            throw new Error('No se encontró un registro con N. Id:' + numeroIdentificacion);
          } else {
            const responseAdmiPersona = await admiPersonaService.getById(this.$api, responseCliente[0].persona_id);
            if (responseAdmiPersona) {
              this.clienteData.numero_identificacion = responseAdmiPersona.numero_identificacion;
              this.clienteData = {
                persona: responseAdmiPersona,
                cliente: responseCliente[0]
              }
            }
          }
        } else {
          throw new Error('Debe ingresar un numero de identificacion.')
        }
      } catch (e) {
        console.error(e.message);
        const data = e.response?.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data ? (data.data ? data.data : e.message) : e.message}`,
        });
      }
    },
    async anularFactura(item) {
      try {
        item.estado = "Anulado";
        const response = await infoFacturaService.update(this.$api, item.id_factura, item);
        if (response.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarFacturas('Guardada', this.sucursal_id);
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
    async listarFacturas(filtro = "", busqueda = {}) {
      try {
        this.limpiar();
        this.datosPedidos = [];
        let params = {
          sucursal_id: this.sucursal_id,
          estado: filtro || 'Guardada'
        };

        if (this.esAdminSistema) {
          if (busqueda && busqueda.value) {
            params.sucursal_id = busqueda.value;
          }
        }

        const response = await infoFacturaService.getByFilter(this.$api, params)
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
        await this.showEsperaDialog();
        const now = moment().format("YYYY/MM/DD");
        const items = [];
        const formaPago = [{ "tipo": null }];
        const dataFacturaAzure = {
          "codigoDoc": "01",
          "emisor": {
            "manejo_interno_secuencia": "NO",
            "secuencial": null,
            "fecha_emision": now
          },
          "comprador": {
            "tipo_identificacion": null,
            "identificacion": null,
            "razon_social": null,
            "direccion": null,
            "telefono": null,
            "celular": null,
            "correo": null
          },
          "items": null,
          "pagos": null
        };

        let bandera = false;
        let requestFactura = {};

        requestFactura.sucursal_id = this.esAdminSistema ? this.nuevoRegistro.sucursalId.value : this.sucursal_id;
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

        const responseFormaPago = await admiFormaPagoService.getById(this.$api, requestFactura.forma_pago_id);
        formaPago[0].tipo = this.getFormaPagoTipo(responseFormaPago?.nombre);
        dataFacturaAzure.pagos = formaPago;

        const responseCliente = await infoClienteService.getById(this.$api, requestFactura.cliente_id);
        if (responseCliente) {
          const responsePersona = await admiPersonaService.getById(this.$api, responseCliente.persona_id);
          if (responsePersona) {
            dataFacturaAzure.comprador = this.fillCompradorData(responseCliente, responsePersona);
          }
        }

        const responseFactura = await infoFacturaService.insert(this.$api, requestFactura);
        if (responseFactura.success) {
          const resFactura = responseFactura.data;
          const empleado_caja = this.$store.state.cajas[0];
          const responseCaja = await infoCajaService.getById(this.$api, empleado_caja.caja_id);
          if (responseCaja) {
            dataFacturaAzure.emisor.secuencial = String(responseCaja.secuencial).padStart(9, '0');          }
            dataFacturaAzure.id_factura = resFactura.id_factura;
          for (const element of this.datos) {
            const itemsAzure = await this.fillItemsAzure(element, resFactura.id_factura);
            if (itemsAzure) {
              bandera = true;
              items.push(itemsAzure);
            }
          }

          dataFacturaAzure.items = items;
          if (bandera) {
            const responseAzur = await infoFacturaService.emitirFactura(this.$api, dataFacturaAzure);
            if (responseAzur.creado) {
              await this.hideEsperaDialog();
              this.showSuccessAlert();
              this.limpiar();
              await this.verificaComprobante({claveacceso: responseAzur.claveacceso});
              await this.listarFacturas('Guardada', this.sucursal_id);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    getFormaPagoTipo(nombre) {
      const tipos = {
        'EFECTIVO': '01',
        'TC': '19',
        'TD': '16',
        'CHEQUE': '21',
        'TRANSACCION': '18'
      };
      return tipos[nombre] || '01';
    },
    fillCompradorData(cliente, persona) {
      return {
        tipo_identificacion: cliente.tipoIdentificacionComprador,
        identificacion: persona.numero_identificacion,
        razon_social: cliente.razon_social_comprador,
        direccion: persona.direccion,
        telefono: persona.celular,
        correo: persona.email
      };
    },
    async fillItemsAzure(element, facturaId) {
      const requestFacturaDet = {
        factura_id: facturaId,
        pedido_det_id: element.id_pedido_det,
        subtotal_impuesto: 0,
        precio_unitario: parseFloat(element.precio),
        total_detalle: parseInt(element.cantidad) * parseFloat(element.precio),
        cantidad: element.cantidad,
        estado: 'Guardada',
        usuario_creacion: this.$store.state.empleado.usuario,
        usuario_modificacion: this.$store.state.empleado.usuario
      };

      const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
      requestFacturaDet.subtotal_impuesto = (requestFacturaDet.total_detalle * responseImpuesto.porcentaje) / 100;

      const itemsAzure = {
        "codigo_principal": null,
        "codigo_auxiliar": null,
        "descripcion": null,
        "tipoproducto": 1,
        "tipo_iva": null,
        "precio_unitario": null,
        "cantidad": null,
        "descuento": 0,
        "tipo_ice": 0,
        "valor_ice": 0,
        "tarifa_ice": 0
      };

      const pedidoDetResponse = await infoPedidosDetService.getById(this.$api, element.id_pedido_det);
      if (pedidoDetResponse) {
        itemsAzure.cantidad = element.cantidad;
        if (pedidoDetResponse.plato_id != null) {
          const responsePlato = await infoPlatoService.getById(this.$api, pedidoDetResponse.plato_id);
          const impResponse = await admiImpuestoService.getById(this.$api, responsePlato.impuesto_id);
          itemsAzure.codigo_principal = String(pedidoDetResponse.plato_id);
          itemsAzure.descripcion = responsePlato.nombre;
          itemsAzure.precio_unitario = responsePlato.precio;
          itemsAzure.tipo_iva = this.getTipoIva(impResponse.porcentaje);
        }
        if (pedidoDetResponse.producto_id != null) {
          const responseProducto = await infoProductoService.getById(this.$api, pedidoDetResponse.producto_id);
          const impResponse = await admiImpuestoService.getById(this.$api, responseProducto.impuesto_id);
          itemsAzure.codigo_principal = String(pedidoDetResponse.producto_id);
          itemsAzure.descripcion = responseProducto.nombre;
          itemsAzure.precio_unitario = responseProducto.precio;
          itemsAzure.tipo_iva = this.getTipoIva(impResponse.porcentaje);
        }
      }

      const responsePedidoDet = await infoFacturaDetService.insert(this.$api, requestFacturaDet);
      if (responsePedidoDet.success) {
        return itemsAzure;
      }
      return null;
    },
    getTipoIva(porcentaje) {
      if (porcentaje === 0) return 0;
      if (porcentaje === 15) return 4;
      if (porcentaje === 12) return 2;
      return null;
    },
    showSuccessAlert() {
      this.$swal.fire({
        icon: "success",
        title: "Bien.. ✅",
        text: `Guardado!`,
        timer: 1000
      });
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
        const params = {descripcion: "estados_facturas", estado: "Activo"};
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
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
        const params = {descripcion: "estados_facturas", estado: "Activo"};
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
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
      return numberValue.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
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
    async verificaComprobante(item) {
      try {
        const respuesta = await infoFacturaService.consultarFactura(this.$api, item);
        if (respuesta.estado_texto === "Autorizado") {
          window.open(respuesta.enlace_pdf, '_blank');
          await this.hideEsperaDialog();
        } else {
          throw respuesta;
        }
      } catch (e) {
        console.error(e);
        await this.hideEsperaDialog();
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async descargarPdfFactura(item) {
      try {
       await this.showEsperaDialog();
        const params = {
          claveacceso: item.clave_acceso
        };
        await this.verificaComprobante(params);
      } catch (e) {
        console.error(e);
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async descargarComprobantePdf(item) {
      try {
        await this.showEsperaDialog();
        const detalle = [];
        const data = {
              "clienteDireccion": null,
              "clienteNombre": null,
              "detalles": null,
              "clienteTelefono": null,
              "mensaje": "Gracias por su compra",
              "claveAcceso": null,
              "numComprobante": null,
              "total": 0,
              "desc": 0,
              "imp": 0,
              "subTotal": 0
            }
        ;
        const facturaRes = await infoFacturaService.getById(this.$api, item.id_factura);
        if (facturaRes) {
          data.claveAcceso = facturaRes.clave_acceso;
          data.numComprobante = facturaRes.id_factura;
          data.total = facturaRes.total_factura;
          data.desc = facturaRes.total_impuesto;
          data.imp = facturaRes.impuesto_total;
          data.subTotal = facturaRes.total_con_impuesto;
          const clienteRes = await infoClienteService.getById(this.$api, facturaRes.cliente_id);
          if (clienteRes) {
            const personaRes = await admiPersonaService.getById(this.$api, clienteRes.persona_id);
            if (personaRes) {
              data.clienteNombre = personaRes.nombre + " " + personaRes.apellido;
              data.clienteDireccion = personaRes.direccion;
              data.clienteTelefono = personaRes.celular;
            }
          }
          const facturaDetArr = await infoFacturaDetService.getByFilter(this.$api, {factura_id:item.id_factura});
          if (facturaDetArr.length > 0) {
            for (let element of facturaDetArr) {
              const items = {
                producto: null,
                cantidad: null,
                precio_unitario: null
              };
              const pedidoDetResponse = await infoPedidosDetService.getById(this.$api, element.pedido_det_id);
              if (pedidoDetResponse) {
                if (pedidoDetResponse.plato_id != null) {
                  const responsePlato = await infoPlatoService.getById(this.$api, pedidoDetResponse.plato_id);
                  items.producto = responsePlato.nombre;
                  items.cantidad = element.cantidad;
                  items.precio_unitario = element.precio_unitario;
                }
                if (pedidoDetResponse.producto_id != null) {
                  const responseProducto = await infoProductoService.getById(this.$api, pedidoDetResponse.producto_id);
                  items.producto = responseProducto.nombre;
                  items.cantidad = element.cantidad;
                  items.precio_unitario = element.precio_unitario;
                }
                detalle.push(items);
              }
              data.detalles = detalle;
            }
          } else {
            throw "No hay detalles para la factura:" + facturaRes.id_factura;
          }
        }
        const response = await generaPdfService.generatePdf(this.$api, 'pdf-ticket-factura', data)
        if (response) {
         await this.hideEsperaDialog();
          window.open(response, '_blank');
        }
      } catch (e) {
        await this.hideEsperaDialog();
        const data = e.response.data;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢",
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async showEsperaDialog() {
      if(this.$refs.EspereDialog){
        this.$refs.EspereDialog.show();
      }
    },
    async hideEsperaDialog() {
      if(this.$refs.EspereDialog){
        this.$refs.EspereDialog.hide();
      }
    }
  },

}
</script>

<style lang="scss" scoped></style>
