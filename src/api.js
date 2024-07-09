// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://restapp-9ke7.onrender.com/',
});

const apiSocket =  'https://restapp-9ke7.onrender.com';

export {api,apiSocket};