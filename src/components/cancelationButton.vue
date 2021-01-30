<template>
  <b-button
    pill
    @click="handleCancelation()"
    variant="outline-danger"
    size="lg"
  >
    Cancelar
  </b-button>
</template>

<script>
  export default {
    props: {
      redirectionForCancelation: String,
    },
    methods: {
      handleCancelation() {
        this.$router.push(this.redirectionForCancelation);
      },
    },
  };
</script>
