<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de personas</span>
    <div class="grid">
      <div  class="col-12 md:col-6 lg:col-3">
        <Button label="Nuevo" icon="pi pi-plus" class="p-button-primary"
        @click="openPersonaDialog"></Button>
      </div>
      <div  class="col-12 md:col-6 lg:col-3">
      <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar()"></Button>
      </div>
      <div  class="col-12 md:col-6 lg:col-3">
        <InputText v-model="busquedaBHerramienta" class="" placeholder="Buscar:"
        @keyup="filtrar(busqueda)"></InputText>
      </div>
       <div  class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estado_sistema" class="w-2" placeholder="Filtra por estados:" v-model="estado_sistema"
        :suggestions="estados_sistemas" @complete="searchBHerramienta"
         @keypress.enter="listar(estado_sistema)" />
       </div>
      
    </div>

    <div>
      <AdmiPersonaDialog :registro="nuevoRegistro" :headerTitle="dialogHeader" @registro-agregado="listar"
        ref="AdmiPersonaDialog"></AdmiPersonaDialog>
    </div>

    <DataTable :value="datos" class="responsive-datatable">
      <Column field="options" header="Options">
        <template #body="slotProps">
          <div class="option-buttons">
            <Button icon="pi pi-eye" color="boton-azul" @click="ver(slotProps.data)"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" @click="eliminar(slotProps.data)"></Button>
            <Button v-if="slotProps.data.estado === 'Eliminado'" icon="pi pi-history" class="boton-naranja"
              @click="restaurar(slotProps.data)"></Button>
          </div>
        </template>
      </Column>
      <Column field="tipo_documento" header="Tipo Documento"></Column>
      <Column field="numero_identificacion" header="Número Identificación"></Column>
      <Column field="nombre" header="Nombre"></Column>
      <Column field="apellido" header="Apellido"></Column>
      <Column field="nombre_pila" header="Nombre Pila"></Column>
      <Column field="direccion" header="Dirección"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="celular" header="Celular"></Column>
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
import AdmiPersonaDialog from "./options/AdmiPersonaDialog.vue";
import admiParametrosService from "@/components/services/admiParametrosService";
import AutoComplete from "primevue/autocomplete";

export default {
  name: "AdmiPersona",
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
    AdmiPersonaDialog,
    AutoComplete
  },
  data() {
    return {
      mostrarDialogo: false,
      nuevoRegistro: {
        id_persona: "",
        tipo_documento: "",
        numero_identificacion: "",
        nombre: "",
        apellido: "",
        nombre_pila: "",
        direccion: "",
        email: "",
        celular: "+593",
        estado: "",
        usuario_creacion: "",
        usuario_modificacion: "",
      },
      datos: [],
      dialogHeader: "Nuevo Registro",
      endpoint: "/admiPersona",
      view: false,
      update: false,
      busqueda: "",
      busquedaBHerramienta: "",
      estado_sistema: "",
      estados_sistemas: [],
    };
  },
  created() {
    this.listar();
    this.getParametros();
  },
  methods: {
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
    openPersonaDialog() {
      this.$refs.AdmiPersonaDialog.openDialog();
    },
    async listar(filtro = "") {
      try {
        let params = {}
        if (!filtro) {
          params.estado = 'Activo'
        }else{
          params.estado = filtro
        };

        const response = await this.$api.post(`${this.endpoint}/filter`, params);
        const resp = response.data;
        if (resp.success === true) {
          this.datos = resp.data;
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
    ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.tipo_documento = item.tipo_documento;
      this.nuevoRegistro.numero_identificacion = item.numero_identificacion;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.apellido = item.apellido;
      this.nuevoRegistro.nombre_pila = item.nombre_pila;
      this.nuevoRegistro.direccion = item.direccion;
      this.nuevoRegistro.email = item.email;
      this.nuevoRegistro.celular = item.celular;
      this.nuevoRegistro.estado = item.estado;
      this.nuevoRegistro.usuario_creacion = item.usuario_creacion;
      this.nuevoRegistro.usuario_modificacion = item.usuario_modificacion;
      this.$refs.AdmiPersonaDialog.openDialogView();
    },
    editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.id_persona = item.id_persona;
      this.nuevoRegistro.tipo_documento = item.tipo_documento;
      this.nuevoRegistro.numero_identificacion = item.numero_identificacion;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.apellido = item.apellido;
      this.nuevoRegistro.nombre_pila = item.nombre_pila;
      this.nuevoRegistro.direccion = item.direccion;
      this.nuevoRegistro.email = item.email;
      this.nuevoRegistro.celular = item.celular;
      this.nuevoRegistro.estado = item.estado;
      this.nuevoRegistro.usuario_creacion = item.usuario_creacion;
      this.nuevoRegistro.usuario_modificacion = item.usuario_modificacion;
      this.$refs.AdmiPersonaDialog.openDialogUpdate();
    },
    async eliminar(item) {
      try {
        const response = await this.$api.delete(`${this.endpoint}/${item.id_persona}`);
        const resp = response.data;
        if (resp.success === true) {
          this.$swal.fire({
            icon:"success",
            title:"Eliminado",
            text:"Registro eliminado exitosamente!",
            timer:2000
          })
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
    async restaurar(item){
      try {
        item.estado="Activo";
        const response = await this.$api.put(`${this.endpoint}/${item.id_persona}`,item);
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
    limpiar() {
      this.dialogHeader = "Nuevo Registro";
      this.registro = {
        id_persona: "",
        tipo_documento: "",
        numero_identificacion: "",
        nombre: "",
        apellido: "",
        nombre_pila: "",
        direccion: "",
        email: "",
        celular: "+593",
        estado: "",
        usuario_creacion: "",
        usuario_modificacion: "",
      };
    },
  },
};
</script>
