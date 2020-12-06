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

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: sourceMaterials,
  },
  ,
  {
    path: "/crear-materia-prima",
    component: createSourceMaterials,
  },
  {
    path: "/materias-primas",
    component: sourceMaterials,
  },
  {
    path: "/ver-materia-prima",
    component: seeSourceMaterial,
  },
  {
    path: "/productos",
    component: products,
  },
  {
    path: "/crear-producto",
    component: createProducts,
  },
  {
    path: "/ver-producto",
    component: seeProduct,
  },
  {
    path: "/clientes",
    component: clients,
  },
  {
    path: "/crear-cliente",
    component: createClient,
  },
  {
    path: "/ver-cliente",
    component: seeClient,
  },
  {
    path: "/ver-kit",
    component: seeKit,
  },
  {
    path: "/crear-kit",
    component: createKit,
  },
  {
    path: "/kits",
    component: kits,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
