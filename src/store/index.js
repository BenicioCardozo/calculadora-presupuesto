import Vue from "vue";
import Vuex from "vuex";
import { db } from "../firebase/firebase.js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    products: [],
    sourceMaterials: [],
    clients: [],
    nameOfActualItem: undefined,
    edit: false,
  },
  mutations: {
    setClients: (state) => {
      let clients = [];

      db.ref("/clients").on("value", (snapshot) => {
        clients = [];
        if (snapshot.val()) {
          for (const key in snapshot.val()) {
            const client = snapshot.val()[key];
            clients.push({
              name: client.name,
              characteristics: {
                address: client.address,
                phoneNumber: client.phoneNumber,
                purchaseFrequency: client.purchaseFrequency,
              },
            });
            state.clients = clients;
          }
        } else {
          state.clients = undefined;
        }
      });
    },
    setProducts: (state) => {
      let products = [];

      db.ref("/products").on("value", (snapshot) => {
        products = [];
        if (snapshot.val()) {
          for (const key in snapshot.val()) {
            const product = snapshot.val()[key];
            products.push({
              name: product.name,
              characteristics: product.characteristics,
              sourceMaterials: product.sourceMaterials,
            });
            state.products = products;
          }
        } else {
          state.products = undefined;
        }
      });
    },
    changeName(state, newName) {
      state.nameOfActualItem = newName;
    },
    changeEditStatus: (state, newStatus) => {
      state.edit = newStatus;
    },
    setSourceMaterials: (state) => {
      let sourceMaterials = [];

      db.ref("/sourceMaterials").on("value", (snapshot) => {
        sourceMaterials = [];
        if (snapshot.val()) {
          for (const key in snapshot.val()) {
            const sourceMaterial = snapshot.val()[key];
            sourceMaterials.push({
              name: sourceMaterial.name,
              characteristics: sourceMaterial.characteristics,
              price: sourceMaterial.price,
            });
            state.sourceMaterials = sourceMaterials;
          }
        } else {
          state.sourceMaterials = undefined;
        }
      });
    },
  },
  actions: {
    setProducts: (state) => {
      state.commit("setProducts");
    },
    setSourceMaterials: (state) => {
      state.commit("setSourceMaterials");
    },
    setClients: (state) => {
      state.commit("setClients");
    },
  },
});
