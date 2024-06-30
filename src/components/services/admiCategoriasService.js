const admiCategoriaService = {
    getById: async (api,id) => {
      try {
        const response = await api.get("/admiCategoria/"+id);
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
        const response = await api.post("/admiCategoria/filter",params);
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
          const response = await api.post("/admiCategoria", params);
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
          const response = await api.put("/admiCategoria/"+id, params);
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
    
    export default admiCategoriaService;
    