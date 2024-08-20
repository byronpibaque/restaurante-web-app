<template>
  <span class="text-title">Ingresos</span>

  <TabView :activeIndex.sync="activeIndex" @tab-change="limpiarTabs">
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-plus"></i>
          <span class="text-subtitle">Ingresos</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-6" v-if="esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="nuevoRegistro.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
                        dropdown
                        field="label"/>
        </div>
        <div class="col-6">
          <AutoComplete id="forma_pago" :disabled="view" class="w-12" placeholder="Forma de Pago:" v-model="nuevoRegistro.formaPagoId"
                        :suggestions="formaPagoArray" @complete="searchFormaPago" dropdown field="label" />
        </div>
        <div class="col-6">
          <AutoComplete id="proveedor" :disabled="view" class="w-12" placeholder="Proveedor:" v-model="nuevoRegistro.proveedorId"
                        :suggestions="proveedorArray" @complete="searchProveedor" dropdown field="label" />
        </div>
        <div class="col-6">
          <Button icon="pi pi-eye" class="boton-verde" @click="mostrarDialogo = true" v-tooltip="'Ver items'"/>
          <InputText :disabled="view" id="Código Barra" class="w-10" v-model="nuevoRegistro.busqueda"
                     placeholder="Busca Plato/Producto:" @keypress.enter="abreMenuItems(nuevoRegistro.busqueda)"
                     @change="abreMenuItems(nuevoRegistro.busqueda)"/>
        </div>
        <br>
        <Dialog :header="'Items'" v-model:visible="mostrarDialogo" style="width: 90%;"
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
                        <img class="block xl:block mx-auto border-round w-full"
                             :src="`https://primefaces.org/cdn/primevue/images/product/${item.nombre}.jpg`"
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
                            <Button icon="pi pi-shopping-cart" label="Añadir"
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
                <Button v-if="!slotProps.data.id_compra_det" icon="pi pi-trash" class="boton-rojo"
                        @click="eliminarDetalle(slotProps.data)"></Button>
                <Button v-if="slotProps.data.id_compra_det" icon="pi pi-times" class="boton-rojo"
                        @click="eliminarDetalleRegistrado(slotProps.data)" v-tooltip="'Eliminar del Compra.'"></Button>
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
                            @input="calculoValTotales">
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
                <span class="text-subtitle"></span>
              </tr>
              <tr>
                <td style="text-align: right;"></td>
                <td style="text-align: right;"></td>
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
                  v-tooltip="'Guardar ingreso.'"
                  @click="guardarCompra"></Button>
        </div>

      </div>

    </TabPanel>
    <TabPanel>
      <template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-history"></i>
          <span class="text-subtitle">Lista de Compras</span>
        </div>
      </template>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3 xl:col-3" v-if="esAdminSistema">
          <AutoComplete id="sucursales" :disabled="view" class="w-12" placeholder="Sucursal:"
                        v-model="busquedaJson.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
                        dropdown
                        @keypress.enter="listarCompra(estado_Compra,busquedaJson.sucursalId)" @input="getMesas"
                        field="label"
                        @change="listarCompra(estado_Compra,busquedaJson.sucursalId)"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3 xl:col-3">
          <AutoComplete id="estado_Compra" class="w-9" placeholder="Filtra por estados:" v-model="estado_Compra"
                        :suggestions="estados_facturas" @complete="searchEstadosCompras"
                        @keypress.enter="listarCompra(estado_Compra,busquedaJson.sucursalId)"
                        @change="listarCompra(estado_Compra,busquedaJson.sucursalId)"
                        dropdown/>
        </div>
      </div>
      <div>
        <DataTable :value="datosCompras" class="responsive-datatable">
          <Column field="options" header="Options">
            <template #body="slotProps">
              <div class="option-buttons">

                <Button v-if="['Activo'].includes(slotProps.data.estado)"
                        icon="pi pi-eye" class="boton-verde" @click="editarCompra(slotProps.data)"
                        v-tooltip="'Editar Compra'"></Button>
                <Button v-if="['Activo'].includes(slotProps.data.estado)"
                        icon="pi pi-trash"
                        class="boton-rojo"
                        @click="cancelarCompra(slotProps.data)"
                        v-tooltip="'Cancelar Compra'">
                </Button>
              </div>
            </template>
          </Column>
          <Column field="id_compra" header="Numero Ingreso"></Column>
          <Column field="total_factura" header="Total Factura"></Column>
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
import infoCompraService from '@/components/services/infoComprasService';
import infoCompraDetService from '@/components/services/infoComprasDetService';
import admiParametrosService from "@/components/services/admiParametrosService.js";


