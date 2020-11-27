import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import createSourceMaterials from '../views/SourceMaterials/createSourceMaterials.vue'
import sourceMaterials from '../views/SourceMaterials/sourceMaterials.vue';
import seeSourceMaterial from '../views/SourceMaterials/seeSourceMaterial.vue';


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/crear-materia-prima',
    component: createSourceMaterials
  },
  {
    path: '/materias-primas',
    component: sourceMaterials
  },
  {
    path: '/ver-materia-prima',
    component: seeSourceMaterial
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
