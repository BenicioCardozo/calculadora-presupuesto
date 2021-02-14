<template>
  <products-layout
    :name.sync="name"
    :color.sync="color"
    :quality.sync="quality"
    :type.sync="type"
    :profit.sync="profit"
    :sourceMaterial.sync="sourceMaterial"
    :sourceMaterials.sync="sourceMaterials"
    :id.sync="id"
    :howMuch.sync="howMuch"
    :size.sync="size"
  ></products-layout>
</template>

<script>
  import productsLayout from "../../components/layouts/productsLayout.vue";
  export default {
    components: { productsLayout },
    data() {
      return {
        name: "",
        sourceMaterials: {},
        sourceMaterial: "",
        howMuch: "",
        size: "",
        color: "",
        quality: "",
        profit: "",
        id: "",
        type: "",
      };
    },
  };
</script>
