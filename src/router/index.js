import Vue from "vue";
import VueRouter from "vue-router";
import createSourceMaterials from "../views/SourceMaterials/createSourceMaterials.vue";
import sourceMaterials from "../views/SourceMaterials/sourceMaterials.vue";
import seeSourceMaterial from "../views/SourceMaterials/seeSourceMaterial.vue";
import products from "../views/Products/products.vue";
import createProducts from "../views/Products/createProduct.vue";
import seeProduct from "../views/Products/seeProduct.vue";
import clients from "../views/Clients/clients.vue";
import createClient from "../views/Clients/createClient.vue";
import seeClient from "../views/Clients/seeClient.vue";
import kits from "../views/kits/kits.vue";
import createKit from "../views/kits/createKit.vue";
import seeKit from "../views/kits/seeKit.vue";
import orders from "../views/Orders/orders.vue";
import createOrder from "../views/Orders/createOrder.vue";
import seeOrder from "../views/Orders/seeOrder.vue";
import login from "../views/Users/login.vue";
import { auth } from "../firebase/firebase";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: login,
  },
  {
    path: "/login",
    component: login,
  },
  {
    path: "/crear-materia-prima",
    component: createSourceMaterials,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/materias-primas",
    component: sourceMaterials,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ver-materia-prima",
    component: seeSourceMaterial,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/productos",
    component: products,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/crear-producto",
    component: createProducts,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ver-producto",
    component: seeProduct,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/clientes",
    component: clients,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/crear-cliente",
    component: createClient,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ver-cliente",
    component: seeClient,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ver-kit",
    component: seeKit,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/crear-kit",
    component: createKit,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/kits",
    component: kits,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/pedidos",
    component: orders,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/crear-pedido",
    component: createOrder,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ver-pedido",
    component: seeOrder,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth);

  if (requiresAuth && !auth.currentUser) {
    next("/login");
  } else {
    next();
  }
});
export default router;
