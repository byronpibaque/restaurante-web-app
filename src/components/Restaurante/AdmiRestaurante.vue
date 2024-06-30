<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de restaurantes</span>
    <div class="barra-herramientas">
      <Button label="Nuevo" icon="pi pi-plus" style="margin: 1rem 1rem 1rem 1rem" class="p-button-primary"
        @click="mostrarDialogo = true"></Button>
      <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar"></Button>
    </div>
    <Dialog :header="dialogHeader" v-model:visible="mostrarDialogo" @hide="limpiar" class="responsive-dialog1">
      <div class="dialog-content">
        <InputText :disabled="view" id="nombre" v-model="nuevoRegistro.nombre" placeholder="Nombre"
          class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputText :disabled="view" id="direccion" v-model="nuevoRegistro.direccion" placeholder="Direccion"
          class="input-spacing" />
      </div>
      <div class="dialog-content">
        <AutoComplete id="propietarios" :disabled="view" class="input-spacing" placeholder="Propietario:" v-model="nuevoRegistro.propietarioId"
          :suggestions="propietariosArray" @complete="searchPropietario" field="label" />
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
            <Button icon="pi pi-eye" color="boton-azul" @click="ver(slotProps.data)"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" @click="eliminar(slotProps.data)"></Button>
          </div>
        </template>
      </Column>
      <Column field="nombre" header="Nombre"></Column>
      <Column field="nombre_pila" header="Propietario"></Column>
      <Column field="razon_social" header="Razon Social"></Column>
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
    name: 'AdmiRestaurante'
    return {
      endpoint: "/admiRestaurante",
      endpointPropietario: "/infoPropietario",
      mostrarDialogo: false,
      nuevoRegistro: {
        nombre: "",
        direccion: "",
        propietarioId: "",
      },
      datos: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      propietariosArray: [],
    };
  },
  created() {
    this.listar();
    this.getPropietario();
  },
  methods: {
    async searchPropietario(event) {
      try {
        const response = await this.$api.post(`${this.endpointPropietario}/Alldata`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.razon_social.toLowerCase().includes(event.query.toLowerCase())
        );
        this.propietariosArray = filter.map(param => {
          return {
            label: param.razon_social,
            value: param.id_propietario
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
    async getPropietario() {
      try {
        const response = await this.$api.post(`${this.endpointPropietario}/Alldata`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.propietariosArray = respuesta.data;
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
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.propietario_id = this.nuevoRegistro.propietarioId.value
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
    async listar() {
      try {
        const response = await this.$api.post(`${this.endpoint}/filter`, { estado: "Activo" });
        const resp = response.data;
        if (resp.success === true) {
          this.datos = resp.data;
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

    ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.direccion = item.direccion;
      this.nuevoRegistro.propietarioId = item.razon_social;
      this.mostrarDialogo = true;
      this.view = true;
    },
    editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.id_restaurante = item.id_restaurante;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.direccion = item.direccion;
      this.nuevoRegistro.propietarioId = item.razon_social;
      this.mostrarDialogo = true;
      this.update = true;
    },
    async actualizar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.propietario_id = this.nuevoRegistro.propietarioId.value
        console.log(this.nuevoRegistro);
        const resCab = await this.$api.put(`${this.endpoint}/${this.nuevoRegistro.id_restaurante}`,
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
        const response = await this.$api.delete(`${this.endpoint}/${item.id_restaurante}`);
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
      this.nuevoRegistro = { nombre: "", direccion:"", propietarioId:"" };
    },
  },
};
</script>
