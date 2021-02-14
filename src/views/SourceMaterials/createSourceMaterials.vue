<template>
  <source-materials-layout
    :name.sync="name"
    :color.sync="color"
    :quality.sync="quality"
    :type.sync="type"
    :supplier.sync="supplier"
    :price.sync="price"
    :id.sync="id"
  ></source-materials-layout>
</template>

<script>
  import sourceMaterialsLayout from "../../components/layouts/sourceMaterialsLayout.vue";
  export default {
    components: { sourceMaterialsLayout },
    data() {
      return {
        name: "",
        color: "",
        quality: "",
        type: "",
        supplier: "",
        price: {
          amount: undefined,
          measurementUnit: "Unidad de Medida",
        },

        id: "",
      };
    },
  };
</script>
