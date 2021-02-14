<template>
  <orders-layout
    :client.sync="client"
    :kit.sync="kit"
    :kits.sync="kits"
    :products.sync="products"
    :quantity.sync="quantity"
    :importance.sync="importance"
    :deliveryTime.sync="deliveryTime"
    :id.sync="id"
  ></orders-layout>
</template>

<script>
  import ordersLayout from '../../components/layouts/ordersLayout.vue';
  export default {
    components: { ordersLayout },
    data() {
      return {
        client: '',
        kit: 'Kit',
        kits: {},
        products: {},
        quantity: '',
        importance: '',
        deliveryTime: '',
        id: ''
      };
    }
  };
</script>
