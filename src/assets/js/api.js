import axios from "axios";

export const api = axios.create({
  baseURL:
    //"https://restaurante-backend-restaurante.bswr1j.easypanel.host/api/redis",
    "http://localhost:3000/api/redis",
});
