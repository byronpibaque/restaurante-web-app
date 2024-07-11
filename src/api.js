// api.js
import axios from 'axios';
const url = 'https://restapp-9ke7.onrender.com/';
const api = axios.create({
  baseURL: url,
});

const apiSocket =  url;

export {api,apiSocket};