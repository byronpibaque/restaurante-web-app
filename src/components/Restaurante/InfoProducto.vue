<template>
  <div class="responsive-dialog">
    <span class="text-title">Información de Productos</span>
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Nuevo" icon="pi pi-plus" style="margin: 1rem 1rem 1rem 1rem" class="p-button-primary"
          @click="mostrarDialogo = true"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <InputText v-model="busquedaBHerramienta" class="" placeholder="Buscar:" @keyup="filtrar(busquedaBHerramienta)"></InputText>
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estados_sistemas" placeholder="Filtra por estados:" v-model="estado_sistema"
          :suggestions="estadosArray" @complete="searchEstados" dropdown
          @keypress.enter="listar(estado_sistema, nuevoRegistro.categoriaId, nuevoRegistro.impuestoId)" />
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="categorias" placeholder="Filtra por categorias:" v-model="nuevoRegistro.categoriaId"
          :suggestions="categoriaArray" @complete="searchCategoria" dropdown
          @keypress.enter="listar(estado_sistema, nuevoRegistro.categoriaId, nuevoRegistro.impuestoId)" field="label" />
      </div>

      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="categorias" placeholder="Filtra por impuestos:" v-model="nuevoRegistro.impuestoId"
          :suggestions="impuestoArray" @complete="searchImpuesto" dropdown
          @keypress.enter="listar(estado_sistema, nuevoRegistro.categoriaId, nuevoRegistro.impuestoId)" field="label" />
      </div>

    </div>
    <Dialog :header="dialogHeader" v-model:visible="mostrarDialogo" @hide="limpiar" class="responsive-dialog1">
      <div class="dialog-content">
        <InputText :disabled="view" id="codigo_barra" v-model="nuevoRegistro.codigo_barra" placeholder="Codigo de Barras:"
                   maxlength="5"

                   class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputText :disabled="view" id="nombre" v-model="nuevoRegistro.nombre" placeholder="Producto:"
                   maxlength="25"
                   class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputText :disabled="view" id="descripcion" v-model="nuevoRegistro.descripcion" placeholder="Descripcion:"
                   maxlength="25"
                   class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputNumber :disabled="view" v-model="nuevoRegistro.precio" inputId="currency-us" mode="currency"
          placeholder="Precio" currency="USD" locale="en-US" class="input-spacing" />
      </div>
      <div class="dialog-content">
        <span class="text-subtitle">Existencias:</span>
        <InputNumber :disabled="true" v-model="nuevoRegistro.existencias" showButtons buttonLayout="vertical"
          style="width: 3rem" :min="0" :max="0">
          <template #incrementbuttonicon>
            <span class="pi pi-plus" />
          </template>
          <template #decrementbuttonicon>
            <span class="pi pi-minus" />
          </template>
        </InputNumber>
      </div>
      <div class="dialog-content">
        <AutoComplete id="impuestos" :disabled="view" class="input-spacing" placeholder="Impuesto:"
          v-model="nuevoRegistro.impuestoId" :suggestions="impuestoArray" @complete="searchImpuesto" dropdown
          field="label" />
      </div>
      <div class="dialog-content">
        <AutoComplete id="categorias" :disabled="view" class="input-spacing" placeholder="Categoría:"
          v-model="nuevoRegistro.categoriaId" :suggestions="categoriaArray" @complete="searchCategoria" dropdown
          field="label" />
      </div>

      <div class="p-dialog-footer">
        <Button v-if="update" label="Actualizar" icon="pi pi-check" class="p-button-success"
          @click="actualizar"></Button>
        <Button v-if="!view && !update" label="Guardar" icon="pi pi-check" class="p-button-success"
          @click="agregar"></Button>
      </div>
    </Dialog>

    <DataTable :value="datos" class="responsive-datatable">
      <Column field="options" header="Options">
        <template #body="slotProps">
          <div class="option-buttons">
            <Button icon="pi pi-eye" color="boton-azul" @click="ver(slotProps.data)" v-tooltip="'Ver'"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)"
              v-tooltip="'Editar'"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" v-if="slotProps.data.estado !== 'Eliminado'"
              @click="eliminar(slotProps.data)" v-tooltip="'Eliminar'"></Button>
            <Button v-if="slotProps.data.estado === 'Eliminado'" icon="pi pi-history" class="boton-naranja"
              @click="restaurar(slotProps.data)"></Button>
          </div>
        </template>
      </Column>
      <Column field="codigo_barra" header="Codigo Barras"></Column>
      <Column field="nombre" header="Producto"></Column>
      <Column field="descripcion" header="Descripcion"></Column>
      <Column field="precio" header="Precio">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.precio) }}
        </template>
      </Column>
      <Column field="existencias" header="Existencias">
      </Column>
      <Column field="estado" header="Estado"></Column>
    </DataTable>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Tooltip from "primevue/tooltip";
