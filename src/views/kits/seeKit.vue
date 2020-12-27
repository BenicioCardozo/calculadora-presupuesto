<template>
  <div>
    <div id="container">
      <h1>{{ this.$store.state.nameOfActualItem }}</h1>
      <h3
        v-for="(product, index) in this.products"
        :key="product + ' ' + index"
      >
        {{
          `${product.name} | Cantidad ${product.quantity.toLocaleString(
            "es-AR"
          )} | Precio Total $${product.price.toLocaleString("es-AR")}`
        }}
      </h3>
      <h2 style="color:rgb(59, 116, 59)">
        {{ `Precio Final $${price.toLocaleString("es-AR")}` }}
      </h2>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";
  export default {
    data() {
      return {
        price: 0,
        name: undefined,
        products: undefined,
      };
    },
    async created() {
      let request = await db
        .ref(`kits/${this.$store.state.nameOfActualItem}`)
        .on("value", (snapshot) => {
          this.products = snapshot.val().products;
        });

      for (const key in this.products) {
        const element = this.products[key].name;
        console.log(element);
        let setPrice = await this.$store.commit("setProductPrice", element);
        this.price +=
          this.$store.state.productPrice * Number(this.products[key].quantity);
        this.$set(this.products[key], "price", this.$store.state.productPrice);
      }
      this.price = this.$store.state.productPrice;
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
