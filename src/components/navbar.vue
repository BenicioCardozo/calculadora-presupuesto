<template>
  <b-navbar toggleable type="dark" variant="dark">
    <span id="top">
      <b-nav-item href="#">
        <router-link to="/pedidos">Pedidos</router-link>
      </b-nav-item>
      <b-nav-item href="#">
        <router-link to="/kits">Kits</router-link>
      </b-nav-item>
      <b-nav-item href="#">
        <router-link to="/clientes">Clientes</router-link>
      </b-nav-item>
      <b-nav-item href="#">
        <router-link to="/productos">Productos</router-link>
      </b-nav-item>
      <b-nav-item href="#">
        <router-link to="/materias-primas">Materias Primas</router-link>
      </b-nav-item>

      <b-button
        size="sm"
        style="margin: .3vh 0 0 5vw;"
        v-if="!loggedIn"
        variant="primary"
        @click="login"
        >Iniciar Sesión</b-button
      >
      <b-button
        size="sm"
        style="margin: .3vh 0 0 5vw;"
        v-else
        variant="primary"
        @click="logout"
        >Salir</b-button
      >
    </span>
    <span id="mobile-header">
      <b-button v-if="!loggedIn" variant="primary" @click="login" size="sm"
        >Iniciar Sesión</b-button
      >
      <b-button v-else variant="primary" @click="logout" size="sm"
        >Salir</b-button
      >
      <b-navbar-toggle
        id="toggle"
        #default="{ expanded }"
        target="navbar-toggle-collapse"
      >
        <template>
          <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
          <b-icon v-else icon="chevron-bar-down"></b-icon>
        </template>
      </b-navbar-toggle>
    </span>

    <b-collapse id="navbar-toggle-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item href="#">
          <router-link to="/pedidos">Pedidos</router-link>
        </b-nav-item>
        <b-nav-item href="#">
          <router-link to="/kits">Kits</router-link>
        </b-nav-item>
        <b-nav-item href="#">
          <router-link to="/clientes">Clientes</router-link>
        </b-nav-item>
        <b-nav-item href="#">
          <router-link to="/productos">Productos</router-link>
        </b-nav-item>
        <b-nav-item href="#">
          <router-link to="/materias-primas">Materias Primas</router-link>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
  export default {
    props: ["login", "loggedIn", "logout"],
  };
</script>

<style scoped>
  #top {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 92%;
    list-style: none;
    flex-wrap: wrap;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 1.2em;
  }
  #mobile-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  a {
    padding: 5px;
  }
  a[href] :hover {
    text-decoration: none !important ;
    color: #007bff;
  }
  a:hover {
    background-color: #54268f;
    border-radius: 10px;
  }
  #top a.router-link-exact-active {
    color: #42b983;
  }
  @media screen and (min-width: 750px) {
    #mobile-header {
      display: none;
    }
  }
  @media screen and (max-width: 750px) {
    #top {
      display: none;
    }
    #navbar-toggle-collapse > * {
      text-align: center;
      font-size: 1.2em;
    }
    .navbar {
      display: flex;
      justify-content: flex-end !important;
    }
  }
</style>
