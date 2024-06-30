<template>
  <div>
    <Dialog :header="headerTitle" v-model:visible="dialogVisible" @hide="closeDialog" class="responsive-dialog1">
      <div class="dialog-content" >
        <span class="text-subtitle"># Mesa: </span>{{ registro.numero_mesa }}
      </div>
      <div class="dialog-content">
        <span class="text-subtitle">Capacidad de personas: </span>{{ registro.capacidad }}
      </div>
      <div class="dialog-content">
        <AutoComplete id="estados_mesas" :disabled="view" class="input-spacing" placeholder="Estado de la mesa:"
          v-model="registro.estado" :suggestions="estadosArray" @complete="searchEstados" dropdown
           />
      </div>
      <div class="dialog-content" v-if="cambioEstado">
        <AutoComplete id="sucursales" :disabled="view" class="input-spacing" placeholder="Sucursal:"
          v-model="registro.sucursalId" :suggestions="sucursalArray" @complete="searchSucursal"
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
import admiParametrosService from "@/components/services/admiParametrosService";
import Divider from "primevue/divider";

export default {
  name: "infoMesasEstadosDialog",
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
    AutoComplete,
    Divider
  },
  props: {
    registro: {
      type: Object,
      default: () => ({}),
    },
    headerTitle: {
      type: String,
      default: "Cambio de estado de mesas",
    },
  },
  data() {
    return {
      endpoint: "/infoMesa",
      endPointSucursales: "/admiSucursal",
      dialogVisible: false,
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      cambioEstado:false,
      itemsDet: [],
      inputSearch: "",
      estado_mesa: "",
      sucursal: "",
      estados_mesas: [],
      sucursalArray: [],
      estadosArray: [],
    };
  },
  created() {
    this.getEstados();
    this.getSucursal();
  },
  methods: {
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
        const params = { descripcion: "estados_mesas", estado: "Activo" };
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
        const params = { descripcion: "estados_mesas", estado: "Activo" };
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

    async actualizar() {
      try {
        this.registro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.put(`${this.endpoint}/${this.registro.id_mesa}`,
          this.registro
        );
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          this.$emit("registro-agregado");
            this.closeDialog();
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
    openDialogUpdate() {
      this.dialogVisible = true;
      this.update = true;
      this.cambioEstado=true;
    },
    openDialogUpdateEstado() {
      this.dialogVisible = true;
      this.update = true;
    },
    closeDialog() {
      this.dialogVisible = false;
      this.limpiar();
    },
    limpiar() {
      this.view = false;
      this.update = false;
      this.cambioEstado = false;
      this.registro={};
    },
  },
};
</script>
