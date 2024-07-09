const infoFacturaService = {
    getById: async (api, id) => {
        try {
            const response = await api.get("/infoFactura/" + id);
            const resp = response.data;
            if (resp.success === true) {
                return resp.data;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    getByFilter: async (api, params) => {
        try {
            const response = await api.post("/infoFactura/filter", params);
            const resp = response.data;
            if (resp.success === true) {
                return resp.data;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    insert: async (api, params) => {
        try {
            const response = await api.post("/infoFactura", params);
            const resp = response.data;
            if (resp.success === true) {
                return resp;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    update: async (api, id, params) => {
        try {
            const response = await api.put("/infoFactura/" + id, params);
            const resp = response.data;
            if (resp.success === true) {
                return resp;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    emitirFactura: async (api, params) => {
        try {
            const response = await api.post("/emitir", params);
            const resp = response.data;
            if (resp.success === true) {
                return resp;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    consultarFactura: async (api, params) => {
        try {
            const response = await api.post("/consultar", params);
            const resp = response.data;
            if (resp.success === true) {
                return resp;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
    eliminarFactura: async (api, params) => {
        try {
            const response = await api.post("/eliminar", params);
            const resp = response.data;
            if (resp.success === true) {
                return resp;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
};

export default infoFacturaService;
    