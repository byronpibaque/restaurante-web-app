// api.js
import axios from 'axios';
const url = process.env.VITE_SERVER_URL;
const api = axios.create({
  baseURL: url,
});

const apiSocket =  url;

export {api,apiSocket};