<template>
  <div class="responsive-dialog">
    <span class="text-title">Arqueos de caja</span>
    <div class="barra-herramientas">
      <Button
        label="Refrescar"
        icon="pi pi-sync"
        class="p-button-success"
        @click="listar"
      ></Button>
      <div style="margin-left:10px" class="card">
        <Calendar v-model="dates" selectionMode="range" :manualInput="false" />
      </div>
      <div class="col-12 md:col-6 lg:col-3 xl:col-3">
        <AutoComplete id="estado_sistema" class="w-9" placeholder="Filtra por estados:" v-model="estado_sistema"
                      :suggestions="estados_sistemas" @complete="searchEstadosSistema"
                      dropdown/>
      </div>
      <Button icon="pi pi-search" severity="success" rounded aria-label="Search" @click="listar(estado_sistema,dates)" />

    </div>

    <Dialog
      :header="dialogHeader"
      v-model:visible="mostrarDialogo"
      @hide="limpiar"
      class="responsive-dialog1"
    >

      <div class="col-12">
        <AutoComplete id="tipo_movimiento" :disabled="view" class="w-9" placeholder="Tipo de movimiento:" v-model="tipo_movimiento"
                      :suggestions="tipo_movimientos" @complete="searchTipoMovimiento"
                      dropdown/>
      </div>
      <br>
      <div class="col-12">
        <AutoComplete :disabled="view" id="motivo_movimiento" class="w-9" placeholder="Motivo:" v-model="motivo_movimiento"
                      :suggestions="motivos_movimientos" @complete="searchMotivoMovimiento"
                      dropdown/>
      </div>

      <div class="dialog-content">
        <InputText
          :disabled="view"
          id="total"
          v-model="nuevoRegistro.total"
          placeholder="Total"
          class="input-spacing"
        />
      </div>
      <div class="p-dialog-footer">
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
            <Button v-if="slotProps.data.estado==='Activo'"
              icon="pi pi-check"
              class="boton-verde"
              v-tooltip="'Cerrar caja'"
              @click="cerrarCaja(slotProps.data)"
            ></Button>
            <Button v-if="slotProps.data.estado==='Finalizado'"  icon="pi pi-receipt" class="boton-azul"
                     @click="descargarComprobantePdf(slotProps.data)"
                     v-tooltip="'Descargar Reporte'"></Button>

          </div>
        </template>
      </Column>
      <Column field="total_caja" header="Total caja"></Column>
      <Column field="total_sistema" header="Total sistema"></Column>
      <Column field="fecha_creacion" header="Fecha">
        <template #body="slotProps">
          {{ formatFecha(slotProps.data.fecha_creacion) }}
        </template>
      </Column>
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
import Dropdown from 'primevue/dropdown';
import admiParametrosService from "@/components/services/admiParametrosService.js";
import moment from "moment";
import Calendar from 'primevue/calendar';
import infoArqueoCajaEmpleadoService from "@/components/services/infoArqueoCajaEmpleadoService.js";
import {api} from "@/api.js";
import generaPdfService from "@/components/services/generatePdfService.js";

