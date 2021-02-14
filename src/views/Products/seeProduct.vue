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
  import productsLayout from '../../components/layouts/productsLayout.vue';
  export default {
    components: { productsLayout },
    created() {
      let product_query = this.$store.state.products.find(
        (el) => el.name === this.$store.state.nameOfActualItem
      );
      ({
        name: this.name,
        profit: this.profit,
        type: this.type,
        sourceMaterials: this.sourceMaterials
      } = product_query);

      this.size = product_query.characteristics.size;
      this.color = product_query.characteristics.color;
      this.quality = product_query.characteristics.quality;
      this.id = product_query.id;
    },
    data() {
      return {
        name: '',
        sourceMaterials: {},
        sourceMaterial: '',
        howMuch: '',
        size: '',
        color: '',
        quality: '',
        profit: '',
        id: '',
        type: ''
      };
    }
  };
</script>
