<template>
  <div>
    <div id="container">
      <h1>{{ this.$store.state.nameOfActualItem }}</h1>
      <b-card-group columns>
        <b-card
          header="Empresa"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-input v-model="characteristics.company"></b-input>
        </b-card>
        <b-card
          header="Teléfono"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-input-group
            :prepend="
              `+54 (${characteristics.phoneNumber.replace(/.*\(|\).*/g, '')})`
            "
          >
            <b-input
              @input="
                characteristics.phoneNumber = `+54 (${characteristics.phoneNumber.replace(
                  /.*\(|\).*/g,
                  ''
                )}) ${$event.trim()}`
              "
              :value="
                characteristics.phoneNumber.substring(
                  characteristics.phoneNumber.lastIndexOf(' ')
                )
              "
            ></b-input>
          </b-input-group>
        </b-card>
        <b-card
          header="Dirección"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-input-group>
            <b-input
              @input="
                characteristics.address = `${$event.trim()} ${characteristics.address.substring(
                  characteristics.address.indexOf(' ')
                )}`
              "
              :value="
                characteristics.address
                  .substring(0, characteristics.address.indexOf(' '))
                  .trim()
              "
              type="text"
            ></b-input>
            <b-input
              @input="
                characteristics.address = `${characteristics.address.substring(
                  0,
                  characteristics.address.indexOf(' ')
                )} ${$event.trim()}`
              "
              :value="
                characteristics.address
                  .substring(characteristics.address.indexOf(' '))
                  .trim()
              "
              type="text"
            ></b-input>
          </b-input-group>
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
      };
    },
    created() {
      db.ref(
        `users/${this.$store.getters["user/userProfile"].uid}/clients/${this.$store.state.nameOfActualItem}`
      ).on("value", (snapshot) => {
        this.characteristics = {
          address: snapshot.val().address,
          phoneNumber: snapshot.val().phoneNumber,
          name: snapshot.val().name,
          company: snapshot.val().company,
        };
      });
    },
    watch: {
      characteristics: {
        handler(newCharacteristics) {
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/clients/${this.$store.state.nameOfActualItem}/`
          ).set(newCharacteristics);
        },
        deep: true,
      },
    },
  };
</script>

<style scoped>
  @media screen and (min-width: 597px) {
    .card-columns {
      margin: 0 5vh 15vh !important;
    }
  }
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
  .input-group > * {
    margin: 0 0.5vh;
  }
</style>
