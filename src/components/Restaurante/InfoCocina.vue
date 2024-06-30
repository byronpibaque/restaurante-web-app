<template>
  <div class="responsive-dialog">
    <span class="text-title">Información de Cocinas</span>
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Nuevo" icon="pi pi-plus" style="margin: 1rem 1rem 1rem 1rem" class="p-button-primary"
          @click="mostrarDialogo = true"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <InputText v-model="busquedaBHerramienta" class="" placeholder="Buscar:" @keyup="filtrar(busqueda)"></InputText>
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estados_sistemas"  placeholder="Filtra por estados:" v-model="estado_sistema"
          :suggestions="estadosArray" @complete="searchEstados"
          dropdown
          @keypress.enter="listar(estado_sistema, sucursal)" />
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="sucursal"  placeholder="Filtra por sucursal:" v-model="sucursal"
          :suggestions="sucursalArray" @complete="searchSucursal" dropdown
          @keypress.enter="listar(estado_sistema, sucursal)" field="label" />
      </div>

    </div>
    <Dialog :header="dialogHeader" v-model:visible="mostrarDialogo" @hide="limpiar" class="responsive-dialog1">
      <div class="dialog-content">
        <InputText :disabled="view" id="numero_cocina" v-model="nuevoRegistro.numero_cocina" placeholder="# Cocina:"
          class="input-spacing" />
      </div>
      <div class="dialog-content" v-if="esAdminSistema">
        <AutoComplete id="sucursales" :disabled="view" class="input-spacing" placeholder="Sucursal:"
          v-model="nuevoRegistro.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
          dropdown
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
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)" v-tooltip="'Editar mesa'"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" v-if="slotProps.data.estado !== 'Eliminado'" @click="eliminar(slotProps.data)" v-tooltip="'Eliminar'"></Button>
            <Button v-if="slotProps.data.estado === 'Eliminado'" icon="pi pi-history" class="boton-naranja"
              @click="restaurar(slotProps.data)" v-tooltip="'Restaurar'" ></Button>
          </div>
        </template>
      </Column>
      <Column field="numero_cocina" header="Numero Cocina"></Column>
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
import admiSucursalService from "../services/admiSucursalesService";
import admiParametrosService from "../services/admiParametrosService";

export default {
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
    AutoComplete
  },
  data() {
    name: 'InfoCocina'
    return {
      endpoint: "/infoCocina",
      endPointSucursales: "/admiSucursal",
      mostrarDialogo: false,
      nuevoRegistro: {
        numero_cocina: "",
        sucursalId: "",
      },
      datos: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      sucursalArray: [],
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
    this.getSucursal();
    this.getEstados();
  },
  methods: {
    openInfoMesasDialogUpdate() {
      this.$refs.infoMesasEstadosDialog.openDialogUpdateEstado();
    },
    cambiarEstadoMesa(item){
      this.nuevoRegistro = item;
      this.openInfoMesasDialogUpdate();
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
    async searchEstados(event) {
      try {
        const params = { descripcion: "estados_sistemas", estado: "Activo" };
        const data = await admiParametrosService.getbyfilterCab(this.$api,params)
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
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api,params)
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
        let sucursal_id;
        if (!this.esAdminSistema) {
          sucursal_id = this.sucursal_id;
        } else {
          sucursal_id = await this.nuevoRegistro.sucursalId.value;
        }
        this.nuevoRegistro.estado = 'Activo';
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.sucursal_id = sucursal_id;
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
    async listar(filtro = "", sucursal = "") {
      try {
        let params = {}
        let sucursal_id;
        if (!this.esAdminSistema) {
          sucursal_id = this.sucursal_id;
        } else {
          sucursal_id = sucursal.value;
        }

        params.sucursal_id = sucursal_id;

        if (filtro) {
          params.estado = filtro 
        }else{
          params.estado = 'Activo' 
        }

        const response = await this.$api.post(`${this.endpoint}/filter`, params);
        const resp = response.data;
        if (resp.success === true) {
          this.datos = resp.data;
        }

      } catch (e) {
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.data}`,
        });
        this.datos=[]
      }
    },
    async ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.numero_cocina = item.numero_cocina;
      this.nuevoRegistro.capacidad = item.capacidad;
      this.nuevoRegistro.estado = item.estado;
      const response = await admiSucursalService.getById(this.$api, item.sucursal_id);
      this.nuevoRegistro.sucursalId = response.nombre;
      this.mostrarDialogo = true;
      this.view = true;
    },
    async editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.id_cocina = item.id_cocina;
      this.nuevoRegistro.numero_cocina = item.numero_cocina;
      this.nuevoRegistro.capacidad = item.capacidad;
      this.nuevoRegistro.estado = item.estado;
      const response = await admiSucursalService.getById(this.$api, item.sucursal_id);
      this.nuevoRegistro.sucursalId = response.nombre;
      this.nuevoRegistro.sucursal_id = item.sucursal_id;
      this.mostrarDialogo = true;
      this.update = true;
    },
    async actualizar() {
      try {
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        if(!this.nuevoRegistro.sucursal_id){
          this.nuevoRegistro.sucursal_id = this.nuevoRegistro.sucursalId.value
        }
        const resCab = await this.$api.put(`${this.endpoint}/${this.nuevoRegistro.id_cocina}`,
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
        const response = await this.$api.delete(`${this.endpoint}/${item.id_cocina}`);
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
      this.nuevoRegistro = { numero_cocina: "",  estado: "",sucursalId:""};
    },
    async restaurar(item){
      try {
        item.estado="Activo";
        const response = await this.$api.put(`${this.endpoint}/${item.id_cocina}`,item);
        const resp = response.data;
        if (resp.success === true) {
          this.$swal.fire({
            icon:"success",
            title:"Actualizado",
            text:"Registro actualizado exitosamente!",
            timer:2000
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
