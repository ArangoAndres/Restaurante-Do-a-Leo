import axios from "axios";

export const api = axios.create({
  baseURL:
    "https://restaurante-backend-restaurante.bswr1j.easypanel.host/api/redis",
  //"http://192.168.1.9:3000/api/redis",
});
