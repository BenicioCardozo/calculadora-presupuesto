<template>
  <div id="container">
    <div id="select-inputs">
      <span v-if="id">
        <h2>Precio Final: ${{ price }}</h2>
      </span>
      <b-input-group prepend="Cliente">
        <b-form-select
          @change="actValue('client', client, false, false)"
          v-model="client"
          :options="clientsOpt"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group prepend="Importancia"
        ><b-form-select
          v-model="importance"
          :options="importanceOpt"
          @change="actValue('importance', importance, false, false)"
        ></b-form-select
      ></b-input-group>
      <b-input-group prepend="Fecha de Entrega">
        <b-form-datepicker
          v-model="deliveryTime"
          :placeholder="deliveryTime"
          :min="minDate"
          @context="actValue('deliveryTime', deliveryTime, true, false)"
        ></b-form-datepicker>
      </b-input-group>
    </div>
    <div id="products-and-kits">
      <h3>Productos y Kits</h3>
      <span id="add-kit-or-product"
        ><h5>Agregar Kit/Producto</h5>
        <b-input-group id="add-kit-or-product-form">
          <b-form-select
            v-model="newItem"
            :options="kitsAndProductsNotIncluded"
          >
            <b-form-select-option selected disabled hidden value="Elegir"
              >Elegir Item</b-form-select-option
            >
          </b-form-select>
          <b-input
            v-model.number="newQuantity"
            type="number"
            placeholder="Cantidad"
          ></b-input>
        </b-input-group>
        <b-button
          :disabled="
            newItem === 'Elegir' ||
              newQuantity == undefined ||
              newQuantity == ''
          "
          variant="outline-info"
          pill
          @click="addItem()"
          >Agregar</b-button
        >
      </span>
      <b-table responsive :items="productsAndKits">
        <template #cell(cantidad)="data">
          <b-input
            @input="actValue(data.item.nombre, $event, false, true)"
            :value="data.value"
          >
          </b-input
        ></template>
        <template #cell(nombre)="data">
          <span
            style="display: flex;
    align-items: center;
    justify-content: space-evenly;"
          >
            <h6>{{ data.value }}</h6>
            <b-icon
              style="cursor:pointer;color:rgb(208,6,6);"
              icon="trash"
              @click="deleteItem(data.value)"
            ></b-icon>
          </span> </template
      ></b-table>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";

  export default {
    data() {
      return {
        price: 0,
        kits: [],
        products: [],
        deliveryTime: undefined,
        importance: undefined,
        importanceOpt: ["Alta", "Media", "Baja"],
        client: undefined,
        clientsOpt: [],
        id: undefined,
        productsAndKits: [],
        kitsAndProductsNotIncluded: undefined,
        newItem: "Elegir",
        newQuantity: undefined,
        allProducts: undefined,
      };
    },
    computed: {
      minDate() {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const minDate = new Date(today);
        return minDate;
      },
    },

    async created() {
      await this.setItems();
      //Clients Options
      let reqOfClients = await db
        .ref(`users/${this.$store.getters["user/userProfile"].uid}/clients`)
        .once("value");
      this.clientsOpt = Object.keys(reqOfClients.val());
      this.getNotIncludedItems();
    },
    methods: {
      async getNotIncludedItems() {
        let kitsReq = await db
          .ref(`users/${this.$store.getters["user/userProfile"].uid}/kits`)
          .once("value");

        let productsReq = await db
          .ref(`users/${this.$store.getters["user/userProfile"].uid}/products`)
          .once("value");
        this.allProducts = productsReq.val();
        let allKitsAndProducts = [
          ...Object.keys(kitsReq.val()),
          ...Object.keys(productsReq.val()),
        ];
        let includedKitAndProducts = this.products.concat(this.kits);
        let merge = allKitsAndProducts.concat(includedKitAndProducts);
        let duplicates = merge.filter(
          (item, index) => merge.indexOf(item) != index
        );
        let mergeUnique = [...new Set(merge)];
        console.log(mergeUnique, duplicates);
        this.kitsAndProductsNotIncluded = mergeUnique.filter(
          (el) => !duplicates.includes(el)
        );
      },
      async deleteItem(item) {
        let isProduct = Object.keys(this.allProducts).includes(item)
          ? true
          : false;
        isProduct
          ? await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/products/${item}`
              )
              .set(null)
          : await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/kits/${item}`
              )
              .set(null);

        await this.setItems();
        this.getNotIncludedItems();
      },
      async addItem() {
        let isProduct = Object.keys(this.allProducts).includes(this.newItem)
          ? true
          : false;
        isProduct
          ? await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/products/${this.newItem}`
              )
              .set({
                name: this.newItem,
                quantity: this.newQuantity,
              })
          : await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/kits/${this.newItem}`
              )
              .set({
                name: this.newItem,
                quantity: this.newQuantity,
              });

        await this.setItems();
        await this.getNotIncludedItems();
        this.newQuantity = "";
        this.newItem = "Elegir";
      },
      async actValue(field, newValue, isDate, updProductOrKit) {
        if (newValue === 0 || newValue === "") {
          let productOrKit = field;
          this.productsAndKits = this.productsAndKits.filter(
            (a) => a !== productOrKit
          );
          let isProduct = this.products.includes(field);
          isProduct
            ? db
                .ref(
                  `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/products/${field}`
                )
                .set(null)
            : db
                .ref(
                  `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/kits/${field}`
                )
                .set(null);
          await this.setItems();
          this.getNotIncludedItems();
        } else {
          if (!updProductOrKit) {
            if (!this.formattedDate(this.deliveryTime)) return false;
            db.ref(
              `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/${field}`
            ).set(this.formattedDate(this.deliveryTime));
          } else {
            let group = Object.keys(this.allProducts).includes(field) //Field would be a product or kit
              ? "products"
              : "kits";
            db.ref(
              `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/${group}/${field}/quantity`
            ).set(newValue);
            this.setItems();
          }
        }
      },
      formattedDate(date) {
        let splittedDate = date.split("-");
        let dateObj = new Date(
          `${splittedDate[1]}/${splittedDate[2]}/${splittedDate[0]}`
        );
        const options = {
          month: "long",
          day: "numeric",
          year: "numeric",
        };

        return dateObj.toLocaleDateString("es-AR", options) === "Invalid Date"
          ? date
          : dateObj.toLocaleDateString("es-AR", options);
      },
      async setItems() {
        this.productsAndKits = [];
        this.products = [];
        this.kits = [];
        this.price = 0;
        let req = await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}`
          )
          .once("value");
        this.deliveryTime = req.val().deliveryTime;
        this.importance = req.val().importance;
        this.client = req.val().client;
        this.id = req.val().id;
        if (req.val().kits) {
          let kits = await Promise.all(
            Object.values(req.val().kits).map(async (el) => {
              let result = await db
                .ref(
                  `users/${this.$store.getters["user/userProfile"].uid}/kits/${el.name}/products`
                )
                .once("value");
              return {
                nombre: el.name,
                tipo: "Kit",
                cantidad: el.quantity,
                productos: Object.values(result.val()),
              };
            })
          );

          for (const kit of kits) {
            let pricesOfProducts = await Promise.all(
              kit.productos.map(async (el) => {
                let req =
                  (await this.$store.dispatch("setProductPrice", el.name)) *
                  el.quantity;
                return req;
              })
            );
            let sumedValues = pricesOfProducts.reduce((a, b) => a + b, 0);
            let finalPriceOfKit = sumedValues * Number(kit.cantidad);
            this.kits.push(kit.nombre);
            this.productsAndKits = this.productsAndKits.concat({
              nombre: kit.nombre,
              cantidad: kit.cantidad,
              tipo: "Kit",
              subtotal: `$${finalPriceOfKit}`,
            });
          }
        }
        if (req.val().products) {
          let products = await Promise.all(
            Object.values(req.val().products).map(async (el) => {
              let price =
                (await this.$store.dispatch("setProductPrice", el.name)) *
                el.quantity;
              this.products.push(el.name);
              return {
                nombre: el.name,
                tipo: "Producto",
                cantidad: el.quantity,
                subtotal: `$${price}`,
              };
            })
          );
          this.productsAndKits = this.productsAndKits.concat(products);
        }
        let allSubTotals = this.productsAndKits.map((el) =>
          Number(el.subtotal.split(/(\d+)/)[1])
        );
        console.log(allSubTotals);
        this.price = allSubTotals.reduce((a, b) => a + b, 0);
      },
    },
  };
</script>

<style scoped>
  input {
    text-align: center;
    font-weight: 500;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    min-height: 90vh;
    text-align: center;
  }
  #select-inputs {
    display: flex;
    flex-direction: column;
    flex: 0.2;
    justify-content: space-around;
    align-items: center;
  }
  @media screen and (min-width: 350px) {
    .input-group {
      max-width: 80vw;
    }
  }
  #select-inputs > span {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    min-width: 20%;
  }
  #products-and-kits {
    flex: 0.5;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  #add-kit-or-product-form {
    margin: auto;
  }
  #add-kit-or-product-form > * {
    margin: 0 1vw;
  }
  #add-kit-or-product > button {
    margin: 1vh 0;
  }
</style>
