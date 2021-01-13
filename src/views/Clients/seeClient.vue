<template>
  <form @submit.prevent="sendData()" novalidate autocomplete="off">
    <b-input-group>
      <b-input
        @input="$v.name.$touch"
        :style="[
          $v.name.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        placeholder="Nombre"
        v-model="name"
      ></b-input>
      <b-input
        @input="$v.surname.$touch"
        :style="[
          $v.surname.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        v-model="surname"
        placeholder="Apellido"
      ></b-input>
    </b-input-group>

    <b-input-group>
      <b-input
        placeholder="Localidad"
        @input="$v.loc.$touch"
        :style="[
          $v.loc.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        v-model="loc"
      ></b-input>
      <b-input
        @input="$v.streetName.$touch"
        :style="[
          $v.streetName.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : null,
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
            : null,
        ]"
        type="number"
        v-model="streetNumber"
        placeholder="Altura"
      ></b-input>
    </b-input-group>
    <b-input-group prepend="+54">
      <b-form-select v-model.number="prefix" style="appearance: none;">
        <b-form-select-option
          :value="prefix"
          v-for="prefix in prefixes"
          :key="prefix"
        >
          {{ prefix }}
        </b-form-select-option>
      </b-form-select>
      <b-input
        @input="$v.phoneNumber.$touch"
        :style="[
          $v.phoneNumber.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : null,
        ]"
        type="number"
        placeholder="Número de Teléfono"
        v-model="phoneNumber"
      ></b-input>
    </b-input-group>

    <b-input
      @input="$v.company.$touch"
      :style="[
        $v.company.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
      ]"
      type="text"
      placeholder="Empresa"
      v-model="company"
    ></b-input>
    <b-textarea v-model="notes" placeholder="Observaciones"> </b-textarea>
    <span id="buttons">
      <b-button
        :disabled="isNotValid"
        pill
        size="lg"
        variant="success"
        type="submit"
        >Guardar</b-button
      ><b-button
        @click="handleCancelation()"
        pill
        size="lg"
        variant="outline-danger"
        >Cancelar</b-button
      >
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
        streetName: undefined,
        streetNumber: undefined,
        name: undefined,
        surname: undefined,
        phoneNumber: "",
        prefix: undefined,
        prefixes: [11, 223],
        company: undefined,
        loc: undefined,
        notes: undefined,
        id: undefined,
      };
    },
    validations: {
      name: {
        required,
      },
      loc: {
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
    async created() {
      let req = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/clients/${this.$store.state.nameOfActualItem}`
        )
        .once("value");
      req = req.val();
      this.name = req.name.split(" ")[0];
      this.surname = req.name.split(" ")[1];
      this.streetName = req.address.replace(/[0-9]/g, "");
      this.streetNumber = req.address.replace(/^\D+/g, "");
      this.phoneNumber = Number(
        req.phoneNumber.substring(req.phoneNumber.indexOf(")") + 1).trim()
      );
      this.prefix = Number(
        req.phoneNumber.substring(
          req.phoneNumber.lastIndexOf("(") + 1,
          req.phoneNumber.lastIndexOf(")")
        )
      );
      this.company = req.company;
      this.loc = req.loc;
      this.notes = req.notes;
      this.id = req.id;
    },
    computed: {
      isNotValid() {
        return this.$v.$invalid === true || this.prefix === "Prefijo"
          ? true
          : false;
      },
    },
    methods: {
      handleCancelation() {
        this.$router.push("/clientes");
      },
      sendData() {
        let name = this.name.concat(" ", this.surname);
        let address = this.streetName.concat(" ", this.streetNumber);
        let phoneNumber = `+54 (${this.prefix}) ${this.phoneNumber}`;

        let clientData = {
          name: name,
          address: address,
          id: this.id,
          phoneNumber: phoneNumber,
          company: this.company,
          loc: this.loc,
          notes: this.notes || "-",
        };
        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/clients/${this.id}`
        ] = clientData;
        db.ref().update(updates);
        this.$router.push("clientes");
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
  form > span:first {
    display: flex;
    align-items: center;
    height: 80vh;
    justify-content: center;
  }
  .input-group,
  textarea {
    max-width: 80vw;
    align-items: center;
    max-height: 30vh;
  }
  select {
    max-width: 15vw;
    margin: 0 1vw 0 1vw;
    padding: 1vh;
  }
  #buttons {
    width: 100%;
    display: flex;
    justify-content: space-evenly;
  }
</style>
