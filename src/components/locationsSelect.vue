<template>
  <b-form-select
    :value="value"
    :options="cities"
    @change="handleSelectionOfValue"
    ref="s"
  >
    <b-form-select-option selected disabled value="Ciudad"
      >Ciudad</b-form-select-option
    >
  </b-form-select>
</template>

<script>
  import cities from "../assets/cities.json";

  export default {
    props: {
      value: String,
    },
    data() {
      return { cities: cities };
    },
    model: {
      event: "change",
    },
    methods: {
      handleSelectionOfValue(newValue) {
        this.$emit("change", newValue);
      },
    },
  };
</script>

<style></style>
