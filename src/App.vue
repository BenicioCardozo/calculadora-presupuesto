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
  h2,
  h1,
  h3,
  h4,
  h5,
  h6 {
    text-align: center;
  }
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
</style>
