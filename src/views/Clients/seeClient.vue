<template>
  <div>
    <div id="container">
      <h1>{{ this.$store.state.nameOfActualItem }}</h1>
      <b-card-group columns style="margin: 0 5vh 15vh!important">
        <b-card
          header="Frecuencia"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            characteristics.purchaseFrequency
          }}</b-card-text>
          <b-form-select
            v-model="characteristics.purchaseFrequency"
            v-else
            :options="purchaseFrequencyOptions"
          ></b-form-select>
        </b-card>
        <b-card
          header="Teléfono"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            `${characteristics.phoneNumber}`
          }}</b-card-text>
          <b-input
            v-model="characteristics.phoneNumber"
            v-else
            size="sm"
          ></b-input>
        </b-card>
        <b-card
          header="Dirección"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            `${characteristics.address}`
          }}</b-card-text>
          <b-input v-model="characteristics.address" v-else size="sm"></b-input>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";

  export default {
    data() {
      return {
        characteristics: undefined,
        price: undefined,
        purchaseFrequencyOptions: ["Alta", "Media", "Baja"],
      };
    },
    created() {
      db.ref(`clients/${this.$store.state.nameOfActualItem}`).on(
        "value",
        (snapshot) => {
          this.characteristics = {
            address: snapshot.val().address,
            phoneNumber: snapshot.val().phoneNumber,
            name: snapshot.val().name,
            purchaseFrequency: snapshot.val().purchaseFrequency,
          };
        }
      );
    },
    watch: {
      characteristics: {
        handler(newCharacteristics) {
          db.ref(`/clients/${this.$store.state.nameOfActualItem}/`).set(
            newCharacteristics
          );
        },
        deep: true,
      },
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
    min-height: 80vh;
    text-align: center;
  }
</style>
