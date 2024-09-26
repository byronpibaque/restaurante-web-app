<template>
  <div>
    <Dialog :header="headerTitle" v-model:visible="dialogVisible" @hide="closeDialog" class="responsive-dialog1">
      <div class="dialog-content">

        <span class="text-subtitle">Información de persona</span>
        <Divider />

        <AutoComplete :disabled="view" placeholder="Digite CI, RUC, PASS" id="tipo_documento"
          v-model="registro.tipo_documento" :suggestions="itemsDet" class="input-spacing" @complete="search" dropdown />
        <InputText :disabled="view" id="numero_identificacion" v-model="registro.numero_identificacion"
          placeholder="Número de Identificación" class="input-spacing" @blur="validaExistePersona()" />
        <InputText :disabled="view" id="nombre" v-model="registro.nombre" placeholder="Nombre"
        class="input-spacing" @input="updateFields" />
        <InputText :disabled="view" id="apellido" v-model="registro.apellido" placeholder="Apellido"
         @input="updateFields"
          class="input-spacing" />
        <InputText :disabled="view" id="nombre_pila" v-model="registro.nombre_pila" placeholder="Nombre de Pila"
          class="input-spacing"
          readonly />
        <InputText :disabled="view" id="direccion" v-model="registro.direccion" placeholder="Dirección"
          class="input-spacing" />
        <InputText :disabled="view" id="email" v-model="registro.email" placeholder="Email" class="input-spacing" />
        <InputText :disabled="view" id="celular" v-model="registro.celular" placeholder="Celular"
          class="input-spacing" />

        <div v-if="propietario">
          <span class="text-subtitle">Información de propietarios</span>
          <Divider />

          <InputText :disabled="view" id="razon_social" v-model="registro.razon_social" placeholder="Razon social"
            class="input-spacing"
            readonly
            />

        </div>

        <div v-if="cliente">
          <span class="text-subtitle">Información de clientes</span>
          <Divider />

          <InputText :disabled="view" id="razon_social_comprador" v-model="registro.razon_social_comprador" placeholder="Razon social"
            class="input-spacing"
            readonly />
        </div>

        <div v-if="proveedor">
          <span class="text-subtitle">Información de proveedores</span>
          <Divider />

          <InputText :disabled="view" id="razon_social_comprador" v-model="registro.razon_social_proveedor" placeholder="Razon social"
                     class="input-spacing"
                     readonly />
        </div>


        <div v-if="empleado">
          <span class="text-subtitle">Información de empleado</span>
          <Divider />
          <span class="text-body">Agrega Accesos</span>

          <Button class="p-button-rounded p-button-success buton-spacing" @click="agregarDetalle()"> <i
              class="pi pi-plus"></i>
          </Button>
          <AutoComplete :disabled="view" placeholder="Sucursales" id="sucursal" field="label"
            v-model="registro.accesos.sucursal" :suggestions="sucursales" class="input-spacing"
            @complete="searchSucursales" />
          <InputText :disabled="view" id="usuario" v-model="registro.accesos.usuario" placeholder="Usuario"
            class="input-spacing" />
          <InputText :disabled="view" id="password" v-model="registro.accesos.password" placeholder="Password"
            class="input-spacing" />
          <DataTable v-if="registro.accesos && registro.accesos.length > 0" :value="registro.accesos"
            class="responsive-datatable">
            <Column field="options" header="Options">
              <template #body="slotProps">
                <div class="option-buttons">
                  <Button icon="pi pi-pencil" class="boton-verde" @click="editarDetalle(slotProps.data)"></Button>
                  <Button icon="pi pi-trash" class="boton-rojo" @click="eliminarDetalle(slotProps.data)"></Button>
                </div>
              </template>
            </Column>
            <Column field="sucursal" header="Sucursal"></Column>
            <Column field="usuario" header="Usuario"></Column>
            <Column field="password" header="Password"></Column>
          </DataTable>
          <div v-else class="text-rojo">
            No existen accesos.
          </div>

        </div>
      </div>

      <div class="p-dialog-footer">
        <Button v-if="update" label="Actualizar" icon="pi pi-check" class="p-button-success"
          @click="actualizar"></Button>
        <Button v-if="!view && !update" label="Guardar" icon="pi pi-check" class="p-button-success"
          @click="agregar"></Button>
      </div>
    </Dialog>
  </div>
  <EspereDialog  ref="EspereDialog"></EspereDialog>

