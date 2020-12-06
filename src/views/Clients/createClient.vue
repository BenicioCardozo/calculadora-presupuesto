<template>
  <form @submit.prevent="sendData()" novalidate autocomplete="off">
    <div id="container" v-if="this.$store.state.products !== undefined">
      <h2>Crear</h2>
      <b-input
        @input="$v.name.$touch"
        :style="[
          $v.name.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="text"
        size="sm"
        placeholder="Nombre"
        v-model="name"
      ></b-input>
      <b-input
        @input="$v.address.$touch"
        :style="[
          $v.address.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="text"
        size="sm"
        placeholder="Direccion"
        v-model="address"
      ></b-input>
      <b-input
        @input="$v.phoneNumber.$touch"
        :style="[
          $v.phoneNumber.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="number"
        size="sm"
        placeholder="Numero de teléfono"
        v-model="phoneNumber"
      ></b-input>
      <b-form-select
        style="width:80vw;"
        v-model="purchaseFrequency"
        :options="purchaseFrequencyOptions"
      >
        <b-form-select-option value="Frecuencia de Compra" disabled hidden>
          Frecuencia de Compra
        </b-form-select-option>
      </b-form-select>
      <b-button
        :disabled="$v.$invalid === true"
        pill
        size="lg"
        variant="success"
        type="submit"
        >Agregar</b-button
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
    name: "create-client",
    data() {
      return {
        address: undefined,
        name: undefined,
        phoneNumber: undefined,
        purchaseFrequency: "Frecuencia de Compra",
        purchaseFrequencyOptions: ["Alta", "Media", "Baja"],
      };
    },
    validations: {
      name: {
        required,
      },
      address: {
        required,
      },
      phoneNumber: {
        required,
      },
      purchaseFrequency: {
        required,
      },
    },
    beforeCreate() {
      this.$store.dispatch("setProducts");
    },
    created() {},
    methods: {
      sendData() {
        var newKey = db
          .ref()
          .child("clients")
          .push().key;

        var clientData = {
          name: this.name,
          address: this.address,
          phoneNumber: this.phoneNumber,
          purchaseFrequency: this.purchaseFrequency,
        };
        var updates = {};
        updates["/clients/" + this.name] = clientData;
        db.ref().update(updates);
        this.$router.push("clientes");
      },
    },
  };
</script>

<style scoped>
  #container {
    display: flex;
    flex-direction: column;
    height: 80vh;
    padding-top: 20px;
    justify-content: space-around;
    align-items: center;
  }
  #container > input,
  #container > input {
    padding: 1.5em !important;
    width: 80vw;
  }
  h2 {
    font-weight: 500;
    font-size: 2.4em;
  }
  div > h4,
  div > span,
  div > input {
    margin: 10px;
  }
  form > span {
    display: flex;
    align-items: center;
    height: 80vh;
    justify-content: center;
  }
</style>
