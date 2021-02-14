<template>
  <form @submit.prevent="sendData()" novalidate autocomplete="off">
    <b-input-group>
      <b-input
        @input="updValue({ prop: 'name', newValue: $event })"
        :style="[
          $v.name.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        placeholder="Nombre"
        :value="name"
      ></b-input>
      <b-input
        @input="updValue({ prop: 'surname', newValue: $event })"
        :value="surname"
        :style="[
          $v.surname.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        placeholder="Apellido"
      ></b-input>
    </b-input-group>

    <b-input-group>
      <locationsSelect
        :style="[
          $v.loc.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        :value="loc"
        @updateValue="updValue"
      />
      <b-input
        @input="updValue({ prop: 'streetName', newValue: $event })"
        :value="streetName"
        :style="[
          $v.streetName.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : null,
        ]"
        type="text"
        placeholder="Calle"
      ></b-input>
      <b-input
        @input="updValue({ prop: 'streetNumber', newValue: $event })"
        :style="[
          $v.streetNumber.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : null,
        ]"
        type="number"
        placeholder="Altura"
        :value="streetNumber"
      ></b-input>
    </b-input-group>
    <b-input-group prepend="+54">
      <b-form-select
        @change="updValue({ prop: 'prefix', newValue: $event })"
        :value="prefix"
        style="appearance: none;"
      >
        <b-form-select-option
          :value="prefix"
          v-for="prefix in prefixes"
          :key="prefix"
        >
          {{ prefix }}
        </b-form-select-option>
      </b-form-select>
      <b-input
        @input="updValue({ prop: 'phoneNumber', newValue: $event })"
        :value="phoneNumber"
        :style="[
          $v.phoneNumber.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : null,
        ]"
        type="number"
        placeholder="Número de Teléfono"
      ></b-input>
    </b-input-group>

    <b-input
      @input="updValue({ prop: 'company', newValue: $event })"
      :value="company"
      :style="[
        $v.company.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
      ]"
      type="text"
      placeholder="Empresa"
    ></b-input>
    <b-textarea
      :value="notes"
      @input="updValue({ prop: 'notes', newValue: $event })"
      placeholder="Observaciones"
    >
    </b-textarea>
    <span>
      <b-button
        :disabled="isNotValid"
        variant="success"
        size="lg"
        pill
        type="submit"
      >
        {{ this.id ? "Guardar" : "Agregar" }}
      </b-button>
      <cancelationButton :redirectionForCancelation="page" />
    </span>
  </form>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";
  import cancelationButton from "../../components/cancelationButton.vue";
  import locationsSelect from "../../components/locationsSelect.vue";
  export default {
    props: {
      clientOrSupplier: String,
      streetName: {
        type: String,
      },
      streetNumber: {
        type: String,
      },
      name: {
        type: String,
      },
      surname: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      prefix: {
        type: String,
      },
      company: {
        type: String,
      },
      loc: {
        type: String,
      },
      notes: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    components: { cancelationButton, locationsSelect },
    data() {
      return {
        prefixes: ["11", "223"],
      };
    },
    validations: {
      name: {
        required,
      },
      loc: {
        required,
        validateSelect: (value) => !value.includes("Ciudad"),
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
    computed: {
      page() {
        let data = this.clientOrSupplier;
        return data === "clients" ? "clientes" : "proveedores";
      },
      isNotValid() {
        return this.$v.$invalid === true || this.prefix === "Prefijo"
          ? true
          : false;
      },
    },
    methods: {
      updValue({ prop, newValue }) {
        if (this.$v[prop]) this.$v[prop].$touch;
        this.$emit(`update:${prop}`, newValue);
      },
      handleCancelation() {
        this.$router.push(this.page);
      },
      async sendData() {
        let name = this.name.concat(" ", this.surname);
        let address = this.streetName.concat(" ", this.streetNumber);
        let phoneNumber = `+54 (${this.prefix}) ${this.phoneNumber}`;
        let newKey = db
          .ref()
          .child(this.clientOrSupplier)
          .push().key;

        let data = {
          name: name,
          address: address,
          id: this.id || newKey,
          phoneNumber: phoneNumber,
          company: this.company,
          loc: this.loc,
          notes: this.notes || "-",
        };
        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/${
            this.clientOrSupplier
          }/${this.id || newKey}`
        ] = data;
        await db.ref().update(updates);
        this.$router.push(this.page);
      },
    },
  };
</script>

<style scoped>
  form {
    display: flex;
    flex-direction: column;
    min-height: 92vh;
    padding-top: 20px;
    justify-content: space-around;
    align-items: center;
  }
  form input {
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

  .input-group,
  textarea {
    max-width: 80vw;
    align-items: center;
    max-height: 30vh;
  }
  select {
    margin: 0 1vw 0 0vw;
  }

  form > span {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .input-group-prepend {
    margin-right: 1vw;
  }
</style>
