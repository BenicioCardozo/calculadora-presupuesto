<template>
  <form @submit.prevent="sendData()" novalidate autocomplete="off">
    <div id="container">
      <h2>Crear</h2>
      <b-input-group>
        <b-input
          @input="$v.name.$touch"
          :style="[
            $v.name.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : { color: 'green' },
          ]"
          type="text"
          placeholder="Nombre"
          v-model="name"
        ></b-input>
        <b-input
          @input="$v.surname.$touch"
          :style="[
            $v.surname.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : { color: 'green' },
          ]"
          type="text"
          v-model="surname"
          placeholder="Apellido"
        ></b-input>
      </b-input-group>
      <b-input-group>
        <b-input
          @input="$v.streetName.$touch"
          :style="[
            $v.streetName.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : { color: 'green' },
          ]"
          type="text"
          placeholder="Calle"
          v-model="streetName"
        ></b-input>
        <b-input
          @input="$v.streetNumber.$touch"
          :style="[
            $v.streetNumber.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : { color: 'green' },
          ]"
          type="number"
          v-model="streetNumber"
          placeholder="Altura"
        ></b-input>
      </b-input-group>
      <b-input-group prepend="+54">
        <b-form-select v-model.number="prefix">
          <b-form-select-option
            :value="prefix"
            v-for="prefix in prefixes"
            :key="prefix"
          >
            {{ prefix }}
          </b-form-select-option>
          <b-form-select-option value="Prefijo" selected disabled hidden>
            Prefijo
          </b-form-select-option>
        </b-form-select>
        <b-input
          @input="$v.phoneNumber.$touch"
          :style="[
            $v.phoneNumber.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : { color: 'green' },
          ]"
          type="number"
          placeholder="Número de Teléfono"
          v-model="phoneNumber"
        ></b-input>
      </b-input-group>

      <b-input
        @input="$v.company.$touch"
        :style="[
          $v.company.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="text"
        placeholder="Empresa"
        v-model="company"
      ></b-input>
      <b-button
        :disabled="isNotValid"
        pill
        size="lg"
        variant="success"
        type="submit"
        >Agregar</b-button
      >
    </div>
  </form>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";

  export default {
    name: "create-client",
    data() {
      return {
        streetName: undefined,
        streetNumber: undefined,
        name: undefined,
        surname: undefined,
        phoneNumber: "",
        prefix: "Prefijo",
        prefixes: ["11", "223"],
        company: undefined,
      };
    },
    validations: {
      name: {
        required,
      },
      streetNumber: {
        required,
      },
      streetName: {
        required,
      },
      phoneNumber: {
        required,
      },
      prefix: {
        required,
      },
      company: {
        required,
      },
      surname: {
        required,
      },
    },
    created() {
      this.$store.dispatch("setProducts");
    },
    computed: {
      isNotValid() {
        return this.$v.$invalid === true || this.prefix === "Prefijo"
          ? true
          : false;
      },
    },
    methods: {
      sendData() {
        let name = this.name.concat(" ", this.surname);
        let address = this.streetName.concat(" ", this.streetNumber);
        let phoneNumber = `+54 (${this.prefix}) ${this.phoneNumber}`;
        let newKey = db
          .ref()
          .child("clients")
          .push().key;

        let clientData = {
          name: name,
          address: address,
          id: newKey,
          phoneNumber: phoneNumber,
          company: this.company,
        };
        let updates = {};
        updates["/clients/" + name] = clientData;
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
    min-height: 87vh;
    padding-top: 20px;
    justify-content: space-around;
    align-items: center;
  }
  #container input {
    max-width: 80vw;
  }
  h2 {
    font-weight: 500;
    font-size: 2.4em;
  }
  div > h4,
  div > span,
  div > input {
    margin: 1px 20px 14px 1px;
  }
  form > span {
    display: flex;
    align-items: center;
    height: 80vh;
    justify-content: center;
  }
  .input-group {
    max-width: 80vw;
    align-items: center;
  }
  select {
    max-width: 15vw;
    margin: 0 1vw 0 1vw;
    padding: 1vh;
    appearance: none !important;
  }
</style>
