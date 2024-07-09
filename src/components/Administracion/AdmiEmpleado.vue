<template>
  <div class="responsive-dialog">
    <span class="text-title">Administración de usuarios</span>
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Nuevo" icon="pi pi-plus" class="p-button-primary" @click="openPersonaDialog"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Button label="Refrescar" icon="pi pi-sync" class="p-button-success" @click="listar()"></Button>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <InputText v-model="busquedaBHerramienta" class="" placeholder="Buscar:" @keyup="filtrar(busqueda)"></InputText>
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estado_sistema" class="w-2" placeholder="Filtra por estados:" v-model="estado_sistema"
          :suggestions="estados_sistemas" @complete="searchBHerramienta" @keypress.enter="listar(estado_sistema)" />
      </div>

    </div>

    <div>
      <AdmiPersonaDialog :registro="nuevoRegistro" :headerTitle="dialogHeader" @registro-agregado="listar"
        ref="AdmiPersonaDialog"></AdmiPersonaDialog>
    </div>
    <div>
      <Dialog :header="dialogHeaderRoles" v-model:visible="mostrarDialogoRoles" @hide="limpiarRoles"
        class="responsive-dialog1">
        <div class="dialog-content">
          <InputText disabled id="usuario" v-model="rolesReg.nombre_pila" placeholder="Usuario" class="input-spacing" />
        </div>
        <Divider />
        <div class="col-12 md:col-6 lg:col-3 xl:col-3" v-if="editarRoles || nuevoRol">
          <Button class="p-button-rounded p-button-success buton-spacing" @click="agregarRoles()"> <i
              class="pi pi-plus"></i>
          </Button>
          <AutoComplete id="roles" class="w-2" placeholder="Roles:" v-model="rolesReg.rol" :suggestions="admiRoles"
            @complete="searchRoles" field="label" />
        </div>
        <div>
          <DataTable :value="datosRoles" class="responsive-datatable">
            <Column field="options" header="Options" v-if="!nuevoRol">
              <template #body="slotProps">
                <div class="option-buttons" v-if="update">
                  <Button icon="pi pi-pencil" class="boton-verde" @click="editarRolesEmpleado(slotProps.data)"
                    v-tooltip="'Editar'"></Button>
                  <Button icon="pi pi-trash" class="boton-rojo" @click="eliminarRolesEmpleado(slotProps.data)"
                    v-tooltip="'Eliminar'"></Button>
                </div>
              </template>
            </Column>
            <Column field="rol" header="Rol"></Column>
            <Column field="estado" header="Estado"></Column>
          </DataTable>
        </div>
        <div class="p-dialog-footer">
          <Button v-if="update" label="Actualizar" icon="pi pi-check" class="p-button-success"
            @click="actualizarRolesEmpleado"></Button>
          <Button v-if="!view && !update" label="Guardar" icon="pi pi-check" class="p-button-success"
            @click="agregarRolesEmpleado"></Button>
            <Button label="Cancelar" icon="pi pi-times" class="boton-rojo"
            @click="cancelarRoles"></Button>
        </div>
      </Dialog>
      <Dialog :header="dialogHeaderCajas" v-model:visible="mostrarDialogoCajas" @hide="limpiarCajas()"
              class="responsive-dialog1">
        <div class="dialog-content">
          <InputText disabled id="usuario" v-model="cajasReg.nombre_pila" placeholder="Usuario" class="input-spacing" />
        </div>
        <Divider />
        <div class="col-12 md:col-12 lg:col-12 xl:col-12" v-if="editarCajas|| nuevaCaja">
          <Button class="p-button-rounded p-button-success buton-spacing" @click="agregarCajas()"> <i
              class="pi pi-plus"></i>
          </Button>
          <AutoComplete id="cajas" placeholder="Cajas:" v-model="cajasReg.caja" :suggestions="admiCajas"
                          @complete="searchCajas" field="label"
                          dropdown
            />
        </div>
        <div>
          <DataTable :value="datosCajas" class="responsive-datatable">
            <Column field="options" header="Options" v-if="!nuevaCaja">
              <template #body="slotProps">
                <div class="option-buttons" v-if="update">
                  <Button icon="pi pi-pencil" class="boton-verde" @click="editarCajasEmpleado(slotProps.data)"
                          v-tooltip="'Editar'"></Button>
                  <Button icon="pi pi-trash" class="boton-rojo" @click="eliminarCajasEmpleado(slotProps.data)"
                          v-tooltip="'Eliminar'"></Button>
                </div>
              </template>
            </Column>
            <Column field="nombre" header="Caja"></Column>
            <Column field="estado" header="Estado"></Column>
          </DataTable>
        </div>
        <div class="p-dialog-footer">
          <Button v-if="update" label="Actualizar" icon="pi pi-check" class="p-button-success"
                  @click="actualizarCajasEmpleado"></Button>
          <Button v-if="!view && !update" label="Guardar" icon="pi pi-check" class="p-button-success"
                  @click="agregarCajasEmpleado"></Button>
          <Button label="Cancelar" icon="pi pi-times" class="boton-rojo"
                  @click="cancelarCajas"></Button>
        </div>
      </Dialog>
    </div>

    <DataTable :value="datos" class="responsive-datatable">
      <Column field="options" header="Options">
        <template #body="slotProps">
          <div class="option-buttons">
            <Button icon="pi pi-eye" color="boton-azul" @click="ver(slotProps.data)" v-tooltip="'Ver'"></Button>
            <Button icon="pi pi-pencil" class="boton-verde" @click="editar(slotProps.data)"
              v-tooltip="'Editar'"></Button>
            <Button icon="pi pi-id-card" class="boton-naranja" @click="roles(slotProps.data)"
              v-tooltip="'Editar roles'"></Button>
            <Button icon="pi pi-id-card" class="boton-azul" @click="NuevosRoles(slotProps.data)"
              v-tooltip="'Nuevos roles'"></Button>
            <Button icon="fas fa-cash-register" class="boton-verde" @click="NuevosCajas(slotProps.data)"
                    v-tooltip="'Asignar caja'"></Button>
            <Button icon="pi pi-trash" class="boton-rojo" @click="eliminar(slotProps.data)"
              v-tooltip="'Eliminar'"></Button>
            <Button v-if="slotProps.data.estado === 'Eliminado'" icon="pi pi-history" class="boton-naranja"
              @click="restaurar(slotProps.data)" v-tooltip="'Restaurar'"></Button>
          </div>
        </template>
      </Column>
      <Column field="numero_identificacion" header="N. Identificación"></Column>
      <Column field="nombre_pila" header="Usuario"></Column>
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
import admiPersonaService from "../services/admiPersonasService";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";

