<template>
  <form @submit.prevent="sendData()" novalidate>
    <div id="container" v-if="this.$store.state.kits !== undefined">
      <h2>Crear</h2>
      <b-form-select size="sm" v-model="client">
        <b-form-select-option selected disabled hidden value="Cliente">
          Nombre del Cliente
        </b-form-select-option>
        <b-form-select-option
          :value="client.name"
          v-bind:key="client + ' ' + index"
          v-for="(client, index) in this.$store.state.clients"
        >
          {{ client.name }}
        </b-form-select-option>
      </b-form-select>
      <b-form-select size="sm" v-model="importance">
        <b-form-select-option selected disabled hidden value="Importancia">
          Importancia
        </b-form-select-option>
        <b-form-select-option
          :value="opt"
          v-bind:key="opt + ' ' + index"
          v-for="(opt, index) in importanceOpt"
        >
          {{ opt }}
        </b-form-select-option>
      </b-form-select>
      <b-form-datepicker
        style="width:80vw;"
        v-model="deliveryTime"
        size="sm"
      ></b-form-datepicker>
      <h4>Kits que Lleva</h4>
      <b-form-select size="sm" v-model="kit">
        <b-form-select-option selected disabled hidden value="Kit">
          Nombre del kit
        </b-form-select-option>
        <b-form-select-option
          :value="kit.name"
          v-bind:key="kit + ' ' + index"
          v-for="(kit, index) in this.$store.state.kits"
        >
          {{ kit.name }}
        </b-form-select-option>
      </b-form-select>
      <b-input
        placeholder="Cantidad del Kit"
        type="number"
        size="sm"
        v-model="quantity"
        @input="pushKit()"
      >
      </b-input>
      <span
        v-if="quantity && kit != 'kit'"
        style="display:flex; justify-content: space-around;width:80vw;"
      >
        <h5 :key="kit + ' ' + index" v-for="(kit, index) in kits">
          {{ `${kit.name}  ${kit.quantity} ` }}
          <b-icon
            style="cursor:pointer;"
            icon="trash"
            scale="1.1"
            @click.stop="deleteKit(kit.name)"
          >
          </b-icon>
        </h5>
      </span>
      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="$v.$invalid === true"
        >Agregar Órden</b-button
      >
    </div>
    <span v-else>
      <h2 style="text-align: center;">
        Todavía no tenés Productos Creado
        <router-link
          style="color: rgb(10, 92, 173); text-align:center; margin-top: 20px;"
          to="/crear-producto"
        >
          <h2 style="font-size: 4rem;">
            ¡Crealas!
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
        client: "Cliente",
        clientsOpt: this.$store.state.clients,
        kit: "Kit",
        kits: {},
        quantity: undefined,
        kitsOpt: this.$store.state.kits,
        importance: "Importancia",
        importanceOpt: ["Alta", "Media", "Baja"],
        deliveryTime: undefined,
        submitStatus: null,
      };
    },
    validations: {
      client: {
        required,
      },
      deliveryTime: {
        required,
      },
      importance: {
        required,
      },
      kit: {
        required,
      },
      quantity: {
        required,
      },
    },
    beforeCreate() {
      this.$store.dispatch("setKits");
      this.$store.dispatch("setClients");
    },
    created() {},
    methods: {
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = "ERROR";
        } else {
          this.submitStatus = "OK";
          var newKey = db
            .ref()
            .child("orders")
            .push().key;
          let orderData = {
            deliveryTime: this.deliveryTime,
            client: this.client,
            kit: this.kits,
            importance: this.importance,
            id: newKey,
          };

          let updates = {};
          updates["/orders/" + this.deliveryTime] = orderData;
          db.ref().update(updates);
          this.$router.push("pedidos");
        }
      },
      pushKit() {
        this.$v.quantity.$touch;
        this.$v.kit.$touch;

        if (!this.$v.quantity.$invalid && this.kit !== "Kit") {
          this.$set(this.kits, this.kit, {
            name: this.kit,
            quantity: this.quantity,
          });
        }
      },
      deleteKit(name) {
        this.$delete(this.kits, name);
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
    padding: 1.5em !important;
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
