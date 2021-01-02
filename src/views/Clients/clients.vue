<template>
  <div>
    <h1>Clientes</h1>
    <div class="buttons-header">
      <b-button
        variant="primary"
        style="margin: 2vh 5vh;"
        size="lg"
        @click="$router.push('crear-cliente')"
      >
        Crear<b-icon icon="plus" aria-hidden="true"></b-icon
      ></b-button>
    </div>
    <b-table striped hover responsive="sm" :items="itemsToShow" v-if="clients">
      <template #cell(nombre)="data">
        <b-td class="text-primary" style="white-space:nowrap;"
          >{{ data.value }}
          <b-dropdown variant="white" no-caret>
            <template #button-content>
              <b-icon
                scale="0.9"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editClient(data.value)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteClient(data.value)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown></b-td
        >
      </template></b-table
    >
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import Vue from "vue";

  export default {
    name: "clients",
    data() {
      return {
        hover: "rgb(0, 123, 255)",
        items: [],
        itemsToShow: [],
        companies: [],
      };
    },
    created() {
      this.$store.dispatch("setClients");
    },
    computed: {
      ...mapState(["clients"]),
    },
    watch: {
      clients: {
        handler(newVal) {
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      setItems(itemsWithoutFormat) {
        this.items = [];
        if (!itemsWithoutFormat) return false;
        if (!itemsWithoutFormat.isChecked) {
          let itemsWithoutFormat = this.clients;
          itemsWithoutFormat.forEach(async (element) => {
            if (!element.characteristics.id) return false;
            this.items.push({
              nombre: element.name,
              dirección: element.characteristics.address,
              número_de_teléfono: element.characteristics.phoneNumber,
              empresa: element.characteristics.company,
            });
            this.itemsToShow = this.items;
          });
        } else {
          this.items = [...itemsWithoutFormat.items];
        }
      },
      deleteClient(name) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/clients/${name}`
        ).remove();
      },
      editClient(name) {
        this.$store.commit("changeName", name);
        this.$router.push("ver-cliente");
      },
    },
  };
</script>

<style>
  .container {
    margin: 20px;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 80vw;
    height: 40vh;
  }
  .container > button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-basis: 250px;
    height: 10vh;
    margin: 50px;
    font-size: 1.3em;
  }
  h1 {
    text-align: center;
    font-size: 2.5em;
    padding-top: 20px;
  }
</style>
