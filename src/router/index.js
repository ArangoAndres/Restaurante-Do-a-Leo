import { createRouter, createWebHistory } from "vue-router";
import PedidosView from "../views/PedidosView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: PedidosView },
    {
      path: "/historial-bolivar",
      component: () => import("../views/HistorialBolivar.vue"),
    },
    {
      path: "/pedido/:id",
      component: () => import("../views/PedidoDetalle.vue"),
      props: true,
    },
    {
      path: "/historial-centro",
      component: () => import("../views/HistorialCentro.vue"),
    },
    {
      path: "/pedidos-centro",
      component: () => import("../views/PedidosCentro.vue"),
    },
    {
      path: "/pedidos/:id/editar",
      component: () => import("../views/EditarPedido.vue"),
    },
  ],
});

export default router;
