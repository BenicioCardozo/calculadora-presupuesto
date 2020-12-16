<template>
  <form @submit.prevent="sendData()" novalidate>
    <!-- Vars Kit || Kits sometimes refer to both, products and kits -->
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
        :date-format-options="{ month: 'numeric', day: 'numeric' }"
        placeholder="Fecha de Entrega"
        locale="es"
      ></b-form-datepicker>
      <span id="sub-title">
        <h4>{{ subtitle }} que Lleva</h4>
        <b-button @click="seeKits = !seeKits" size="sm" variant="outline-info"
          >¿Lleva {{ seeKits ? "Productos sueltos" : "Kits" }}?</b-button
        >
      </span>
      <b-form-select size="sm" v-model="kit">
        <b-form-select-option selected disabled hidden value="Kit">
          Nombre del {{ subtitle.slice(0, -1) }}
        </b-form-select-option>
        <b-form-select-option
          v-show="subtitle === 'Kits'"
          :value="kit.name"
          v-bind:key="kit.name + ' ' + index"
          v-for="(kit, index) in this.$store.state.kits"
        >
          {{ kit.name }}
        </b-form-select-option>
        <b-form-select-option
          v-show="subtitle === 'Productos'"
          :value="product.name"
          v-bind:key="product.name + ' ' + index"
          v-for="(product, index) in this.$store.state.products"
        >
          {{ product.name }}
        </b-form-select-option>
      </b-form-select>
      <b-input
        :placeholder="`Cantidad del ${subtitle.slice(0, -1)}`"
        type="number"
        size="sm"
        v-model="quantity"
      >
      </b-input>
      <b-button
        :disabled="!quantity || kit === 'Kit'"
        @click="pushKit()"
        variant="secondary"
        >Agregar {{ subtitle.slice(0, -1) }}</b-button
      >
      <span
        v-if="Object.keys(kits).length > 0"
        style="display:flex; justify-content: space-around;width:80vw;"
      >
        <h5 :key="kit + ' ' + index" v-for="(kit, index) in kitsAndProducts">
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
        Todavía no tenés Kits Creados
        <router-link
          style="color: rgb(10, 92, 173); text-align:center; margin-top: 20px;"
          to="/crear-kit"
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
        client: "Cliente",
        kit: "Kit",
        kits: {},
        products: {},
        quantity: undefined,
        importance: "Importancia",
        importanceOpt: ["Alta", "Media", "Baja"],
        deliveryTime: undefined,
        submitStatus: null,
        seeKits: true,
      };
    },
    computed: {
      subtitle() {
        return this.seeKits ? "Kits" : "Productos";
      },
      kitsAndProducts() {
        let result = { ...this.kits, ...this.products };
        return result;
      },
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
    },
    beforeCreate() {
      this.$store.dispatch("setKits");
      this.$store.dispatch("setClients");
      this.$store.dispatch("setProducts");
    },
    created() {},
    methods: {
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid && Object.keys(kits).length > 0) {
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
            kits: this.kits,
            products: this.products,
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
        // this.$v.quantity.$touch;
        // this.$v.kit.$touch;
        if (this.seeKits) {
          this.$set(this.kits, this.kit, {
            name: this.kit,
            quantity: this.quantity,
          });
        } else {
          this.$set(this.products, this.kit, {
            name: this.kit,
            quantity: this.quantity,
          });
        }
        (this.kit = "Kit"), (this.quantity = "");
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
  #sub-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;
    width: 100vw;
  }
  #sub-title > h4 {
    padding: 2vh;
  }
</style>
