<template>
  <form @submit.prevent="sendData()" novalidate>
    <div id="container" v-if="this.$store.state.products !== undefined">
      <h2>Crear</h2>
      <b-input
        @input="$v.nameKit.$touch"
        :style="[
          $v.nameKit.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="text"
        placeholder="Nombre"
        v-model="nameKit"
      ></b-input>
      <h4 style="font-weight: 500;">Productos</h4>
      <b-form-select ref="sourceMaterialSelector" v-model="product">
        <b-form-select-option selected disabled hidden value="Nombre">
          Nombre
        </b-form-select-option>
        <b-form-select-option
          :value="product.name"
          v-bind:key="product + ' ' + index"
          v-for="(product, index) in this.$store.state.products"
        >
          {{ product.name }}
        </b-form-select-option>
      </b-form-select>
      <b-input
        type="number"
        placeholder="Cantidad"
        v-model="quantity"
      ></b-input>
      <span
        v-if="Object.keys(products).length !== 0"
        style="display:flex; justify-content: space-around;width:80vw;"
      >
        <h5 :key="product + ' ' + index" v-for="(product, index) in products">
          {{ `${product.name}  ${product.quantity} ` }}
          <b-icon
            style="cursor:pointer;"
            icon="trash"
            scale="1.1"
            @click.stop="deleteProduct(product.name)"
          >
          </b-icon>
        </h5>
      </span>
      <b-button
        :disabled="!quantity || product === 'Nombre'"
        variant="info"
        @click="pushProduct()"
        >Agregar Producto</b-button
      >

      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="$v.$invalid === true || Object.keys(products).length === 0"
        >Agregar Kit</b-button
      >
    </div>
    <span v-else>
      <h2 style="text-align: center;">
        Todavía no tenés Productos Creados
        <router-link
          style="color: rgb(10, 92, 173); text-align:center; margin-top: 20px;"
          to="/crear-producto"
        >
          <h2 style="font-size: 4rem;">
            ¡Crealos!
          </h2>
        </router-link>
      </h2>
    </span>
  </form>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";
  export default {
    name: "create-product",
    data() {
      return {
        nameKit: undefined,
        submitStatus: null,
        products: {},
        product: "Nombre",
        quantity: undefined,
      };
    },
    validations: {
      nameKit: {
        required,
      },
    },
    beforeCreate() {
      this.$store.dispatch("setProducts");
    },
    created() {},
    methods: {
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = "ERROR";
        } else {
          this.submitStatus = "OK";
          let newKey = db
            .ref()
            .child("products")
            .push().key;
          let kitData = {
            name: this.nameKit,
            products: this.products,
            id: newKey,
          };
          console.dir(kitData);
          let updates = {};
          updates["/kits/" + this.nameKit] = kitData;
          db.ref().update(updates);
          this.$router.push("kits");
        }
      },
      pushProduct() {
        this.$set(this.products, this.product, {
          name: this.product,
          quantity: Number(this.quantity),
        });
        this.quantity = "";
        this.product = "";
      },
      deleteProduct(name) {
        this.$delete(this.products, name);
      },
    },
    watch: {},
  };
</script>

<style scoped>
  #container {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    justify-content: space-around;
    align-items: center;
    min-height: 90vh;
  }
  #container > input,
  #container > input {
    width: 80vw;
  }
  h2 {
    font-weight: 500;
    font-size: 2.4em;
  }
  #quantity-and-dropdown {
    display: inline-flex;
    align-items: center;
    width: 80vw;
  }
  #quantity-and-dropdown > h2 {
    margin: 0 0 0 2vw;
  }
  #quantity-and-dropdown > input {
    min-height: 100%;
  }
  #select-placeholder {
    color: #fff;
  }
  div > h4,
  div > span,
  div > input {
    margin: 10px;
  }
  form > span {
    display: flex;
    align-items: center;
    height: 85vh;
    justify-content: center;
  }
  #container > h4,
  button[type="submit"] {
    margin: 3vh;
  }
  .select-characteristics {
    width: 80vw;
  }
  .select-inside-card {
    width: 100%;
  }
  select {
    width: 80vw;
  }
</style>