</template>

<script>
import DataTable from "primevue/datatable";
import Tooltip from "primevue/tooltip";
import Dialog from "primevue/dialog";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AutoComplete from "primevue/autocomplete";
import admiPersonaService from "@/components/services/admiPersonasService";
import admiParametrosService from "@/components/services/admiParametrosService";
import Divider from "primevue/divider";
import admiSucursalService from "@/components/services/admiSucursalesService";
import EspereDialog from "@/components/EspereDialog.vue";

export default {
  name: "AdmiPersonaDialog",
  components: {
    EspereDialog,
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
      default: "Nuevo Registro",
    },
  },
  data() {
    return {
      endpointPropietario: "/infoPropietario",
      endpointProveedor: "/infoProveedor",
      endpointCliente: "/infoCliente",
      endpointEmpleado: "/infoEmpleado",
      endpointAccesoEmpleado: "/infoAccesoEmpleado",
      dialogVisible: false,
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      propietario: false,
      proveedor: false,
      empleado: false,
      cliente: false,
      itemsDet: [],
      inputSearch: "",
      sucursales: [],
      exitePersonaBool:false,
    };
  },
  created() {
    this.getParametros();
    this.getSucursales();
  },
  methods: {
    async validaExistePersona(){
      try {
        if(this.registro.numero_identificacion){
          const params = { numero_identificacion: this.registro.numero_identificacion };
          const resPersona = await admiPersonaService.validaPersona(this.$api, params);
          if (resPersona.success !== false) {
            this.registro.id_persona = resPersona.id_persona;
            this.registro.tipo_documento = resPersona.tipo_documento;
            this.registro.numero_identificacion = resPersona.numero_identificacion;
            this.registro.nombre = resPersona.nombre;
            this.registro.apellido = resPersona.apellido;
            this.registro.nombre_pila = resPersona.nombre_pila;
            this.registro.direccion = resPersona.direccion;
            this.registro.email = resPersona.email;
            this.registro.celular = resPersona.celular;
            this.exitePersonaBool=true;
            this.registro.razon_social_comprador=resPersona.razon_social_comprador;
          }
        }
      }
      catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    updateFields() {
      const fullName = `${this.registro.nombre} ${this.registro.apellido}`;
      this.registro.razon_social = fullName;
      this.registro.nombre_pila = fullName;
      this.registro.razon_social_comprador = fullName;
      this.registro.razon_social_proveedor = fullName;
    },
    async searchSucursales(event) {
      try {
        const empleadoLogin = this.$store.state.empleado;
        const datasucursal = await admiSucursalService.getById(this.$api, empleadoLogin.sucursal_id);
        if (datasucursal) {
          const params = { estado: "Activo", restaurante_id: datasucursal.restaurante_id };
          const restSucursales = await admiSucursalService.getByFilter(this.$api, params);

          const filteredSucursales = restSucursales.filter(param =>
            param.nombre.toLowerCase().includes(event.query.toLowerCase())
          );

          this.sucursales = filteredSucursales.map(param => {
            return {
              label: param.nombre,
              value: param.id_sucursal
            };
          });
        }
      } catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    async getSucursales() {
      const empleadoLogin = this.$store.state.empleado;
      const datasucursal = await admiSucursalService.getById(this.$api, empleadoLogin.sucursal_id);
      if (datasucursal) {
        const params = { estado: "Activo", restaurante_id: datasucursal.restaurante_id };
        this.sucursales = await admiSucursalService.getByFilter(this.$api, params);
      }
    },
    async search(event) {
      try {
        const params = { descripcion: "tipo_documentos", estado: "Activo" };
        const resTipoDoc = await admiParametrosService.getbyfilterCab(this.$api, params);
        this.itemsDet = resTipoDoc.filter(param =>
          param.valor.toLowerCase().includes(event.query.toLowerCase()) ||
          param.clave.toLowerCase().includes(event.query.toLowerCase())
        ).map(param => param.valor);
      } catch (e) {
        console.error("Error al buscar sugerencias:", e);
      }
    },
    async getParametros() {
      try {
        const params = { descripcion: "tipo_documentos", estado: "Activo" };
        const resTipoDoc = await admiParametrosService.getbyfilterCab(this.$api, params);
        this.itemsDet = resTipoDoc.map(param => param.valor);
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
    async agregarDetalle() {
      if(this.update){
        this.registro.accesos.push({
        id_acceso_empleado: this.registro.accesos.id_acceso_empleado,
        empleado_id: this.registro.accesos.empleado_id,
        sucursal_id: this.registro.accesos.sucursal_id,
        sucursal: this.registro.accesos.sucursal,
        usuario: this.registro.accesos.usuario,
        password: this.registro.accesos.password,
        estado: "Activo",
        usuario_creacion: this.$store.state.empleado.usuario, 
        usuario_modificacion: this.$store.state.empleado.usuario 
      });
      }else{
        this.registro.accesos.push({
        id_acceso_empleado: this.registro.accesos.id_acceso_empleado,
        empleado_id: this.registro.accesos.empleado_id,
        sucursal_id: this.registro.accesos.sucursal.value,
        sucursal: this.registro.accesos.sucursal.label,
        usuario: this.registro.accesos.usuario,
        password: this.registro.accesos.password,
        estado: "Activo",
        usuario_creacion: this.$store.state.empleado.usuario, 
        usuario_modificacion: this.$store.state.empleado.usuario 
      });
      }
      

    },
    async agregar() {
      try {
        await this.showEsperaDialog();
        let bandera = false;
        this.registro.estado = "Activo";
        this.registro.usuario_creacion = this.$store.state.empleado.usuario;
        this.registro.usuario_modificacion = this.$store.state.empleado.usuario;
        let resCab = null;
    
        if (this.exitePersonaBool) {
          resCab = { data: { id_persona: this.registro.id_persona } };
        } else {
          resCab = await admiPersonaService.insert(this.$api, this.registro);
        }
    
        if (resCab.success === true || this.exitePersonaBool) {
          if (this.propietario) {
            this.registro.persona_id = resCab.data.id_persona;
            const resPropietario = await this.$api.post(`${this.endpointPropietario}/`, this.registro);
            const responsP = resPropietario.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.proveedor) {
            if (this.registro.tipo_documento === 'CI') {
              this.registro.tipoIdentificacionProveedor = '05';
            } else if (this.registro.tipo_documento === 'RUC') {
              this.registro.tipoIdentificacionProveedor = '04';
            } else if (this.registro.tipo_documento === 'PASS') {
              this.registro.tipoIdentificacionProveedor = '06';
            }
            this.registro.persona_id = resCab.data.id_persona;
            const resProveedor = await this.$api.post(`${this.endpointProveedor}/`, this.registro);
            const responsP = resProveedor.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.cliente) {
            if (this.registro.tipo_documento === 'CI') {
              this.registro.tipoIdentificacionComprador = '05';
            } else if (this.registro.tipo_documento === 'RUC') {
              this.registro.tipoIdentificacionComprador = '04';
            } else if (this.registro.tipo_documento === 'PASS') {
              this.registro.tipoIdentificacionComprador = '06';
            }
            this.registro.persona_id = resCab.data.id_persona;
            const resCliente = await this.$api.post(`${this.endpointCliente}/`, this.registro);
            const responsP = resCliente.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.empleado) {
            this.registro.persona_id = resCab.data.id_persona;
            // Primero creamos el empleado
            const resEmpleado = await this.$api.post(`${this.endpointEmpleado}/`, this.registro);
            const responseEmp = resEmpleado.data;
            if (responseEmp.success === true) {
              // Si se crea el empleado, creamos el acceso
              this.registro.accesos.empleado_id = responseEmp.data.id_empleado;
              const params = {
                empleado_id: responseEmp.data.id_empleado,
                sucursal_id: this.registro.accesos.sucursal.value,
                usuario: this.registro.accesos.usuario,
                password: this.registro.accesos.password,
                estado: "Activo",
                usuario_creacion: this.$store.state.empleado.usuario,
                usuario_modificacion: this.$store.state.empleado.usuario
              };
              const resAccesoEmp = await this.$api.post(`${this.endpointAccesoEmpleado}`, params);
              const responseAccEmp = resAccesoEmp.data;
              if (responseAccEmp.success === true) {
                bandera = true;
              }
            }
          }
          if (bandera) {
            await this.hideEsperaDialog();
            this.$emit("registro-agregado");
            this.closeDialog();
            this.$swal.fire({
              icon: "success",
              title: "Bien.. ✅",
              text: `Actualizado!`,
            });
          }
        }
      } catch (e) {
        await this.hideEsperaDialog();
        console.log(e);
        const data = e.response;
        this.$swal.fire({
          icon: "error",
          title: "Upss.. 😢" + data.status,
          text: `Algo salió mal: ${data.data}`,
        });
      }
    },
    editarDetalle(item) {
      this.registro.accesos.id_acceso_empleado = item.id_acceso_empleado;
      this.registro.accesos.empleado_id = item.empleado_id;
      this.registro.accesos.sucursal = item.sucursal;
      this.registro.accesos.sucursal_id = item.sucursal_id;
      this.registro.accesos.usuario = item.usuario;
      this.registro.accesos.password = item.password;

      const index = this.registro.accesos.findIndex(detalleItem => detalleItem === item);

      if (index !== -1) {
        this.registro.accesos.splice(index, 1);
      }

    },

    async actualizar() {
      try {
        await this.showEsperaDialog();
        let bandera = false;
        this.registro.estado = "Activo";
        this.registro.usuario_creacion = this.$store.state.empleado.usuario;
        this.registro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await admiPersonaService.update(
          this.$api,
          this.registro.id_persona,
          this.registro
        );
        const respuesta = resCab.data;
        if (resCab.success === true) {
          if (this.propietario) {
            const resPropietario = await this.$api.put(`${this.endpointPropietario}/${this.registro.id_propietario}`, this.registro);
            const responsP = resPropietario.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.proveedor) {
            if(this.registro.tipo_documento==='CI'){
              this.registro.tipoIdentificacionProveedor='05';
            }else if(this.registro.tipo_documento==='RUC'){
              this.registro.tipoIdentificacionProveedor='04';
            }else if(this.registro.tipo_documento==='PASS'){
              this.registro.tipoIdentificacionProveedor='06';
            }
            const resProveedor = await this.$api.put(`${this.endpointProveedor}/${this.registro.id_proveedor}`, this.registro);
            const responsP = resProveedor.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.cliente) {

            if(this.registro.tipo_documento==='CI'){
                this.registro.tipoIdentificacionComprador='05';
            }else if(this.registro.tipo_documento==='RUC'){
              this.registro.tipoIdentificacionComprador='04';
            }else if(this.registro.tipo_documento==='PASS'){
              this.registro.tipoIdentificacionComprador='06';
            }
            this.registro.persona_id=this.registro.id_persona;
            const resCliente = await this.$api.put(`${this.endpointCliente}/${this.registro.id_cliente}`, this.registro);
            const responsP = resCliente.data;
            if (responsP.success === true) {
              bandera = true;
            }
          }
          if (this.empleado) {
            this.registro.accesos.estado = "Activo";
            this.registro.accesos.usuario_creacion = this.$store.state.empleado.usuario;
            this.registro.accesos.usuario_modificacion = this.$store.state.empleado.usuario;
            this.registro.accesos.forEach(async acceso => {
              const responseEmpleadoUpdate = await this.$api.put(`${this.endpointAccesoEmpleado}/${acceso.id_acceso_empleado}`,acceso);
              const responseEmpUpt = responseEmpleadoUpdate.data;
              if (responseEmpUpt.success === true) {
                bandera = true;
              }
            });

          }
          if (bandera) {
            await this.hideEsperaDialog();
            this.$emit("registro-agregado");
            this.closeDialog();
            this.$swal.fire({
              icon: "success",
              title: "Bien.. ✅",
              text: `Actualizado!`,
            });
          }

        } else {
         await this.hideEsperaDialog();
          this.dialogVisible = false;
          this.$swal.fire({
            icon: "error",
            title: "Upss.. 😢",
            text: `Algo salió mal: ${respuesta}`,
          });
        }
      } catch (e) {
        const data = e.response;
        console.log(e);
        console.log("Error Response:", data);
        this.$swal.fire({
          icon: "error",
          title: `Upss.. 😢 ${data.status}`,
          text: `Algo salió mal: ${data?.data}`,
        });
      }
    },
    openDialog() {
      this.dialogVisible = true;
    },
    openDialogView() {
      this.dialogVisible = true;
      this.view = true;
    },
    openDialogUpdate() {
      this.dialogVisible = true;
      this.update = true;
    },
    openDialogPropietario() {
      this.dialogVisible = true;
      this.propietario = true;
    },
    openDialogViewPropietario() {
      this.dialogVisible = true;
      this.view = true;
      this.propietario = true;
    },
    openDialogUpdatePropietario() {
      this.dialogVisible = true;
      this.update = true;
      this.propietario = true;
    },
    openDialogProveedor() {
      this.dialogVisible = true;
      this.proveedor = true;
    },
    openDialogViewProveedor() {
      this.dialogVisible = true;
      this.view = true;
      this.proveedor = true;
    },
    openDialogUpdateProveedor() {
      this.dialogVisible = true;
      this.update = true;
      this.proveedor = true;
    },
    openDialogEmpleado() {
      this.dialogVisible = true;
      this.empleado = true;
    },
    openDialogViewEmpleado() {
      this.dialogVisible = true;
      this.view = true;
      this.empleado = true;
    },
    openDialogUpdateEmpleado() {
      this.dialogVisible = true;
      this.update = true;
      this.empleado = true;
    },
    openDialogCliente() {
      this.dialogVisible = true;
      this.cliente = true;
    },
    openDialogViewCliente() {
      this.dialogVisible = true;
      this.view = true;
      this.cliente = true;
    },
    openDialogUpdateCliente() {
      this.dialogVisible = true;
      this.update = true;
      this.cliente = true;
    },
    closeDialog() {
      this.dialogVisible = false;
      this.limpiar();
    },
    limpiar() {
      this.dialogHeader = "Nuevo Registro";
      this.view = false;
      this.update = false;
      this.registro.tipo_documento = "";
      this.registro.id_persona = "";
      this.registro.numero_identificacion = "";
      this.registro.nombre = "";
      this.registro.apellido = "";
      this.registro.nombre_pila = "";
      this.registro.direccion = "";
      this.registro.email = "";
      this.registro.celular = "+593";
      this.registro.estado = "";
      this.registro.usuario_creacion = "";
      this.registro.usuario_modificacion = "";
      if (this.propietario) {
        this.registro.id_propietario = "";
        this.registro.razon_social = "";
        this.propietario = false;
      }
      if (this.proveedor) {
        this.registro.id_proveedor = "";
        this.registro.razon_social = "";
        this.registro.tipoIdentificacionProveedor = "";
        this.proveedor = false;
      }
      if (this.empleado) {
        this.registro.id_empleado = "";
        this.sucursal
        this.registro.accesos = [];
      }
      if(this.cliente){
        this.registro.razon_social_comprador="";
        this.registro.tipoIdentificacionComprador="";
      }

    },
    async eliminarDetalle(item) {
      try {
        const response = await this.$api.delete(
          `${this.endpointAccesoEmpleado}/${item.id_acceso_empleado}`
        );
        const resp = response.data;
        if (resp.success === true) {
          const respAccesoEmpleado = await this.$api.post(`${this.endpointAccesoEmpleado}/filter`, { empleado_id: this.registro.id_empleado });
          if (respAccesoEmpleado) {
            const rest = respAccesoEmpleado.data;
            this.registro.accesos = rest.data;
          }
        }
      } catch (e) {
        const data = e.response;
        console.log(e.response);
      }
    },
    async showEsperaDialog() {
      if(this.$refs.EspereDialog){
        this.$refs.EspereDialog.show();
      }
    },
    async hideEsperaDialog() {
      if(this.$refs.EspereDialog){
        this.$refs.EspereDialog.hide();
      }
    }

  },
};
</script>
