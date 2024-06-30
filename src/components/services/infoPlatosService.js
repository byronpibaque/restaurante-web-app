const infoPlatoService = {
    getById: async (api,id) => {
      try {
        const response = await api.get("/infoPlato/"+id);
        const resp = response.data;
        if (resp.success === true) {
          return resp.data;
        }
      } catch (e) {
        const err = e.response;
        return err.data;
      }
    },
    getByFilter: async (api,params) => {
      try {
        const response = await api.post("/infoPlato/filter",params);
        const resp = response.data;
        if (resp.success === true) {
          return resp.data;
        }
      } catch (e) {
        const err = e.response;
        return err.data;
      }
    },
      insert: async (api,params) => {
        try {
          const response = await api.post("/infoPlato", params);
          const resp = response.data;
          if (resp.success === true) {
            return resp;
          }
        } catch (e) {
          const err = e.response;
          return err.data;
        }
      },
      update: async (api,id,params) => { try {
          const response = await api.put("/infoPlato/"+id, params);
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
    
    export default infoPlatoService;
    