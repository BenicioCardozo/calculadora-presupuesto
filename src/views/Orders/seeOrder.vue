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
  import { db } from '../../firebase/firebase.js';

  import ordersLayout from '../../components/layouts/ordersLayout.vue';
  export default {
    components: { ordersLayout },
    async created() {
      //Set initial Values
      let order_info = await db
        .ref(
          `users/${this.$store.getters['user/userProfile'].uid}/orders/${this.$store.state.nameOfActualItem}/`
        )
        .once('value');
      order_info = order_info.val();
      this.kits = order_info.kits || {};
      this.products = order_info.products || {};
      this.createdAt = order_info.createdAt;
      this.importance = order_info.importance;
      this.id = order_info.id;
      this.client = order_info.client;
      this.deliveryTime = new Date(order_info.deliveryTime);
      this.status = order_info.status;
    },
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
