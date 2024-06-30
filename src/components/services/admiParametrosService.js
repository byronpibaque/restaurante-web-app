const admiParametrosService = {
  getbyfilterCab: async (api, filter) => {
    try {
      const response = await api.post("/admiParametroCab/filter", filter);
      const resp = response.data;
      if (resp.success === true) {
        const res = await api.post("/admiParametroDet/filter", {
            parametro_cab_id: resp.data[0].id_parametro_cab,
            estado: "Activo",
        });
        const respuestaDet = res.data;
        if(respuestaDet){
            return respuestaDet.data;
        }
      }
    } catch (e) {
      return e.response;
    }
  }
};

export default admiParametrosService;
