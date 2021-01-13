<template>
  <main>
    <h2>Iniciar Sesión</h2>

    <b-button variant="outline-primary" @click="login">
      <svg
        data-v-41be6633=""
        viewBox="0 0 16 16"
        width="1em"
        height="1em"
        focusable="false"
        role="img"
        aria-label="google"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi-google mx-auto b-icon bi"
      >
        <g data-v-41be6633="">
          <path
            d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
          ></path>
        </g></svg
      >oogle</b-button
    >
  </main>
</template>

<script>
  import { mapActions } from "vuex";
  export default {
    methods: {
      ...mapActions("user", {
        login: "login",
      }),
    },
  };
</script>

<style scoped>
  main {
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    min-height: 50vh;
    min-width: 30vw;
    align-items: center;
    box-shadow: 1em 1em 1em 1em rgba(0, 0, 0, 0.096);
  }
  button {
    min-width: 80%;
    font-weight: 700;
    margin: 10vh;
  }

  main h2 {
    margin: 5vh 0;
  }
</style>
