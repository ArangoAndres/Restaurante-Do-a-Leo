import axios from "axios";

export const api = axios.create({
  baseURL:
    "http://restaurante-backend-restaurante.bswr1j.easypanel.host/api/redis",
});
