<template>
  <kits-layout
    :nameKit.sync="nameKit"
    :product.sync="product"
    :products.sync="products"
    :quantity.sync="quantity"
    :id.sync="id"
  ></kits-layout>
</template>

<script>
  import kitsLayout from '../../components/layouts/kitsLayout.vue';
  export default {
    components: { kitsLayout },
    data() {
      return {
        nameKit: '',
        product: '',
        products: {},
        quantity: '',
        id: ''
      };
    },
    async created() {
      let kit_info = this.$store.state.kits.find(
        (el) => el.name === this.$store.state.nameOfActualItem
      );
      kit_info = kit_info;
      console.log(kit_info);
      this.nameKit = kit_info.name;
      this.id = kit_info.id;
      this.products = kit_info.products;
    }
  };
</script>
