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
              id: product.id,
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
    setProductPrice: async (context, name) => {
      let sourceMaterialsQuery = await db
        .ref(`products/${name}/sourceMaterials`)
        .once("value");

      let sourceMaterials = Object.values(sourceMaterialsQuery.val()).map(
        (el) => {
          return {
            [el.name]: el.howMuch,
          };
        }
      );

      let sourceMaterialsPrices = sourceMaterials.map(async (el) => {
        let nameOfEl = Object.keys(el)[0];
        let amount = await db
          .ref(`sourceMaterials/${nameOfEl}/price/amount`)
          .once("value")
          .then((res) => res.val());

        return {
          [nameOfEl]: amount,
        };
      });

      let sourceMaterialsPricesDecapsulate = await Promise.all(
        sourceMaterialsPrices.map(async (parameter) => {
          const result = await parameter;
          return result;
        })
      );

      //
      let result = sourceMaterials
        .map((el, i) => {
          return (
            Number(Object.values(el)[0]) *
            Number(Object.values(sourceMaterialsPricesDecapsulate[i])[0])
          );
        })
        .reduce((a, b) => a + b, 0);

      return result;
    },
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
