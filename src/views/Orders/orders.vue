<template>
  <div>
    <h1>Pedidos</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="order + ' ' + index"
          v-for="(order, index) in orders"
          @click="seeOrderInfo(order)"
        >
          <b-icon icon="clock-fill"></b-icon>
          {{ order.deliveryTime }}
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteOrder(order)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Entregado
            </b-dropdown-item-button>
          </b-dropdown>
        </b-button>
        <b-button
          @click="$router.push('crear-pedido')"
          variant="outline-primary"
          @mouseover="hover = 'rgb(255, 255, 255)'"
          @mouseout="hover = 'rgb(0, 123, 255)'"
        >
          <b-icon
            :style="{ color: hover }"
            icon="plus"
            aria-hidden="true"
          ></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  export default {
    name: "orders",
    data() {
      return {
        orders: this.$store.state.orders,
        hover: "rgb(0, 123, 255)",
      };
    },
    beforeCreate() {
      this.$store.dispatch("setOrders");
    },
    computed: {
      newOrders() {
        return this.$store.state.orders;
      },
    },
    watch: {
      newOrders(newItems) {
        this.orders = newItems;
      },
    },
    methods: {
      deleteOrder(order) {
        db.ref("/orders/" + order.deliveryTime).remove();
      },
      editOrder(order) {
        this.$store.commit("changeName", order.deliveryTime);
        this.$store.commit("changeEditStatus", true);
        this.$router.push("ver-pedido");
      },
      seeOrderInfo(order) {
        this.$store.commit("changeName", order.deliveryTime);
        this.$store.commit("changeEditStatus", false);
        this.$router.push("ver-pedido");
      },
    },
  };
</script>

<style scoped>
  .container {
    margin: 20px;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 80vw;
    height: 40vh;
  }
  .container > button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-basis: 250px;
    height: 10vh;
    margin: 50px;
    font-size: 1.3em;
  }
  h1 {
    text-align: center;
    padding-top: 20px;
  }
</style>
