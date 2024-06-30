<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de formas de pago</span>
    <div class="barra-herramientas">
      <Button
        label="Nuevo"
        icon="pi pi-plus"
        style="margin: 1rem 1rem 1rem 1rem"
        class="p-button-primary"
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
          v-model="nuevoRegistro.nombre"
          placeholder="Nombre"
          class="input-spacing"
        />
        <InputText
          :disabled="view"
          id="descripcion"
          v-model="nuevoRegistro.descripcion"
          placeholder="Descripcion"
          class="input-spacing"
        />
      </div>
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
      <Column field="nombre" header="Nombre"></Column>
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
        nombre: "",
        descripcion: "",
      },
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
    async agregar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.post("/admiFormaPago", this.nuevoRegistro);
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
        const response = await this.$api.post("/admiFormaPago/filter", {
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

    ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.mostrarDialogo = true;
      this.view = true;
    },
    editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.nuevoRegistro.id_forma_pago = item.id_forma_pago;
      this.mostrarDialogo = true;
      this.update = true;
    },
    async actualizar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.put(
          "/admiFormaPago/" + this.nuevoRegistro.id_forma_pago,
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
        const response = await this.$api.delete("/admiFormaPago/" + item.id_forma_pago);
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
      this.nuevoRegistro = { descripcion: "" };
    },
  },
};
</script>
