<template>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav style="width: 100%" class="justify-content-around">
        <b-nav-item href="#" class="m-auto">
          <router-link to="/pedidos">Pedidos</router-link>
        </b-nav-item>
        <b-nav-item href="#" class="m-auto">
          <router-link to="/kits">Kits</router-link>
        </b-nav-item>
        <b-nav-item href="#" class="m-auto">
          <router-link to="/clientes">Clientes</router-link>
        </b-nav-item>
        <b-nav-item href="#" class="m-auto">
          <router-link to="/productos">Productos</router-link>
        </b-nav-item>
        <b-nav-item href="#" class="m-auto">
          <router-link to="/materias-primas">Materias Primas</router-link>
        </b-nav-item>
        <b-nav-item href="#" class="m-auto">
          <router-link to="/suppliers">Proveedores</router-link>
        </b-nav-item>
        <b-nav-form class="m-auto login-buttons">
          <b-button v-if="!loggedIn" variant="primary" @click="login"
            >Iniciar Sesión</b-button
          >
          <b-button v-else variant="primary" @click="logout"
            >Salir</b-button
          ></b-nav-form
        >
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
  a {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 1.2em;
    color: #489cf7 !important;
    padding: 5px;
  }

  li :not(.form-inline) :hover {
    background-color: #54268f;
    border-radius: 10px;
    text-decoration: none !important ;
  }
</style>
