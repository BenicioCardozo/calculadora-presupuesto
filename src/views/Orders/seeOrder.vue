<template>
  <div>
    <div id="container">
      <h2>Cliente: {{ client }}</h2>
      <h2>Fecha de Entrega: {{ this.$store.state.nameOfActualItem }}</h2>
      <h2>Relevancia: {{ importance }}</h2>
      <h2 style="color:rgb(59, 116, 59)">
        {{ `Precio Final $${price.toLocaleString("es-AR")}` }}
      </h2>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";
  import productsVue from "../Products/products.vue";

  export default {
    data() {
      return {
        price: 0,
        kits: undefined,
        deliveryTime: undefined,
        importance: undefined,
        client: undefined,
      };
    },
    created() {
      db.ref(`orders/${this.$store.state.nameOfActualItem}`).on(
        "value",
        (snapshot) => {
          this.kits = snapshot.val().kit;
          this.deliveryTime = snapshot.val().deliveryTime;
          this.importance = snapshot.val().importance;
          this.client = snapshot.val().client;
        }
      );
      var products = undefined;
      var price = 0;
      for (const key in this.kits) {
        const element = this.kits[key].name;
        console.log(element);
        db.ref(`kits/${element}`).on("value", (snapshot) => {
          products = snapshot.val().products;
          console.log(products);
        });
        console.log(products);
        for (const key in products) {
          const element = products[key].name;
          console.log(element);
          this.$store.commit("setProductPrice", element);
          price +=
            this.$store.state.productPrice * Number(products[key].quantity);
        }
        this.price = Number(this.kits[key].quantity) * Number(price);
      }
    },
  };
</script>

<style scoped>
  /* @media screen and (min-width: 576px) {
    .card-columns {
      margin: 20vh 5vh 0 !important;
    }
  } */

  input {
    text-align: center;
    font-weight: 500;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 90vh;
    text-align: center;
  }

  h2 {
    margin: 5vh;
  }
</style>
