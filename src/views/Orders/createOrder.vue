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
        :min="today"
        language
        :date-format-options="{
          year: undefined,
          month: 'long',
          day: '2-digit',
          weekday: 'long',
        }"
        hide-header
        placeholder="Fecha de Entrega"
        locale="es-AR"
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
        v-if="Object.keys(kitsAndProducts).length > 0"
        style="display:flex; justify-content: space-around;width:80vw;"
      >
        <h5 :key="kit.name" v-for="kit in kitsAndProducts">
          {{ `${kit.name}  ${kit.quantity} ` }}
          <b-icon
            style="cursor:pointer;"
            icon="trash"
            scale="1.1"
            @click.stop="deleteKitOrProduct(kit.name)"
          >
          </b-icon>
        </h5>
      </span>
      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="
          $v.$invalid === true || Object.values(kitsAndProducts).length < 1
        "
        >Agregar Orden</b-button
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
      today() {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const minDate = new Date(today);
        console.log(this.deliveryTime, minDate);

        return minDate;
      },
      subtitle() {
        return this.seeKits ? "Kits" : "Productos";
      },
      kitsAndProducts() {
        let result = { ...this.kits, ...this.products };
        console.log(result);
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
        this.submitStatus = "OK";
        let newKey = db
          .ref()
          .child("orders")
          .push().key;
        let now = new Date();
        let orderData = {
          deliveryTime: this.toLocaleDate(this.deliveryTime),
          client: this.client,
          kits: this.kits,
          products: this.products,
          createdAt: `${this.toLocaleDate(now)}`,
          importance: this.importance,
          id: newKey,
        };

        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/orders/${newKey}`
        ] = orderData;
        db.ref().update(updates);
        this.$router.push("pedidos");
      },
      toLocaleDate(date) {
        const options = {
          month: "long",
          day: "numeric",
          year: "numeric",
        };
        return new Date(date).toLocaleDateString("es-AR", options);
      },
      pushKit() {
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
      deleteKitOrProduct(name) {
        this.kits[name]
          ? this.$delete(this.kits, name)
          : this.$delete(this.products, name);
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
  .small {
    display: none;
  }
</style>