export default {
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dialog,
    Tooltip,
    AutoComplete,
    Dropdown,
    Calendar
  },
  data() {
    return {
      mostrarDialogo: false,
      nuevoRegistro: {
        total: 0,
        tipo_movimiento: "",
        motivo: "",
      },
      datos: [],
      tipo_movimiento: "",
      tipo_movimientos: [],
      motivos_movimientos: [],
      motivo_movimiento:"",
      dialogHeader: "Nuevo Registro",
      view: false,
      update: false,
      estadoCaja:false,
      dates:null,
      estados_sistemas: [],
      estado_sistema: "",
    };
  },
  created() {
    this.listar();
    this.getTipoMovimiento();
    this.getMotivoMovimiento();
    this.comprobarEstadoCaja();
    this.getEstadosSistema();
  },
  methods: {
    async descargarComprobantePdf(data){
      console.log(data);
      const now = moment().format("YYYY-MM-DD");
      const paramsData = {
        fecha_creacion: data.fecha_creacion
      };
      const responseData = await this.$api.post("/infoArqueo/data",paramsData);
      const respuesta = responseData.data.data;
      if(respuesta) {
        const params = {
          "usuario": data.usuario_creacion,
          "fechaHora": now,
          "total": data.total_sistema,
          "totalIngreso": respuesta.totalIngreso,
          "totalFactura": respuesta.totalFactura,
          "totalEgreso": respuesta.totalEgreso,
          "detalles": [
            {
              "clave": "Total platos",
              "valor": respuesta.totalPlatos,
            },
            {
              "clave": "Total Productos",
              "valor": respuesta.totalProductos,
            },
            {
              "clave": "Total Menus",
              "valor": respuesta.totalMenu
            }
          ]
        };
        const response = await generaPdfService.generatePdf(this.$api, 'pdf-ticket-arqueo', params)
        if (response) {
          window.open(response, '_blank');
        }
      }
    },
    async obtenerRoles() {
      const roles = this.$store.state.roles;
      const listaRoles = [];
      roles.forEach((rol) => {
        listaRoles.push(rol.rol);
      });
      return listaRoles;
    },
    async comprobarEstadoCaja(){
      try {
        const empleado_caja = this.$store.state.cajas[0];
        const roles = await this.obtenerRoles();
        const rolesEsAdminOCaja = roles.map((rol) => {
          return rol === "ADMINISTRADOR-SISTEMA" || rol === "ADMINISTRADOR-RESTAURANTE"|| rol === "CAJERO";
        });
        if(empleado_caja && rolesEsAdminOCaja ){
          const response = await infoArqueoCajaEmpleadoService.getByIdCajaEmpleado(api, empleado_caja.id_empleado_caja);
          if(response.id_arqueo_caja){
            if(response.estado==='Activo'){
              this.estadoCaja=true;
            }else if(response.estado==='Finalizado'){
              this.estadoCaja=false;
              this.$swal.fire({
                icon: "warning",
                title: "Ups 😢",
                text: `El arqueo de caja esta cerrado, no se pueden realizar mas acciones.`,
              });
            }
          }else{
            console.log(response);
          }
        }else{
          this.estadoCaja=true;
        }
      }
      catch (e){
        console.error(e);
      }
    },
    async cerrarCajaData(data) {
      try {
        const resCab = await this.$api.put(
            "/infoArqueo/" + data.id_arqueo_caja,
            data
        );
        const respuesta = resCab.data;
        return respuesta;
      } catch (error) {
        return { error: error.message };
      }
    },
    cerrarCaja(data){
      this.$swal.fire({
        title: "Ingresa el total de tu caja",
        input: "number",
        inputAttributes: {
          step: "0.01",
          autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Cerrar caja",
        showLoaderOnConfirm: true,
        preConfirm: async (total) => {
          try {
            data.total_caja = total;
            data.estado='Finalizado';
            data.usuario_creacion = this.$store.state.empleado.usuario;
            data.usuario_modificacion = this.$store.state.empleado.usuario;

            const response = await this.cerrarCajaData(data);

            if (response.error) {
              return this.$swal.showValidationMessage(`
                Error: ${response.error}
                `);
            }
          } catch (error) {
            this.$swal.showValidationMessage(`
               Request failed: ${error}
            `);
          }
        },
        allowOutsideClick: () => !this.$swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          this.$swal.fire({
            title: "Register closed successfully",
            text: `Actualizado!`,
            icon: "success"
          });
          this.reloadPage();
        }
      });
    },
    reloadPage() {
      window.location.reload();
    },
    async agregar() {
      try {
        const empleado_caja = this.$store.state.cajas[0];

        this.nuevoRegistro.empleado_caja_id = empleado_caja.id_empleado_caja;
        this.nuevoRegistro.motivo = this.motivo_movimiento
        this.nuevoRegistro.tipo_movimiento = this.tipo_movimiento;
        this.nuevoRegistro.estado = "Activo";
        this.nuevoRegistro.usuario_creacion = this.$store.state.empleado.usuario;
        this.nuevoRegistro.usuario_modificacion = this.$store.state.empleado.usuario;
        const resCab = await this.$api.post("/infoArqueo", this.nuevoRegistro);
        const respuesta = resCab.data;
        if (respuesta.success === true) {
          this.mostrarDialogo = false;
          this.limpiar();
          this.reloadPage();
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

    async listar(estado = "",dates = null) {
      try {
        const empleado_caja = this.$store.state.cajas[0];
        let params = {
          empleado_id: empleado_caja.id_empleado_caja,
          estado: estado || "Activo"
        };
        if (dates && dates.length > 0) {
          let fechaInicial = this.formatFecha(dates[0]);
          let fechaFinal = dates.length > 1 ? this.formatFecha(dates[1]) : fechaInicial;

          params.fecha_inicio = fechaInicial;
          params.fecha_fin = fechaFinal;
        } else {
          let fechaActual = moment().format("YYYY-MM-DD");
          params.fecha_inicio = fechaActual;
          params.fecha_fin = fechaActual;
        }

        const response = await this.$api.post("/infoArqueo/filter",params);
        const resp = response.data;
        if (resp.success === true) {
          this.datos = resp.data;
        }
      } catch (e) {
        console.log(e.response);
      }
    },

    ver(item) {
      this.dialogHeader = "Ver Registro";
      this.nuevoRegistro.total = item.total;
      this.motivo_movimiento = item.motivo;
      this.tipo_movimiento = item.tipo_movimiento;
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
          "/infoArqueo/" + this.nuevoRegistro.id_forma_pago,
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
        const response = await this.$api.delete("/infoArqueo/" + item.id_movimiento);
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
      this.nuevoRegistro = { total: 0, tipo_movimiento: "",motivo: "" };
      this.tipo_movimiento="";
      this.motivo_movimiento="";
    },
    async searchTipoMovimiento(event) {
      try {
        const params = {descripcion: "tipo_movimientos", estado: "Activo"};
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
        this.tipo_movimientos = data.filter(param =>
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
    async getTipoMovimiento() {
      try {
        const params = {descripcion: "tipo_movimientos", estado: "Activo"};
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
        if (respuesta.success === true) {
          this.tipo_movimientos = respuesta.data;
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
    async searchMotivoMovimiento(event) {
      try {
        const params = {descripcion: "motivos_movimientos", estado: "Activo"};
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
        this.motivos_movimientos = data.filter(param =>
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
    async getMotivoMovimiento() {
      try {
        const params = {descripcion: "motivos_movimientos", estado: "Activo"};
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
        if (respuesta.success === true) {
          this.motivos_movimientos = respuesta.data;
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
    formatFecha(fecha) {
      const momentFecha = moment(fecha).utc();
      if (momentFecha.isValid()) {
        return momentFecha.format("YYYY-MM-DD");
      } else {
        return 'Fecha inválida';
      }
    },
    async searchEstadosSistema(event) {
      try {
        const params = {descripcion: "estados_sistemas", estado: "Activo"};
        const data = await admiParametrosService.getbyfilterCab(this.$api, params)
        this.estados_sistemas = data.filter(param =>
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
    async getEstadosSistema() {
      try {
        const params = {descripcion: "estados_sistemas", estado: "Activo"};
        const respuesta = await admiParametrosService.getbyfilterCab(this.$api, params)
        if (respuesta.success === true) {
          this.estados_sistemas = respuesta.data;
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
  },
};
</script>
