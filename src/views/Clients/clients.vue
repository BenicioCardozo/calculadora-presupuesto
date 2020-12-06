<template>
  <div>
    <h1>Clientes</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="client + ' ' + index"
          v-for="(client, index) in clients"
          @click="seeClientInfo(client.name)"
        >
          {{ client.name }}
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editClient(client.name)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteClient(client.name)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown>
        </b-button>
        <b-button
          @click="$router.push('crear-cliente')"
          variant="outline-primary"
          @mouseover="hover = 'rgb(255, 255, 255)'"
          @mouseout="hover = 'rgb(0, 123, 255)'"
        >
          <b-icon
            :style="{ color: hover }"
            icon="plus"
            aria-hidden="true"
          ></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  export default {
    name: "clients",
    data() {
      return {
        clients: this.$store.state.clients,
        hover: "rgb(0, 123, 255)",
      };
    },
    computed: {
      newClients() {
        return this.$store.state.clients;
      },
    },
    watch: {
      newClients(newItems) {
        this.clients = newItems;
      },
    },
    beforeCreate() {
      this.$store.dispatch("setProducts");
      this.$store.dispatch("setSourceMaterials");
      this.$store.dispatch("setClients");
    },
    methods: {
      deleteClient(client) {
        db.ref(`/clients/${client}`).remove();
      },
      seeClientInfo(clientName) {
        this.$store.commit("changeName", clientName);
        this.$router.push("ver-cliente");
        this.$store.commit("changeEditStatus", false);
      },
      editClient(clientName) {
        this.$store.commit("changeName", clientName);
        this.$store.commit("changeEditStatus", true);
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
