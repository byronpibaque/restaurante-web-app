// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:10000/',
});

const apiSocket =  'http://localhost:10000';

export {api,apiSocket};