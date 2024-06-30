export const infoEmpleadoGetById = async (api,id) => {
try {
    const response = await api.get('/infoEmpleado/'+id);
    const resp = response.data;
    if(resp.success===true){
        return resp;
    }
}catch (e) {
    const err = e.response
    return err.data;
}
}