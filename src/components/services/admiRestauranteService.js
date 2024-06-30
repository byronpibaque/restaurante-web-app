const admiRestauranteService = {
    getById: async (api,id) => {
      try {
        const response = await api.get("/admiRestaurante/"+id);
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
        const response = await api.post("/admiRestaurante/filter",params);
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
          const response = await api.post("/admiRestaurante", params);
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
          const response = await api.put("/admiRestaurante/"+id, params);
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
    
    export default admiRestauranteService;
    