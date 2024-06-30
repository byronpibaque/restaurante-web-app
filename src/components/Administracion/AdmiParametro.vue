<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de parámetros</span>
    <div class="barra-herramientas">
      <Button
        label="Nuevo"
        icon="pi pi-plus"
        class="p-button-primary"
        style="margin: 1rem 1rem 1rem 1rem"
        @click="mostrarDialogo = true"
      ></Button>
      <Button
        label="Refrescar"
        icon="pi pi-sync"
        class="p-button-success"
        @click="listar"
      ></Button>
    </div>

    <Dialog
      :header="dialogHeader"
      v-model:visible="mostrarDialogo"
      @hide="limpiar"
      class="responsive-dialog1"
    >
      <div class="dialog-content">
        <InputText
          :disabled="view"
          id="nombre"
          v-model="nuevoRegistro.descripcion"
          placeholder="Descripcion"
          class="input-spacing"
        />
      </div>
      <div v-if="!view">
        Agrega detalle:
        <div>
          <Button
            class="p-button-rounded p-button-success buton-spacing"
            @click="agregarDetalle()"
          >
            <i class="pi pi-plus"></i>
          </Button>
          <InputText
            id="nombre"
            v-model="nuevoDetalle.clave"
            placeholder="Clave"
            class="input-spacing"
          />
          <InputText
            id="valor"
            v-model="nuevoDetalle.valor"
            placeholder="Valor"
            class="input-spacing"
          />
        </div>
      </div>
      <DataTable :value="detalle" class="responsive-datatable">
        <Column field="clave" header="Clave"></Column>
        <Column field="valor" header="Valor"></Column>
        <Column field="estado" header="Estado"></Column>
        <Column field="options" header="Options" v-if="update">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              class="boton-rojo"
              @click="eliminarDetalle(slotProps.data)"
              v-tooltip="'Eliminar'"
            ></Button>
            <Button
              icon="pi pi-pencil"
              class="boton-verde"
              @click="editarDetalle(slotProps.data)"
              v-tooltip="'Editar'"
            ></Button>
          </template>
        </Column>
      </DataTable>
      <div class="p-dialog-footer">
        <Button
          v-if="update"
          label="Actualizar"
          icon="pi pi-check"
          class="p-button-success"
          @click="actualizar"
        ></Button>
        <Button
          v-if="!view && !update"
          label="Guardar"
          icon="pi pi-check"
          class="p-button-success"
          @click="agregar"
        ></Button>
      </div>
    </Dialog>

    <DataTable :value="datos" class="responsive-datatable">
      <Column field="options" header="Options">
        <template #body="slotProps">
          <div class="option-buttons">
            <Button
              icon="pi pi-eye"
              color="boton-azul"
              @click="ver(slotProps.data)"
            ></Button>
            <Button
              icon="pi pi-pencil"
              class="boton-verde"
              @click="editar(slotProps.data)"
            ></Button>
            <Button
              icon="pi pi-trash"
              class="boton-rojo"
              @click="eliminar(slotProps.data)"
            ></Button>
          </div>
        </template>
      </Column>
      <Column field="descripcion" header="Descripcion"></Column>
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

export default {
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
  },
  data() {
    return {
      mostrarDialogo: false,
      nuevoRegistro: {
        descripcion: "",
      },
      nuevoDetalle: {
        clave: "",
        valor: "",
        estado: "",
      },
      detalle: [],
      datos: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
    };
  },
  created() {
    this.listar();
  },
  methods: {
    async agregarDetalle() {
      this.nuevoDetalle.estado = "Activo";
      this.nuevoDetalle.usuario_creacion = this.$store.state.empleado.usuario;
      this.nuevoDetalle.usuario_modificacion = this.$store.state.empleado.usuario;
      this.detalle.push(Object.assign({}, this.nuevoDetalle));
    },
    async agregar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.post("/admiParametroCab", this.nuevoRegistro);
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          const promises = this.detalle.map(async (item) => {
            item.parametro_cab_id = respuesta.data.id_parametro_cab;
            const resp = await this.$api.post("/admiParametroDet", item);
            return resp.data;
          });
          const results = await Promise.all(promises);
          results.forEach((res) => {
            if (res.success) {
              console.log("Detalle guardado correctamente");
            } else {
              console.log(res);
              console.error("Hubo un error al guardar el detalle");
            }
          });
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
        const response = await this.$api.post("/admiParametroCab/filter", {
          estado: "Activo",
        });
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
    async listar_detalle(item) {
      try {
        const response = await this.$api.post("/admiParametroDet/filter", {
          parametro_cab_id: item,
          estado: "Activo",
        });
        const resp = response.data;
        if (resp.success === true) {
          this.detalle = resp.data;
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
    ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.descripcion = item.descripcion;
      this.listar_detalle(item.id_parametro_cab);
      this.mostrarDialogo = true;
      this.view = true;
    },
    editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.descripcion = item.descripcion;
      this.nuevoRegistro.id_parametro_cab = item.id_parametro_cab;
      this.listar_detalle(item.id_parametro_cab);
      this.mostrarDialogo = true;
      this.update = true;
    },
    editarDetalle(item) {
      this.nuevoDetalle = item;
      this.detalle = this.detalle.filter((detalleItem) => detalleItem !== item);
    },
    async actualizar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.put(
          "/admiParametroCab/" + this.nuevoRegistro.id_parametro_cab,
          this.nuevoRegistro
        );
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          const promises = this.detalle.map(async (item) => {
            let resp;

            if (this.nuevoDetalle.parametro_cab_id || !item.parametro_cab_id) {
              item.parametro_cab_id =
                this.nuevoDetalle.parametro_cab_id || this.nuevoRegistro.id_parametro_cab;
              const url = this.nuevoDetalle.parametro_cab_id
                ? "/admiParametroDet/" + item.id_parametro_det
                : "/admiParametroDet";
              const method = this.nuevoDetalle.parametro_cab_id ? "put" : "post";

              resp = await this.$api[method](url, item);
            }

            return resp?.data;
          });
          const results = await Promise.allSettled(promises);

          results.forEach((result) => {
            if (result.status === "fulfilled") {
              if (result.value && result.value.success) {
                console.log("Detalle actualizado correctamente");
              }
            } else {
              console.error("Hubo un error al procesar una promesa", result.reason);
            }
          });
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
        console.log(e);
        console.log("Error Response:", data); // Añadido
        this.$swal.fire({
          icon: "error",
          title: `Upss.. 😢 ${data.status}`,
          text: `Algo salió mal: ${data?.data?.message}`,
        });
      }
    },
    async eliminar(item) {
      try {
        const response = await this.$api.delete(
          "/admiParametroCab/" + item.id_parametro_cab
        );
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
    async eliminarDetalle(item) {
      try {
        const response = await this.$api.delete(
          "/admiParametroDet/" + item.id_parametro_det
        );
        const resp = response.data;
        if (resp.success === true) {
          this.listar_detalle(item.parametro_cab_id);
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
      this.detalle = [];
      this.nuevoRegistro = { descripcion: "" };
      this.nuevoDetalle = { clave: "", valor: "" };
    },
  },
};
</script>