export default {
  name: 'infoCompra',
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
    Tooltip
  },
  created() {
    this.listarCompra();
    this.getSucursal();
    this.getMenus();
    this.getEstadosCompras();
    this.getFormasPagos();
    this.getProveedor();

    if (this.params.sucursal_id) {
      this.cargaDataParaCompra(this.params);
    }
  },
  data() {
    return {
      endPointSucursales: "/admiSucursal",
      endPointMesas: "/infoMesa",
      endPointMenu: "/infoMenu",
      endPointMenuDet: "/infoMenuDet",
      endPointCompra: "/infoCompra",
      endPointCompraDet: "/infoCompraDet",
      endPointFormaPago: "/admiFormaPago",
      endPointProveedor: "/infoProveedor",
      datos: [],
      datosCompras: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      nuevoRegistro: {formaPagoId: null, sucursalId: null, proveedorId: null},
      busquedaJson: {},
      mostrarDialogo: false,
      items: [],
      sucursalArray: [],
      formaPagoArray: [],
      proveedorArray: [],
      mesaArray: [],
      menuArray: [],
      valSubtotal: 0,
      valSubtotal12: 0,
      valSubtotal15: 0,
      valTotal: 0,
      estados_facturas: [],
      estado_Compra: "",
      update: false,
      activeIndex: 1,
    }
  },
  props: {
    params: {
      type: Object,
      default: () => ({})
    }
  },
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
    async cargaDataParaCompra(params) {
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
    async facturarCompra(item) {
      try {
        this.$router.push({name: 'info-facturas', params: {compra_id: item.id_compra}});
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
        let requestCompraDet = {};

        const responseImpuesto = await admiImpuestoService.getById(this.$api, dato.impuesto_id);
        const subUni = parseInt(dato.cantidad) * parseFloat(dato.precio);
        const imp = (subUni * responseImpuesto.porcentaje) / 100;

        requestCompraDet.subtotal_impuesto = imp;
        requestCompraDet.precio_unitario = parseFloat(dato.precio);
        requestCompraDet.total_detalle = subUni;
        requestCompraDet.cantidad = dato.cantidad;
        requestCompraDet.estado = 'Eliminado';
        requestCompraDet.usuario_modificacion = this.$store.state.empleado.usuario;

        if (dato.id_producto) {
          requestCompraDet.producto_id = dato.id_producto;
        }
        if (dato.id_plato) {
          requestCompraDet.plato_id = dato.id_plato;
        }
        if (dato.menu_id) {
          requestCompraDet.menu_id = dato.menu_id;
        }
        requestCompraDet.id_compra_det = dato.id_compra_det;
        requestCompraDet.compra_id = this.nuevoRegistro.id_compra;
        const responseEditCompraDet = await infoCompraDetService.update(this.$api, dato.id_compra_det, requestCompraDet);
        if (responseEditCompraDet.success === true) {
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
    async actualizarCompra() {
      try {
        this.nuevoRegistro.total = parseFloat(this.valTotal);
        this.nuevoRegistro.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);

        const responseEditCompra = await infoCompraService.update(this.$api, this.nuevoRegistro.id_compra, this.nuevoRegistro);
        if (responseEditCompra) {
          let bandera = false;
          for (const dato of this.datos) {
            let requestCompraDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, dato.impuesto_id);
            const subUni = parseInt(dato.cantidad) * parseFloat(dato.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestCompraDet.subtotal_impuesto = imp;
            requestCompraDet.precio_unitario = parseFloat(dato.precio);
            requestCompraDet.total_detalle = subUni;
            requestCompraDet.cantidad = dato.cantidad;
            requestCompraDet.estado = 'Pendiente';
            requestCompraDet.usuario_modificacion = this.$store.state.empleado.usuario;

            if (dato.id_producto) {
              requestCompraDet.producto_id = dato.id_producto;
            }
            if (dato.id_plato) {
              requestCompraDet.plato_id = dato.id_plato;
            }
            if (dato.menu_id) {
              requestCompraDet.menu_id = dato.menu_id;
            }

            if (dato.id_compra_det) {
              // Actualiza el detalle existente
              requestCompraDet.id_compra_det = dato.id_compra_det;
              requestCompraDet.compra_id = this.nuevoRegistro.id_compra;
              const responseEditCompraDet = await infoCompraDetService.update(this.$api, dato.id_compra_det, requestCompraDet);
              if (responseEditCompraDet) {
                bandera = true;
              }
            } else {
              // Crea un nuevo detalle
              requestCompraDet.compra_id = this.nuevoRegistro.id_compra;
              requestCompraDet.usuario_creacion = this.$store.state.empleado.usuario;
              const responseCreateCompraDet = await infoCompraDetService.insert(this.$api, requestCompraDet);
              if (responseCreateCompraDet) {
                bandera = true;
              }
            }
          }

          if (bandera) {
            this.$swal.fire({
              icon: "success",
              title: "¡Bien hecho!",
              text: `Compra actualizado.`,
            });
            this.activeIndex = 1;
            this.limpiar();
            this.listarCompra('Pendiente', this.sucursal_id);
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
    async editarCompra(item) {
      try {
        this.nuevoRegistro = item;
        const params = {
          compra_id: item.id_compra,
          estado: 'Activo'
        };
        const responseCompraDet = await infoCompraDetService.getByFilter(this.$api, params);
        if (responseCompraDet) {
          for (const responseCompraDetElement of responseCompraDet) {
            if (responseCompraDetElement.plato_id) {
              const respPlato = await infoPlatoService.getById(this.$api, responseCompraDetElement.plato_id);
              if (respPlato) {
                respPlato.menu_id = responseCompraDetElement.menu_id;
                respPlato.cantidad = responseCompraDetElement.cantidad;
                respPlato.id_compra_det = responseCompraDetElement.id_compra_det;
                respPlato.compra_id = responseCompraDetElement.compra_id;
                this.datos.push(respPlato);
              }
            } else if (responseCompraDetElement.producto_id) {
              const respProducto = await infoProductoService.getById(this.$api, responseCompraDetElement.producto_id);
              if (respProducto) {
                respProducto.menu_id = responseCompraDetElement.menu_id;
                respProducto.cantidad = responseCompraDetElement.cantidad;
                respProducto.id_compra_det = responseCompraDetElement.id_compra_det;
                respProducto.compra_id = responseCompraDetElement.compra_id;
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
    async anularCompra(item) {
      try {
        item.estado = "Anulado";
        const response = await infoCompraService.update(this.$api, item.id_compra, item);
        if (response.success === true) {
          const params = {
            compra_id: item.id_compra,
          }
          const responseDet = await infoCompraDetService.getByFilter(this.$api, params);
          if (responseDet) {
            for (const responseDetElement of responseDet) {
              responseDetElement.estado = "Anulado";
              await infoCompraDetService.update(this.$api, responseDetElement.id_compra_det,responseDetElement);
            }
          }
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarCompra('Pendiente', this.sucursal_id);
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
    async cancelarCompra(item) {
      try {
        item.estado = "Cancelado";
        const response = await infoCompraService.update(this.$api, item.id_compra, item);
        if (response.success === true) {
          const params = {
            compra_id: item.id_compra,
          }
          const responseDet = await infoCompraDetService.getByFilter(this.$api, params);
          if (responseDet) {
            for (const responseDetElement of responseDet) {
              responseDetElement.estado = "Cancelado";
              await infoCompraDetService.update(this.$api, responseDetElement.id_compra_det,responseDetElement);
            }
          }
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarCompra('Activo', this.sucursal_id);
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
    async restaurarCompraAnulado(item) {
      try {
        item.estado = "Pendiente";
        const response = await infoCompraService.update(this.$api, item.id_compra, item);
        if (response.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listarCompra('Activo', this.sucursal_id);
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
    async listarCompra(filtro = "", busqueda = {}) {
      try {
        this.limpiar();
        this.datosCompras = [];
        let params = {
          sucursal_id: this.sucursal_id,
          estado: filtro || 'Activo'
        };

        if (this.esAdminSistema) {
          if (busqueda && busqueda.value) {
            params.sucursal_id = busqueda.value;
          }
        }

        const response = await this.$api.post(`${this.endPointCompra}/filter`, params);
        const resp = response.data;
        if (resp.success === true) {
          this.datosCompras = resp.data;
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
    async guardarCompra() {
      try {
        let bandera = false;
        let requestCompra = {};
        if (this.esAdminSistema) {
          requestCompra.sucursal_id = this.nuevoRegistro.sucursalId.value;
        } else {
          requestCompra.sucursal_id = this.sucursal_id;
        }
        requestCompra.forma_pago_id = this.nuevoRegistro.formaPagoId.value;
        requestCompra.empleado_id = this.$store.state.empleado.empleado_id;
        requestCompra.proveedor_id = this.nuevoRegistro.proveedorId.value;

        requestCompra.estado = 'Activo';
        requestCompra.total_factura = parseFloat(this.valTotal);
        requestCompra.total_impuesto = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestCompra.impuesto_total = parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestCompra.total_con_impuesto = parseFloat(this.valTotal) + parseFloat(this.valSubtotal12) + parseFloat(this.valSubtotal15);
        requestCompra.usuario_creacion = this.$store.state.empleado.usuario;
        requestCompra.usuario_modificacion = this.$store.state.empleado.usuario;

        const responseCompra = await infoCompraService.insert(this.$api, requestCompra);
        const resCompra = responseCompra.data;
        if (responseCompra.success === true) {
          for (const element of this.datos) {

            let requestCompraDet = {};

            const responseImpuesto = await admiImpuestoService.getById(this.$api, element.impuesto_id);
            const subUni = parseInt(element.cantidad) * parseFloat(element.precio);
            const imp = (subUni * responseImpuesto.porcentaje) / 100;

            requestCompraDet.compra_id = resCompra.id_compra;
            requestCompraDet.subtotal_impuesto = imp;
            requestCompraDet.precio_unitario = parseFloat(element.precio);
            requestCompraDet.total_detalle = subUni;
            requestCompraDet.cantidad = element.cantidad;
            requestCompraDet.estado = 'Activo';
            requestCompraDet.usuario_creacion = this.$store.state.empleado.usuario;
            requestCompraDet.usuario_modificacion = this.$store.state.empleado.usuario;

            if (element.id_producto) {
              requestCompraDet.producto_id = element.id_producto;
            }
            if (element.id_plato) {
              requestCompraDet.plato_id = element.id_plato;
            }
            if (element.menu_id) {
              requestCompraDet.menu_id = element.menu_id;
            }


            const responseCompraDet = await infoCompraDetService.insert(this.$api, requestCompraDet);
            if (responseCompraDet.success === true) {
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
            this.listarCompra('Activo', this.sucursal_id)
          }
        }
      } catch (error) {
        console.error(error);
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
    async searchEstadosCompras(event) {
      try {
        const params = {descripcion: "estados_sistemas", estado: "Activo"};
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
    async getEstadosCompras() {
      try {
        const params = {descripcion: "estados_sistemas", estado: "Activo"};
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
        this.mostrarDialogo = false;
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
    },
    limpiarTabs() {
      this.limpiar()
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
    async getProveedor() {
      try {
        let params = {};
        params.estado = "Activo";
        const response = await this.$api.post(`${this.endPointProveedor}/filter`, params);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.proveedorArray = respuesta.data;
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
    async searchProveedor(event) {
      try {
        let params = {};
        params.estado = "Activo";
        const response = await this.$api.post(`${this.endPointProveedor}/filter`, params);
        const data = response.data;
        const filter = data.data.filter(param =>
            param.razon_social_proveedor.toString().includes(event.query)
        );
        this.proveedorArray = filter.map(param => {
          return {
            label: param.razon_social_proveedor,
            value: param.id_proveedor
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
  },
}
</script>

<style lang="scss" scoped></style>
