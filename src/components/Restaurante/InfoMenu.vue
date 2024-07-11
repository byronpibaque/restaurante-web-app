<template>
  <div class="responsive-dialog">
    <span class="text-title">Información de Menús</span>
    <div class="barra-herramientas">
      <Button label="Nuevo" icon="pi pi-plus" class="p-button-primary" style="margin: 1rem 1rem 1rem 1rem"
        @click="mostrarDialogo = true"></Button>
      <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar('Activo')"></Button>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estados_sistemas" placeholder="Filtra por estados:" v-model="estado_sistema"
          :suggestions="estadosArray" @complete="searchEstados" dropdown @keypress.enter="listar(estado_sistema)" />
      </div>
    </div>

    <Dialog :header="dialogHeader" v-model:visible="mostrarDialogo" @hide="limpiar" class="responsive-dialog1">
      <div>
        <InputText id="nombre" v-model="nuevoRegistro.nombre" placeholder="Nombre:" maxlength="25"  class="input-spacing" />
        <InputText id="valor" v-model="nuevoRegistro.descripcion" placeholder="Descripcion:" maxlength="25" class="input-spacing" />
      </div>
      <div v-if="!view">
        Agrega detalle:
        <div>
          <Button class="p-button-rounded p-button-success buton-spacing" @click="agregarDetalle()">
            <i class="pi pi-plus"></i>
          </Button>
          <div class="dialog-content">
            <AutoComplete id="platos" :disabled="view" class="input-spacing" placeholder="Platos:"
              v-model="nuevoDetalle.platoId" :suggestions="platoArray" @complete="searchPlato" dropdown field="label" />
          </div>
          <div class="dialog-content">
            <AutoComplete id="productos" :disabled="view" class="input-spacing" placeholder="Productos:"
              v-model="nuevoDetalle.productoId" :suggestions="productoArray" @complete="searchProducto" dropdown
              field="label" />
          </div>
        </div>
      </div>
      <DataTable :value="detalle" class="responsive-datatable">
        <Column field="plato" header="Plato"></Column>
        <Column field="producto" header="Producto"></Column>
        <Column field="options" header="Options" v-if="update">
          <template #body="slotProps">
            <Button icon="pi pi-trash" class="boton-rojo" @click="eliminarDetalle(slotProps.data)"
              v-tooltip="'Eliminar'"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editarDetalle(slotProps.data)"
              v-tooltip="'Editar'"></Button>
          </template>
        </Column>
      </DataTable>
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
            <Button icon="pi pi-trash" class="boton-rojo" v-if="slotProps.data.estado !== 'Eliminado'"
              @click="eliminar(slotProps.data)" v-tooltip="'Eliminar'"></Button>
            <Button v-if="slotProps.data.estado === 'Eliminado'" icon="pi pi-history" class="boton-naranja"
              @click="restaurar(slotProps.data)"></Button>
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
import AutoComplete from "primevue/autocomplete";
import infoPlatoService from "../services/infoPlatosService";
import infoProductoService from "../services/infoProductoService";
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
    return {
      mostrarDialogo: false,
      nuevoRegistro: {
        nombre: "",
        descripcion: "",
      },
      nuevoDetalle: {
        platoId: "",
        productoId: "",
      },
      detalle: [],
      datos: [],
      platoArray: [],
      productoArray: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      endPointPlatos: "/infoPlato",
      endPointProductos: "/infoProducto",
      estadosArray: [],
      estado_sistema: "",
    };
  },
  created() {
    this.listar();
    this.getPlato();
    this.getProducto();
  },
  methods: {
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
    async searchPlato(event) {
      try {
        const response = await this.$api.get(`${this.endPointPlatos}`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.platoArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_plato
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
    async getPlato() {
      try {
        const response = await this.$api.get(`${this.endPointPlatos}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.platoArray = respuesta.data;
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
    async searchProducto(event) {
      try {
        const response = await this.$api.get(`${this.endPointProductos}`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.productoArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_producto
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
    async getProducto() {
      try {
        const response = await this.$api.get(`${this.endPointProductos}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.productoArray = respuesta.data;
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
    async agregarDetalle() {
      this.nuevoDetalle.usuario_creacion = this.$store.state.empleado.usuario;
      this.nuevoDetalle.usuario_modificacion = this.$store.state.empleado.usuario;
      this.nuevoDetalle.plato_id = this.nuevoDetalle.platoId.value;
      this.nuevoDetalle.producto_id = this.nuevoDetalle.productoId.value;
      this.nuevoDetalle.plato = this.nuevoDetalle.platoId.label;
      this.nuevoDetalle.producto = this.nuevoDetalle.productoId.label;
      this.detalle.push(Object.assign({}, this.nuevoDetalle));
    },
    async agregar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.post("/infoMenu", this.nuevoRegistro);
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          const promises = this.detalle.map(async (item) => {
            item.menu_id = respuesta.data.id_menu;
            const resp = await this.$api.post("/infoMenuDet", item);
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
    async listar(filtro = "") {
      try {
        let params = {}


        if (filtro) {
          params.estado = filtro
        } else {
          params.estado = 'Activo'
        }
        const response = await this.$api.post("/infoMenu/filter", params);
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
        const response = await this.$api.post("/infoMenuDet/filter", {
          menu_id: item,
          estado: "Activo",
        });
        const resp = response.data;
        const respuesta = resp.data;

        if (Array.isArray(respuesta)) { // Verifica si respuesta es un array
          for (const element of respuesta) {
            if (element) {
              const dataProducto = await infoProductoService.getById(this.$api, element.producto_id);
              const dataPlato = await infoPlatoService.getById(this.$api, element.plato_id);
              const nuevoDetalle = {
                plato_id: element.plato_id,
                producto_id: element.producto_id,
                plato: dataPlato.nombre,
                producto: dataProducto.nombre,
                id_menu_det: element.id_menu_det,
                menu_id: element.menu_id,
              };
              this.detalle.push(nuevoDetalle);
            }
          }
        } else {
          console.error("El valor de respuesta no es un array:", respuesta);
          // Manejar el caso donde respuesta no es un array
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
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.listar_detalle(item.id_menu);
      this.mostrarDialogo = true;
      this.view = true;
    },
    editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.descripcion = item.descripcion;
      this.nuevoRegistro.id_menu = item.id_menu;
      this.listar_detalle(item.id_menu);
      this.mostrarDialogo = true;
      this.update = true;
    },
    async editarDetalle(item) {
      const dataProducto = await infoProductoService.getById(this.$api, item.producto_id);
      const dataPlato = await infoPlatoService.getById(this.$api, item.plato_id);
      if (dataPlato && dataPlato.id_plato) {
        this.nuevoDetalle.platoId = {
          label: dataPlato.nombre,
          value: dataPlato.id_plato
        };
      }
      if (dataProducto && dataProducto.id_producto) {
        this.nuevoDetalle.productoId = {
          label: dataProducto.nombre,
          value: dataProducto.id_producto
        };
      }

      this.detalle = this.detalle.filter((detalleItem) => detalleItem !== item);
    },
    async actualizar() {
      try {
        // Actualiza la información principal del menú
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;

        const resCab = await this.$api.put(
          "/infoMenu/" + this.nuevoRegistro.id_menu,
          this.nuevoRegistro
        );
        const respuesta = resCab.data;

        if (respuesta.success === true) {
          // Obtiene los detalles existentes del menú
          const resDetallesExistentes = await this.$api.get("/infoMenuDet?menu_id=" + this.nuevoRegistro.id_menu);
          const detallesExistentes = resDetallesExistentes.data || [];

          // Map para gestionar las actualizaciones y las creaciones de los detalles
          const promises = this.detalle.map(async (item) => {
            let resp;
            if (item.id_menu_det) {
              // Actualiza el detalle existente
              resp = await this.$api.put("/infoMenuDet/" + item.id_menu_det, item);
            } else {
              // Crea un nuevo detalle
              item.menu_id = this.nuevoRegistro.id_menu;
              resp = await this.$api.post("/infoMenuDet", item);
            }
            return resp?.data;
          });

          // Llama a Promise.allSettled para manejar todas las promesas
          const results = await Promise.allSettled(promises);

          // Maneja los resultados de las promesas
          results.forEach((result) => {
            if (result.status === "fulfilled") {
              if (result.value && result.value.success) {
                console.log("Detalle procesado correctamente");
              }
            } else {
              console.error("Hubo un error al procesar una promesa", result.reason);
            }
          });

          // Limpia los detalles existentes que no se actualizaron
          const idsDetallesNoActualizados = [];
          results.forEach((result, index) => {
            if (result.status !== "fulfilled" || !result.value.success) {
              idsDetallesNoActualizados.push(this.detalle[index].id_menu_det);
            }
          });

          idsDetallesNoActualizados.forEach(async (id) => {
            await this.$api.delete("/infoMenuDet/" + id);
          });

          // Cierra el diálogo, limpia el formulario y refresca la lista
          this.mostrarDialogo = false;
          this.limpiar();
          this.listar();

          this.$swal.fire({
            icon: "success",
            title: "Bien.. ✅",
            text: "Actualizado!",
          });
        }
      } catch (e) {
        console.log(e);
        // Manejo de errores
        const data = e.response;
        console.error("Error Response:", data);
        // Verifica si data está definido antes de acceder a sus propiedades
        this.$swal.fire({
          icon: "error",
          title: `Upss.. 😢 ${data?.status}`,
          text: `Algo salió mal: ${data?.data?.message}`,
        });
      }
    },

    async eliminar(item) {
      try {
        const response = await this.$api.delete(
          "/infoMenu/" + item.id_menu
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
          "/infoMenuDet/" + item.id_menu_det
        );
        const resp = response.data;
        if (resp.success === true) {
          this.limpiar();
          this.mostrarDialogo = false;
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
      this.detalle = [];
      this.nuevoRegistro = { nombre: "", descripcion: "" };
      this.nuevoDetalle = { platoId: "", productoId: "" };
    },
    async restaurar(item) {
      try {
        item.estado = "Activo";
        const response = await this.$api.put(`/infoMenu/${item.id_menu}`, item);
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
