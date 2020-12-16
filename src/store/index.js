import Vue from "vue";
import Vuex from "vuex";
import { db } from "../firebase/firebase.js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    products: [],
    sourceMaterials: [],
    clients: [],
    kits: [],
    nameOfActualItem: undefined,
    productPrice: undefined,
    orders: undefined,
  },
  mutations: {
    setOrders: (state) => {
      let orders = [];

      db.ref("/orders").on("value", (snapshot) => {
        orders = [];
        if (snapshot.val()) {
          for (const key in snapshot.val()) {
            const order = snapshot.val()[key];
            orders.push({
              deliveryTime: order.deliveryTime,
              client: order.client,
              kit: order.kit,
              importance: order.importance,
            });
            state.orders = orders;
          }
        } else {
          state.orders = undefined;
        }
      });
    },
    setProductPrice: (state, name) => {
      var price = 0;
      db.ref(`products/${name}`).on("value", (snapshot) => {
        for (const item in snapshot.val().sourceMaterials) {
          const element = snapshot.val().sourceMaterials[item];
          db.ref(`sourceMaterials/${element.name}`).on("value", (snapshot) => {
            let sourceMaterialPrice = snapshot.val().price.amount;
            price += element.howMuch * Number(sourceMaterialPrice);
          });
        }
      });
      state.productPrice = price;
    },
    setKits: (state) => {
      let kits = [];

      db.ref("/kits").on("value", (snapshot) => {
        kits = [];
        if (snapshot.val()) {
          for (const key in snapshot.val()) {
            const kit = snapshot.val()[key];
            kits.push({
              name: kit.name,
              products: kit.products,
            });
            state.kits = kits;
          }
        } else {
          state.kits = undefined;
        }
      });
    },
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
              id: sourceMaterial.id.substring(1),
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
    setKits: (state) => {
      state.commit("setKits");
    },
    setOrders: (state) => {
      state.commit("setOrders");
    },
  },
});
