<template>
  <div id="app">
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
      </span>

      <b-navbar-toggle id="toggle" target="navbar-toggle-collapse">
        <template #default="{ expanded }">
          <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
          <b-icon v-else icon="chevron-bar-down"></b-icon>
        </template>
      </b-navbar-toggle>

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
    <router-view />
  </div>
</template>

<style scoped>
  #top {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 92%;
    list-style: none;
    flex-wrap: wrap;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-weight: 700;
    font-size: 1.2em;
  }
  a {
    padding: 5px;
  }
  #top a.router-link-exact-active {
    color: #42b983;
  }
  @media screen and (min-width: 750px) {
    #toggle {
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

  .buttons-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .buttons-header > div.dropdown {
    margin: 3vh auto !important;
    width: 30vw;
  }
  .buttons-header > * {
    margin: auto;
  }
  .table th,
  .table td {
    vertical-align: middle !important;
  }
</style>
