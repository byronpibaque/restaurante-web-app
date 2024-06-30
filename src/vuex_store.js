import { createStore } from 'vuex';

export default createStore({
  state: { token: null, empleado: null, roles: [], cocinas: [], cajas: [], isAuthenticated: false },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('jwt', token);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem('jwt');
    },
    setEmpleado(state, empleado) {
      state.empleado = empleado;
      localStorage.setItem('empleado', JSON.stringify(empleado));
    },
    clearEmpleado(state) {
      state.empleado = null;
      localStorage.removeItem('empleado');
    },
    setRoles(state, roles) {
      state.roles = roles;
      localStorage.setItem('roles', JSON.stringify(roles));
    },
    clearRoles(state) {
      state.roles = [];
      localStorage.removeItem('roles');
    },
    setCocinas(state, cocinas) {
      state.cocinas = cocinas;
      localStorage.setItem('cocinas', JSON.stringify(cocinas));
    },
    clearCocinas(state) {
      state.cocinas = [];
      localStorage.removeItem('cocinas');
    },
    setCajas(state, cajas) {
      state.cajas = cajas;
      localStorage.setItem('cajas', JSON.stringify(cajas));
    },
    clearCajas(state) {
      state.cajas = [];
      localStorage.removeItem('cajas');
    },
    setAuthenticated(state, value) {
      localStorage.setItem('isAuthenticated', value);
      state.isAuthenticated = value;
    },
    clearAuthenticated(state) {
      localStorage.removeItem('isAuthenticated');
      state.isAuthenticated = false;
    },
  },
  actions: {
    loadToken({commit}){
      if(localStorage.getItem('jwt')){
        commit('setToken', localStorage.getItem('jwt'));
        commit('setEmpleado', JSON.parse(localStorage.getItem('empleado') || '{}'));
        commit('setRoles', JSON.parse(localStorage.getItem('roles') || '[]'));
        commit('setCocinas', JSON.parse(localStorage.getItem('cocinas') || '[]'));
        commit('setCajas', JSON.parse(localStorage.getItem('cajas') || '[]'));
        commit('setAuthenticated', true);
      }
    },
    saveToken({commit}, payload) {
      commit('setToken', payload.token);
      commit('setAuthenticated', true);
      commit('setEmpleado', payload.empleado);
      commit('setRoles', payload.roles);
      commit('setCocinas', payload.cocinas);
      commit('setCajas', payload.cajas);
    },
    removeToken({commit}) {
      commit('clearToken');
      commit('setAuthenticated', false);
      commit('clearEmpleado');
      commit('clearRoles');
      commit('clearCocinas');
      commit('clearCajas');
    },
  },
  getters: {
    token: state => state.token,
    empleado: state => state.empleado,
    roles: state => state.roles,
    cocinas: state => state.cocinas,
    cajas: state => state.cajas,
    isAuthenticated: state => state.isAuthenticated,
  },
});