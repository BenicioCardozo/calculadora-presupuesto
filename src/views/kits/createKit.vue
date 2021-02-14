<template>
  <kits-layout
    :nameKit.sync="nameKit"
    :product.sync="product"
    :products.sync="products"
    :quantity.sync="quantity"
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
    }
  };
</script>
