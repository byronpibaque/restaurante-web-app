const  changePassword = async (api,acceso, params) => {
    try {
        const data = {
            acceso,
            params
        };
        const response = await api.post('/infoAccesoEmpleado/changePassword', data);
        const resp = response.data;
        if(resp.success===true){
            return resp;
        }
    }catch (e) {
        const err = e.response
        return err.data;
    }
}

const changePasswordByCi = async (api,params)=>{
    try {
        const response = await api.post('/infoAccesoEmpleado/changePasswordByCi', params);
        const resp = response.data;
        if(resp.success===true){
            return resp;
        }
    }catch (e) {
        const err = e.response
        return err.data;
    }  
}

export default {changePassword,changePasswordByCi};