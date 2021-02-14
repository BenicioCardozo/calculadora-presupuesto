<template>
  <source-material-layout
    :name.sync="name"
    :color.sync="color"
    :quality.sync="quality"
    :type.sync="type"
    :supplier.sync="supplier"
    :price.sync="price"
    :id.sync="id"
  >
  </source-material-layout>
</template>

<script>
  import { db } from "../../firebase/firebase.js";

  import sourceMaterialLayout from "../../components/layouts/sourceMaterialsLayout";
  export default {
    components: { sourceMaterialLayout },
    data() {
      return {
        name: null,
        color: null,
        quality: null,
        type: null,
        supplier: null,
        price: {
          amount: undefined,
          measurementUnit: "Unidad de Medida",
        },

        id: undefined,
      };
    },
    async created() {
      console.log(this.$store.state.nameOfActualItem);
      let req = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.$store.state.nameOfActualItem}`
        )
        .once("value");
      let res = await req.val();

      this.name = res.name;
      this.color = res.characteristics.color;
      this.type = res.characteristics.type;
      this.supplier = res.characteristics.supplier;
      console.log(this.supplier);
      this.quality = res.characteristics.quality;
      this.price.measurementUnit = res.price.measurementUnit;
      this.price.amount = res.price.amount;
      this.id = res.id;
    },
  };
</script>
