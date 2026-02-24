import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// ✅ Rutas correctas a tus estilos
import "./assets/css/style.css";
import "./assets/css/historial_centro.css";
import "./assets/css/detalle.css";

createApp(App).use(router).mount("#app");