import Dialog from "primevue/dialog";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AutoComplete from "primevue/autocomplete";
import admiParametrosService from "../services/admiParametrosService";
import infoMesasEstadosDialog from '../Restaurante/options/infoMesasEstadosDialog.vue'
import InputNumber from "primevue/inputnumber";
import admiCategoriaService from "../services/admiCategoriasService";
import admiImpuestoService from "../services/admiImpuestosService";

export default {
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    InputNumber,
    Dialog,
    Tooltip,
    AutoComplete,
    infoMesasEstadosDialog
  },
  data() {
    name: 'InfoProducto'
    return {
      endpoint: "/infoProducto",
      endPointImpuestos: "/admiImpuesto",
      endpointCategorias: "/admiCategoria",
      mostrarDialogo: false,
      nuevoRegistro: {
        codigo_barra:"",
        nombre: "",
        descripcion: "",
        precio: 0.0,
        existencias:0,
        impuestoId: "",
        categoriaId: "",
      },
      datos: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      impuestoArray: [],
      categoriaArray: [],
      estadosArray: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      busquedaBHerramienta: "",
      busqueda: "",
      estado_sistema: "",
      sucursal: "",
      estados_sistemas: [],
    };
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
  created() {
    this.listar();
    this.getImpuesto();
    this.getCategoria();
    this.getEstados();
  },
  methods: {
    formatCurrency(value) {
      let numberValue = Number(value);
      if (isNaN(numberValue)) {
        throw new TypeError('Value must be a number or a string representing a number');
      }
      return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
    async getParametros() {
      try {
        const params = { descripcion: "estados_sistemas", estado: "Activo" };
        const resTipoDoc = await admiParametrosService.getbyfilterCab(this.$api, params);
        this.estados_sistemas = resTipoDoc.map(param => param.valor);
      } catch (e) {
        console.log(e);
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    async searchBHerramienta(event) {
      try {
        const params = { descripcion: "estados_sistemas", estado: "Activo" };
        const resTipoDoc = await admiParametrosService.getbyfilterCab(this.$api, params);
        this.estados_sistemas = resTipoDoc.filter(param =>
          param.valor.toLowerCase().includes(event.query.toLowerCase()) ||
          param.clave.toLowerCase().includes(event.query.toLowerCase())
        ).map(param => param.valor);
      } catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    filtrar(text) {
      const textoBusqueda = text.toLowerCase();
      this.datos = this.datos.filter(item =>
        Object.values(item).some(value => typeof value === 'string' && value.toLowerCase().includes(textoBusqueda))
      );
      if (text === "") {
        this.listar();
      }
    },
    getDataUserSesion() {
      const roles = this.$store.state.roles;
      return roles;
    },
    async searchImpuesto(event) {
      try {
        const response = await this.$api.get(`${this.endPointImpuestos}`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.impuestoArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_impuesto
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
    async getImpuesto() {
      try {
        const response = await this.$api.get(`${this.endPointImpuestos}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.impuestoArray = respuesta.data;
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
    async searchCategoria(event) {
      try {
        const response = await this.$api.get(`${this.endpointCategorias}`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.categoriaArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_categoria
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
    async getCategoria() {
      try {
        const response = await this.$api.get(`${this.endpointCategorias}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.categoriaArray = respuesta.data;
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
    async searchEstados(event) {
      try {
        const params = { descripcion: "estados_sistemas", estado: "Activo" };
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
        this.estadosArray = data.filter(param =>
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
    async getEstados() {
      try {
        const params = { descripcion: "estados_sistemas", estado: "Activo" };
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
        if (respuesta.success === true) {
          this.estadosArray = respuesta.data;
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
    async agregar() {
      try {
        this.nuevoRegistro.estado = 'Activo';
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.categoria_id = this.nuevoRegistro.categoriaId.value;
        this.nuevoRegistro.impuesto_id = this.nuevoRegistro.impuestoId.value;
        const resCab = await this.$api.post(`${this.endpoint}`, this.nuevoRegistro);
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          this.mostrarDialogo = false;
          this.limpiar();
          this.listar();
          this.$swal.fire({
            icon: "success",
            title: "Bien.. ✅",
            text: `Guardado!`,
          });
        }
      } catch (e) {
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.message}`,
        });
      }
    },
    async listar(filtro = "", categoriaId = {}, impuestoId = {}) {
      try {
        let params = {}

        if (filtro) {
          params.estado = filtro
        } else if (!filtro) {
          params.estado='Activo'
        }
        if (categoriaId) {
          params.categoria_id = categoriaId.value
        }
        if (impuestoId) {
          params.impuesto_id = impuestoId.value
        }
        console.log(params);
        const response = await this.$api.post(`${this.endpoint}/filter`, params);
        const resp = response.data;
        if (resp.success === true) {
          this.datos = resp.data;
        }

      } catch (e) {
        console.log(e);
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.data}`,
        });
        this.datos = []
      }
    },
    async ver(item) {
      console.log(item);
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.codigo_barra = item.codigo_barra;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.nuevoRegistro.precio = item.precio;
      this.nuevoRegistro.existencias = item.existencias;
      this.nuevoRegistro.estado = item.estado;
      const resCategoria = await admiCategoriaService.getById(this.$api, item.categoria_id);
      this.nuevoRegistro.categoriaId = resCategoria.nombre;
      const resImpuesto = await admiImpuestoService.getById(this.$api, item.impuesto_id);
      this.nuevoRegistro.impuestoId = resImpuesto.nombre;
      this.mostrarDialogo = true;
      this.view = true;
    },
    async editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.id_producto = item.id_producto;
      this.nuevoRegistro.codigo_barra = item.codigo_barra;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.nuevoRegistro.precio = item.precio;
      this.nuevoRegistro.existencias = item.existencias;
      this.nuevoRegistro.estado = item.estado;
      const resCategoria = await admiCategoriaService.getById(this.$api, item.categoria_id);
      this.nuevoRegistro.categoriaId = resCategoria.nombre;
      this.nuevoRegistro.categoria_id = item.categoria_id;

      const resImpuesto = await admiImpuestoService.getById(this.$api, item.impuesto_id);
      this.nuevoRegistro.impuestoId = resImpuesto.nombre;
      this.nuevoRegistro.impuesto_id = item.impuesto_id;

      this.mostrarDialogo = true;
      this.update = true;
    },
    async actualizar() {
      try {
        if (this.nuevoRegistro.impuestoId.value) {
          this.nuevoRegistro.impuesto_id = this.nuevoRegistro.impuestoId.value
        }
        if (this.nuevoRegistro.categoriaId.value) {
          this.nuevoRegistro.categoria_id = this.nuevoRegistro.categoriaId.value
        }
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.put(`${this.endpoint}/${this.nuevoRegistro.id_producto}`,
          this.nuevoRegistro
        );
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          this.mostrarDialogo = false;
          this.limpiar();
          this.listar();
          this.$swal.fire({
            icon: "success",
            title: "Bien.. ✅",
            text: `Actualizado!`,
          });
        }
      } catch (e) {
        const data = e.response;
        this.mostrarDialogo = false;
        console.log(e);
        console.log("Error Response:", data);
        this.$swal.fire({
          icon: "error",
          title: `Upss.. 😢 ${data.status}`,
          text: `Algo salió mal: ${data?.data?.message}`,
        });
      }
    },
    async eliminar(item) {
      try {
        const response = await this.$api.delete(`${this.endpoint}/${item.id_producto}`);
        const resp = response.data;
        if (resp.success === true) {
          this.listar();
        }
      } catch (e) {
        const data = e.response;
        console.log(e.response);
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.message}`,
        });
      }
    },
    limpiar() {
      this.dialogHeader = "Nuevo Registro";
      this.view = false;
      this.update = false;
      this.nuevoRegistro = { codigo_barra:"",nombre: "", descripcion: "", estado: "", precio: 0.0, existencias: 0 };
    },
    async restaurar(item) {
      try {
        item.estado = "Activo";
        const response = await this.$api.put(`${this.endpoint}/${item.id_producto}`, item);
        const resp = response.data;
        if (resp.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Registro actualizado exitosamente!",
            timer: 2000
          });
          this.listar();
        }
      } catch (e) {
        console.log(e);
        const data = e.response;
        console.log(e.response);
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.message}`,
        });
      }
    },
  },
};
</script>
