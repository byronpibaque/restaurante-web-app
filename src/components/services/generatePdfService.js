const generaPdfService = {
    generatePdf: async (api,endponint,data) => {
        try {
            const response = await api.post("/generapdf/"+endponint,data);
            const resp = response.data;
            if (resp.success === true) {
                return resp.data;
            }
        } catch (e) {
            const err = e.response;
            return err.data;
        }
    },
};

export default generaPdfService;
