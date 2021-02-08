<template>
  <div id="app">
    <navbar
      :userProfile="userProfile"
      :loggedIn="loggedIn"
      :logout="logout"
      :login="login"
    ></navbar>
    <router-view />
  </div>
</template>

<script>
  import { mapActions, mapGetters } from "vuex";
  import navbar from "./components/navbar";

  export default {
    beforeCreate() {
      this.$store.dispatch("setSuppliers");
      this.$store.dispatch("setProducts");
      this.$store.dispatch("setSourceMaterials");
      this.$store.dispatch("setKits");
      this.$store.dispatch("setOrders");
      this.$store.dispatch("setClients");
    },
    components: {
      navbar,
    },
    computed: {
      ...mapGetters("user", {
        userProfile: "userProfile",
        loggedIn: "loggedIn",
      }),
    },
    methods: {
      ...mapActions("user", {
        login: "login",
        logout: "logout",
      }),
    },
  };
</script>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .table th,
  tr td {
    vertical-align: middle !important;
    border-top: none !important;
  }
  .btn-success.disabled {
    background-color: rgba(3, 3, 3, 0.473) !important;
    border: 1px solid rgb(124, 121, 121) !important;
  }
  /* .btn-info.disabled {
    background-color: rgba(105, 102, 102, 0.521) !important;
    border: 2px solid rgb(116, 116, 116) !important;
  } */
</style>