export default {
  name: "AdmiEmpleado",
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
    AdmiPersonaDialog,
    AutoComplete,
    Divider,
    Dropdown
  },
  data() {
    return {
      mostrarDialogoRoles: false,
      mostrarDialogoCajas: false,
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
        id_empleado: "",
        estado: "",
        usuario_creacion: "",
        usuario_modificacion: "",
        accesos: [],
      },
      datos: [],
      datosRoles: [],
      datosCajas: [],
      dialogHeader: "Nuevo Registro",
      dialogHeaderRoles: "Editar roles",
      dialogHeaderCajas: "Editar cajas",
      endpoint: "/infoEmpleado",
      endpointAcceso: "/infoAccesoEmpleado",
      endpointRolEmp: "/infoRolEmpleado",
      endpointCajaEmp: "/infoEmpleadoCaja",
      endpointRol: "/admiRol",
      endpointCaja: "/infoCaja",
      view: false,
      update: false,
      busqueda: "",
      busquedaBHerramienta: "",
      estado_sistema: "",
      estados_sistemas: [],
      rolesReg: {
        nombre: "",
        rol: "",
        id_rol: "",
        id_empleado: ""
      },
      cajasReg: {
        nombre: "",
        caja: "",
        id_caja: "",
        id_empleado: ""
      },
      admiRoles: [],
      admiCajas: [],
      editarRoles: false,
      editarCajas: false,
      nuevoRol: false,
      nuevaCaja: false,
    };
  },
  created() {
    this.listar();
    this.getParametros();
    this.getRoles();
    this.getCajas();
  },
  methods: {
    cancelarRoles(){
      this.mostrarDialogoRoles=false;
      this.limpiarRoles()
    },
    cancelarCajas(){
      this.mostrarDialogoCajas=false;
      this.limpiarCajas()
    },
    editarRolesEmpleado(item) {
      this.editarRoles = true;
      this.rolesReg = item
      const index = this.datosRoles.findIndex(detalleItem => detalleItem === item);
      if (index !== -1) {
        this.datosRoles.splice(index, 1);
      }
    },
    editarCajasEmpleado(item) {
      this.editarCajas = true;
      this.cajasReg = item
      const index = this.datosCajas.findIndex(detalleItem => detalleItem === item);
      if (index !== -1) {
        this.datosCajas.splice(index, 1);
      }
    },
    async eliminarRolesEmpleado(item) {
      try {
        const response = await this.$api.delete(`${this.endpointRolEmp}/${item.id_rol_empleado}`);
        const resp = response.data;
        if (resp.success === true) {
          this.mostrarDialogoRoles = false;
          this.$swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "Registro eliminado exitosamente!",
            timer: 2000
          });
          this.limpiarRoles();
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
    async eliminarCajasEmpleado(item) {
      try {
        const response = await this.$api.delete(`${this.endpointCajaEmp}/${item.id_caja_empleado}`);
        const resp = response.data;
        if (resp.success === true) {
          this.mostrarDialogoCajas = false;
          this.$swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "Registro eliminado exitosamente!",
            timer: 2000
          });
          this.limpiarCajas();
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
    async actualizarRolesEmpleado() {
      try {
        let bandera = false;
        for (const element of this.datosRoles) {
          let params = {
            estado: 'Activo',
            usuario_creacion: 'Administrador',
            usuario_modificacion: 'Administrador',
            rol_id: element.rol_id,
            empleado_id: this.rolesReg.empleado_id
          };
          const resEditRolesEmpleados = await this.$api.put(`${this.endpointRolEmp}/${this.rolesReg.id_rol_empleado}`, params);
          const respuesta = resEditRolesEmpleados.data;
          if (respuesta.success === true) {
            bandera = true;
          }
        }
        if (bandera) {
          this.mostrarDialogoRoles = false;
          this.$swal.fire({
            icon: "success",
            title: "¡Bien! ✅",
            text: "¡Roles actualizados!"
          });
          this.limpiarRoles();
        }
      } catch (error) {
        console.log(error.response);
      }
    },
    async actualizarCajasEmpleado() {
      try {
        let bandera = false;
        for (const element of this.datosCajas) {
          let params = {
            estado: 'Activo',
            usuario_creacion: 'Administrador',
            usuario_modificacion: 'Administrador',
            caja_id: element.caja_id,
            empleado_id: this.cajasReg.empleado_id
          };
          const resEditRolesEmpleados = await this.$api.put(`${this.endpointCajaEmp}/${this.cajasReg.id_caja_empleado}`, params);
          const respuesta = resEditRolesEmpleados.data;
          if (respuesta.success === true) {
            bandera = true;
          }
        }
        if (bandera) {
          this.mostrarDialogoCajas = false;
          this.$swal.fire({
            icon: "success",
            title: "¡Bien! ✅",
            text: "¡Roles actualizados!"
          });
          this.limpiarCajas();
        }
      } catch (error) {
        console.log(error.response);
      }
    },
    async agregarRolesEmpleado() {
      try {
        let bandera = false;

        for (const element of this.datosRoles) {
          if (!element.id_rol_empleado) {
            const params = {
              empleado_id: this.rolesReg.id_empleado,
              rol_id: element.rol_id,
              estado: 'Activo',
              usuario_creacion: this.$store.state.empleado.usuario,
              usuario_modificacion: this.$store.state.empleado.usuario
            };
            const resAgregarRolesEmpleado = await this.$api.post(`${this.endpointRolEmp}`, params);
            const respuesta = resAgregarRolesEmpleado.data;
            if (respuesta.success === true) {
              bandera = true;
            }
          }
        }
        if (bandera === true) {
          this.mostrarDialogoRoles = false;
          this.limpiarRoles();
          this.$swal.fire({
            icon: "success",
            title: "Bien.. ✅",
            text: `Roles actualizados!`,
          });
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
    async agregarCajasEmpleado() {
      try {
        let bandera = false;

        for (const element of this.datosCajas) {
          if (!element.id_caja_empleado) {
            const params = {
              empleado_id: this.cajasReg.id_empleado,
              caja_id: element.caja_id,
              estado: 'Activo',
              usuario_creacion: this.$store.state.empleado.usuario,
              usuario_modificacion: this.$store.state.empleado.usuario
            };
            const resAgregarRolesEmpleado = await this.$api.post(`${this.endpointCajaEmp}`, params);
            const respuesta = resAgregarRolesEmpleado.data;
            if (respuesta.success === true) {
              bandera = true;
            }
          }
        }
        if (bandera === true) {
          this.mostrarDialogoCajas = false;
          this.limpiarCajas();
          this.$swal.fire({
            icon: "success",
            title: "Bien.. ✅",
            text: `Roles actualizados!`,
          });
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
    NuevosCajas(item) {
      this.nuevaCaja = true;
      this.getCajasEmpleado(item.id_empleado);
      this.cajasReg = item;
      this.mostrarDialogoCajas = true;
    },
    agregarCajas() {
      if (this.cajasReg.caja.value) {
        this.datosCajas.push({
          caja: this.cajasReg.caja.label,
          caja_id: this.cajasReg.caja.value,
          estado: 'Activo'
        })
      } else {
        this.datosCajas.push({
          caja: this.cajasReg.caja,
          caja_id: this.cajasReg.caja,
          estado: 'Activo'
        })
      }
      if (this.editarCajas) {
        this.editarCajas = false;
      }
    },
    async searchCajas(event) {
      try {
        const resAdmiRoles = await this.$api.get(`${this.endpointCaja}`);
        const rol = resAdmiRoles.data;
        const filteredRoles = rol.data.filter(param =>
            param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.admiCajas = filteredRoles.map(param => {
          return {
            label: param.nombre,
            value: param.id_caja
          };
        });
      } catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    async getCajas() {
      try {
        const resAdmiRoles = await this.$api.get(`${this.endpointCaja}`);
        const respuesta = resAdmiRoles.data;
        if (respuesta.success === true) {
          this.admiCajas = respuesta.data;
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
    NuevosRoles(item) {
      this.nuevoRol = true;
      this.getRolesEmpleado(item.id_empleado);
      this.rolesReg = item;
      this.mostrarDialogoRoles = true;
    },
    agregarRoles() {
      if (this.rolesReg.rol.value) {
        this.datosRoles.push({
          rol: this.rolesReg.rol.label,
          rol_id: this.rolesReg.rol.value,
          estado: 'Activo'
        })
      } else {
        this.datosRoles.push({
          rol: this.rolesReg.rol,
          rol_id: this.rolesReg.rol_id,
          estado: 'Activo'
        })
      }
      if (this.editarRoles) {
        this.editarRoles = false;
      }
    },
    async searchRoles(event) {
      try {
        const resAdmiRoles = await this.$api.get(`${this.endpointRol}`);
        const rol = resAdmiRoles.data;
        const filteredRoles = rol.data.filter(param =>
          param.nombre.toLowerCase().includes(event.query.toLowerCase())
        );
        this.admiRoles = filteredRoles.map(param => {
          return {
            label: param.nombre,
            value: param.id_rol
          };
        });
      } catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    async getRoles() {
      try {
        const resAdmiRoles = await this.$api.get(`${this.endpointRol}`);
        const respuesta = resAdmiRoles.data;
        if (respuesta.success === true) {
          this.admiRoles = respuesta.data;
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
    roles(item) {
      this.update = true;
      this.getRolesEmpleado(item.id_empleado);
      this.rolesReg.nombre_pila = item.nombre_pila
      this.rolesReg.id_empleado = item.id_empleado;
      this.mostrarDialogoRoles = true;
    },
    async getRolesEmpleado(strIdEmpleado) {
      try {
        const params = {
          empleado_id: strIdEmpleado,
          estado: 'Activo'
        }
        const resRolesEmpleado = await this.$api.post(`${this.endpointRolEmp}/filter`, params);
        const respuesta = resRolesEmpleado.data;
        if (respuesta.success === true) {
          this.datosRoles = respuesta.data;
        }
      } catch (error) {
        this.update = false;
        console.log(error.response);
      }
    },
    async getCajasEmpleado(strIdEmpleado) {
      try {
        const params = {
          empleado_id: strIdEmpleado,
          estado: 'Activo'
        }
        const resRolesEmpleado = await this.$api.post(`${this.endpointCajaEmp}/filter`, params);
        const respuesta = resRolesEmpleado.data;
        if (respuesta.success === true) {
          for (const respuestaElement of respuesta.data) {
            const respuestaCaja = await this.$api.get(`${this.endpointCaja}/${respuestaElement.caja_id}`);
            const data = respuestaCaja.data.data;
            const cajas = {
              id_caja : respuestaElement.caja_id,
              nombre: data.nombre,
              estado: respuestaElement.estado,
            };
            this.datosCajas.push(cajas);
          }
        }
      } catch (error) {
        this.update = false;
        console.log(error);
      }
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
    openPersonaDialog() {
      this.$refs.AdmiPersonaDialog.openDialogEmpleado();
    },
    async listar(filtro = "") {
      try {
        let params = {}
        if (!filtro) {
          params.estado = 'Activo'
        } else {
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
    async ver(item) {
      this.dialogHeader = "Ver Registro";
      const dataPersona = await admiPersonaService.getById(this.$api, item.persona_id);
      if (dataPersona) {
        this.nuevoRegistro.tipo_documento = dataPersona.tipo_documento;
        this.nuevoRegistro.numero_identificacion = dataPersona.numero_identificacion;
        this.nuevoRegistro.nombre = dataPersona.nombre;
        this.nuevoRegistro.apellido = dataPersona.apellido;
        this.nuevoRegistro.nombre_pila = dataPersona.nombre_pila;
        this.nuevoRegistro.direccion = dataPersona.direccion;
        this.nuevoRegistro.email = dataPersona.email;
        this.nuevoRegistro.celular = dataPersona.celular;
        this.nuevoRegistro.estado = dataPersona.estado;
        this.nuevoRegistro.usuario_creacion = dataPersona.usuario_creacion;
        this.nuevoRegistro.usuario_modificacion = dataPersona.usuario_modificacion;
        this.nuevoRegistro.id_persona = item.persona_id;
      }
      try {
        const respAccesoEmpleado = await this.$api.post(`${this.endpointAcceso}/filter`, { empleado_id: item.id_empleado });
        if (respAccesoEmpleado) {
          const dataAcceso = respAccesoEmpleado.data;
          if (dataAcceso.success === true) {
            this.nuevoRegistro.accesos = dataAcceso.data;
          }
        }
      } catch (error) {

      }
      this.$refs.AdmiPersonaDialog.openDialogViewEmpleado();
    },
    async editar(item) {
      this.dialogHeader = "Editar Registro";
      const dataPersona = await admiPersonaService.getById(this.$api, item.persona_id);
      if (dataPersona) {
        this.nuevoRegistro.tipo_documento = dataPersona.tipo_documento;
        this.nuevoRegistro.numero_identificacion = dataPersona.numero_identificacion;
        this.nuevoRegistro.nombre = dataPersona.nombre;
        this.nuevoRegistro.apellido = dataPersona.apellido;
        this.nuevoRegistro.nombre_pila = dataPersona.nombre_pila;
        this.nuevoRegistro.direccion = dataPersona.direccion;
        this.nuevoRegistro.email = dataPersona.email;
        this.nuevoRegistro.celular = dataPersona.celular;
        this.nuevoRegistro.estado = dataPersona.estado;
        this.nuevoRegistro.usuario_creacion = dataPersona.usuario_creacion;
        this.nuevoRegistro.usuario_modificacion = dataPersona.usuario_modificacion;
        this.nuevoRegistro.id_persona = item.persona_id;
        this.nuevoRegistro.id_empleado = item.id_empleado;
      }
      try {
        const respAccesoEmpleado = await this.$api.post(`${this.endpointAcceso}/filter`, { empleado_id: item.id_empleado });
        if (respAccesoEmpleado) {
          const dataAcceso = respAccesoEmpleado.data;
          if (dataAcceso.success === true) {
            this.nuevoRegistro.accesos = dataAcceso.data;
          }
        }
      } catch (error) {

      }
      this.$refs.AdmiPersonaDialog.openDialogUpdateEmpleado();
    },
    async eliminar(item) {
      try {
        const response = await this.$api.delete(`${this.endpoint}/${item.id_empleado}`);
        const resp = response.data;
        if (resp.success === true) {
          this.$swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "Registro eliminado exitosamente!",
            timer: 2000
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
    async restaurar(item) {
      try {
        item.estado = "Activo";
        const response = await this.$api.put(`${this.endpoint}/${item.id_empleado}`, item);
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
    limpiar() {
      this.dialogHeader = "Nuevo Registro";
      this.nuevoRegistro = {
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
        id_empleado: ""
      };
    },
    limpiarRoles() {
      this.editarRoles = false;
      this.datosRoles = [];
      this.update = false;
      this.view = false;
      this.nuevoRol = false;
      this.rolesReg = {};
    },
    limpiarCajas() {
      this.editarCajas = false;
      this.datosCajas = [];
      this.update = false;
      this.view = false;
      this.nuevaCaja = false;
      this.cajasReg = {};
    }
  },
};
</script>
