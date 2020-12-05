<template>
  <div>
    <div id="container">
      <h1>{{ this.$store.state.nameOfActualItem }}</h1>
      <b-card-group columns style="margin: 0 5vh 0!important">
        <b-card
          header="Color"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            characteristics.color
          }}</b-card-text>
          <b-form-select
            v-model="characteristics.color"
            v-else
            :options="colors"
          ></b-form-select>
        </b-card>
        <b-card
          header="Calidad"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            characteristics.quality
          }}</b-card-text>
          <b-form-select
            v-model="characteristics.quality"
            v-else
            :options="qualities"
          ></b-form-select>
        </b-card>
        <b-card
          header="Tamaño"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
            `${characteristics.size}`
          }}</b-card-text>
          <b-form-select
            v-model="characteristics.size"
            v-else
            :options="sizes"
          ></b-form-select>
        </b-card>
      </b-card-group>
      <h2 style="color:rgb(59, 116, 59)">
        {{ `$ ${price.toLocaleString("es-AR")}` }}
      </h2>
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
        qualities: ["Alta", "Media", "Baja"],
        colors: ["Beige", "Azul", "Blanco"],
        sizes: ["Grande", "Mediano", "Pequeño"],
      };
    },
    created() {
      var price = 0;
      db.ref(`products/${this.$store.state.nameOfActualItem}`).on(
        "value",
        (snapshot) => {
          this.characteristics = snapshot.val().characteristics;
          for (const item in snapshot.val().sourceMaterials) {
            const element = snapshot.val().sourceMaterials[item];
            db.ref(`sourceMaterials/${element.name}`).on(
              "value",
              (snapshot) => {
                let sourceMaterialPrice = snapshot.val().price.amount;
                price += element.howMuch * Number(sourceMaterialPrice);
              }
            );
          }
        }
      );
      this.price = price;
    },
    watch: {
      characteristics: {
        handler(newCharacteristics) {
          db.ref(
            `/products/${this.$store.state.nameOfActualItem}/characteristics`
          ).set(newCharacteristics);
        },
        deep: true,
      },
    },
  };
</script>

<style scoped>
  @media screen and (min-width: 576px) {
    .card-columns {
      margin: 20vh 5vh 0 !important;
    }
  }

  input {
    text-align: center;
    font-weight: 500;
    width: 100%;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80vh;
    text-align: center;
  }
</style>
