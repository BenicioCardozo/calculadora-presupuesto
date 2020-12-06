<template>
  <div>
    <h1>Productos</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="product + ' ' + index"
          v-for="(product, index) in products"
          @click="seeProductInfo(product.name)"
        >
          {{ product.name }}
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editProduct(product.name)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteProduct(product.name)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown>
        </b-button>
        <b-button
          @click="$router.push('crear-producto')"
          variant="outline-primary"
          @mouseover="hover = 'rgb(255, 255, 255)'"
          @mouseout="hover = 'rgb(0, 123, 255)'"
        >
          <b-icon
            :style="{ color: hover }"
            icon="plus"
            aria-hidden="true"
          ></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  export default {
    name: "products",
    data() {
      return {
        products: this.$store.state.products,
        hover: "rgb(0, 123, 255)",
      };
    },
    beforeCreate() {
      this.$store.dispatch("setProducts");
      this.$store.dispatch("setSourceMaterials");
      this.$store.dispatch("setClients");
    },
    computed: {
      newProducts() {
        return this.$store.state.products;
      },
    },
    watch: {
      newProducts(newItems) {
        this.products = newItems;
      },
    },
    methods: {
      deleteProduct(product) {
        db.ref("/products/" + product).remove();
      },
      editProduct(productName) {
        this.$store.commit("changeName", productName);
        this.$store.commit("changeEditStatus", true);
        this.$router.push("ver-producto");
      },
      seeProductInfo(productName) {
        this.$store.commit("changeName", productName);
        this.$router.push("ver-producto");
        this.$store.commit("changeEditStatus", false);
      },
    },
  };
</script>

<style scoped>
  .container {
    margin: 20px;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 80vw;
    height: 40vh;
  }
  .container > button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-basis: 250px;
    height: 10vh;
    margin: 50px;
    font-size: 1.3em;
  }
  h1 {
    text-align: center;
    padding-top: 20px;
  }
</style>
