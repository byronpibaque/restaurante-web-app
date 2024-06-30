<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de sucursales</span>
    <div class="grid">
      <div  class="col-12 md:col-6 lg:col-3">
        <Button label="Nuevo" icon="pi pi-plus" style="margin: 1rem 1rem 1rem 1rem" class="p-button-primary"
        @click="mostrarDialogo = true"></Button>
      </div>
      <div  class="col-12 md:col-6 lg:col-3">
        <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar"></Button>
      </div>
      <div  class="col-12 md:col-6 lg:col-3">
        <InputText v-model="busquedaBHerramienta" class="" placeholder="Buscar:"
        @keyup="filtrar(busqueda)"></InputText>
      </div>
       <div  class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estado_sistema" class="w-2" placeholder="Filtra por estados:" v-model="estado_sistema"
        :suggestions="estados_sistemas" @complete="searchBHerramienta"
         @keypress.enter="listar(estado_sistema,restaurante)" />
       </div>
       <div  class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="restaurante" class="w-2" placeholder="Filtra por restaurante:" v-model="restaurante"
        :suggestions="restauranteArray" @complete="searchRestaurante"
         @keypress.enter="listar(estado_sistema,restaurante)" field="label"/>
       </div>
      
    </div>
    <Dialog :header="dialogHeader" v-model:visible="mostrarDialogo" @hide="limpiar" class="responsive-dialog1">
      <div class="dialog-content">
        <InputText :disabled="view" id="nombre" v-model="nuevoRegistro.nombre" placeholder="Nombre"
          class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputText :disabled="view" id="establecimiento" v-model="nuevoRegistro.establecimiento"
          placeholder="N. Establecimiento: 001" class="input-spacing" />
      </div>
      <div class="dialog-content">
        <InputText :disabled="view" id="direccion" v-model="nuevoRegistro.direccion" placeholder="Direccion"
          class="input-spacing" />
      </div>
      <div class="dialog-content" v-if="esAdminSistema">
        <AutoComplete id="restaurantes" :disabled="view" class="input-spacing" placeholder="Restaurante:"
          v-model="nuevoRegistro.restauranteId" :suggestions="restauranteArray" @complete="searchRestaurante"
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
            <Button icon="pi pi-eye" color="boton-azul" @click="ver(slotProps.data)"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" @click="eliminar(slotProps.data)"></Button>
          </div>
        </template>
      </Column>
      <Column field="nombre" header="Nombre"></Column>
      <Column field="establecimiento" header="Establecimiento"></Column>
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
import admiRestauranteService from "../services/admiRestauranteService";

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
    name: 'AdmiSucursal'
    return {
      endpoint: "/admiSucursal",
      endpointRestaurantes: "/admiRestaurante",
      mostrarDialogo: false,
      nuevoRegistro: {
        nombre: "",
        establecimiento: "001",
        direccion: "",
        restauranteId: "",
      },
      datos: [],
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      restauranteArray: [],
      sucursal_id: this.$store.state.empleado.sucursal_id,
      rolesAdmin: ['ADMINISTRADOR-SISTEMA', 'ADMINISTRADOR-RESTAURANTE'],
      busquedaBHerramienta: "",
      busqueda: "",
      estado_sistema: "",
      restaurante:"",
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
    this.getRestaurante();
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
    getDataUserSesion() {
      const roles = this.$store.state.roles;
      return roles;
    },
    async getRestauranteId() {
      try {
        const sucursal_id = this.sucursal_id;
        const sucursal = await admiSucursalService.getById(this.$api, sucursal_id);
        return sucursal.restaurante_id;
      } catch (e) {
        console.error("Error al obtener el restaurante_id:", e);
        return null;
      }
    },
    async searchRestaurante(event) {
      try {
        const response = await this.$api.get(`${this.endpointRestaurantes}`);
        const data = response.data;
        const filter = data.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.restauranteArray = filter.map(param => {
          return {
            label: param.nombre,
            value: param.id_restaurante
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
    async getRestaurante() {
      try {
        const response = await this.$api.get(`${this.endpointRestaurantes}`);
        const respuesta = response.data;
        if (respuesta.success === true) {
          this.restauranteArray = respuesta.data;
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
        let restaurante_id;
        if (!this.esAdminSistema) {
          restaurante_id = await this.getRestauranteId();
        } else {
          restaurante_id = await this.nuevoRegistro.restauranteId.value;
        }
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.restaurante_id = restaurante_id;
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
    async listar(filtro = "",restaurante="") {
      try {
        let params = {}
        let restaurante_id;
        if (!this.esAdminSistema) {
          restaurante_id = await this.getRestauranteId();
        }else{
          restaurante_id = restaurante.value;
        }
        params.restaurante_id=restaurante_id;

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
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data.data}`,
        });
      }
    },

    async ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.establecimiento = item.establecimiento;
      this.nuevoRegistro.direccion = item.direccion;
      this.nuevoRegistro.restauranteId = item.restaurante_id;
      const restaurante = await admiRestauranteService.getById(this.$api,item.restaurante_id);
      this.nuevoRegistro.restauranteId = restaurante.nombre;
      this.mostrarDialogo = true;
      this.view = true;
    },
    async editar(item) {
      this.dialogHeader = "Editar Registro";
      this.nuevoRegistro.id_sucursal = item.id_sucursal;
      this.nuevoRegistro.nombre = item.nombre;
      this.nuevoRegistro.establecimiento = item.establecimiento;
      this.nuevoRegistro.direccion = item.direccion;
      const restaurante = await admiRestauranteService.getById(this.$api,item.restaurante_id);
      this.nuevoRegistro.restauranteId = restaurante.nombre;      
      this.nuevoRegistro.restaurante_id = item.restaurante_id;      
      this.mostrarDialogo = true;
      this.update = true;
    },
    async actualizar() {
      try {
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        if(!this.nuevoRegistro.restaurante_id){
          this.nuevoRegistro.restaurante_id = this.nuevoRegistro.restauranteId.value
        }
        const resCab = await this.$api.put(`${this.endpoint}/${this.nuevoRegistro.id_sucursal}`,
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
        const response = await this.$api.delete(`${this.endpoint}/${item.id_sucursal}`);
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
      this.nuevoRegistro = { nombre: "", direccion: "", restauranteId: "",establecimiento:"" };
    },
  },
};
</script>
