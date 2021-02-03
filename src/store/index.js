import Vue from "vue";
import Vuex from "vuex";
import { db } from "../firebase/firebase.js";
import user from "./user/index.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
  },
  state: {
    products: [],
    sourceMaterials: [],
    clients: [],
    kits: [],
    suppliers: [],
    nameOfActualItem: undefined,
    orders: undefined,
  },
  mutations: {
    changeName(state, newName) {
      state.nameOfActualItem = newName;
    },
  },
  actions: {
    setProductPrice: async (context, name) => {
      let sourceMaterialsQuery = await db
        .ref(
          `users/${context.state.user.userProfile.uid}/products/${name}/sourceMaterials`
        )
        .once("value");
      if (!sourceMaterialsQuery.val()) throw new Error("Invalid Product");
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
          .ref(
            `users/${context.state.user.userProfile.uid}/sourceMaterials/${nameOfEl}/price/amount`
          )
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

      sourceMaterialsPricesDecapsulate.map(async (el) => {
        if (!Object.values(el)[0]) {
          await db
            .ref(
              `users/${
                context.state.user.userProfile.uid
              }/products/${name}/sourceMaterials/${Object.keys(el)[0]}`
            )
            .set(null);
        }
      });

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
    setProducts: ({ state }) => {
      let products = [];

      db.ref(`users/${state.user.userProfile.uid}/products`).on(
        "value",
        (snapshot) => {
          products = [];
          if (snapshot.val()) {
            for (const key in snapshot.val()) {
              const product = snapshot.val()[key];
              products.push({
                name: product.name,
                type: product.type,
                characteristics: product.characteristics,
                id: product.id,
                sourceMaterials: product.sourceMaterials,
                profit: product.profit,
              });
              state.products = products;
            }
          } else {
            state.products = [];
          }
        }
      );
    },
    setSourceMaterials: ({ state }) => {
      let sourceMaterials = [];

      db.ref(`users/${state.user.userProfile.uid}/sourceMaterials`).on(
        "value",
        (snapshot) => {
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
            state.sourceMaterials = [];
          }
        }
      );
    },
    setClients: ({ state }) => {
      let clients = [];

      db.ref(`users/${state.user.userProfile.uid}/clients`).on(
        "value",
        (snapshot) => {
          clients = [];
          if (snapshot.val()) {
            for (const key in snapshot.val()) {
              const client = snapshot.val()[key];
              clients.push({
                name: client.name,
                notes: client.notes,
                loc: client.loc,
                characteristics: {
                  address: client.address,
                  phoneNumber: client.phoneNumber,
                  id: client.id,
                  company: client.company,
                },
              });
              state.clients = clients;
            }
          } else {
            state.clients = [];
          }
        }
      );
    },
    setKits: ({ state }) => {
      let kits = [];

      db.ref(`users/${state.user.userProfile.uid}/kits`).on(
        "value",
        (snapshot) => {
          kits = [];
          if (snapshot.val()) {
            for (const key in snapshot.val()) {
              const kit = snapshot.val()[key];
              kits.push({
                name: kit.name,
                products: kit.products,
                id: kit.id,
              });
              state.kits = kits;
            }
          } else {
            state.kits = [];
          }
        }
      );
    },
    setOrders: ({ state }) => {
      let orders = [];

      db.ref(`users/${state.user.userProfile.uid}/orders`).on(
        "value",
        (snapshot) => {
          orders = [];
          if (snapshot.val()) {
            console.log(snapshot.val());
            for (const key in snapshot.val()) {
              const order = snapshot.val()[key];
              orders.push({
                deliveryTime: order.deliveryTime,
                client: order.client,
                createdAt: order.createdAt,
                id: order.id,
                kits: order.kits,
                products: order.products,
                importance: order.importance,
                price: order.price,
                status: order.status,
              });
              state.orders = orders;
            }
          } else {
            state.orders = [];
          }
        }
      );
    },
    setSuppliers: ({ state }) => {
      let suppliers = [];
      db.ref(`users/${state.user.userProfile.uid}/suppliers`).on(
        "value",
        (snapshot) => {
          suppliers = [];
          if (snapshot.val()) {
            for (const key in snapshot.val()) {
              const supplier = snapshot.val()[key];
              suppliers.push({
                name: supplier.name,
                notes: supplier.notes,
                loc: supplier.loc,
                characteristics: {
                  address: supplier.address,
                  phoneNumber: supplier.phoneNumber,
                  id: supplier.id,
                  company: supplier.company,
                },
              });
              state.suppliers = suppliers;
            }
          } else {
            state.suppliers = [];
          }
        }
      );
    },
  },
});
