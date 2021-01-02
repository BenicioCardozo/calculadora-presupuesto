<template>
  <div>
    <h1>Pedidos</h1>
    <div>
      <div class="buttons-header">
        <b-button
          variant="primary"
          style="margin: 2vh 5vh;"
          size="lg"
          @click="$router.push('crear-pedido')"
        >
          Crear<b-icon icon="plus" aria-hidden="true"></b-icon
        ></b-button>
        <filterItems
          :methodOpt="{
            price: ['<', '>'],
          }"
          @setItems="setItems"
          :filtersOpt="['Precio']"
          :items.sync="items"
          :itemsToShow.sync="itemsToShow"
        >
        </filterItems>
      </div>

      <b-table striped hover responsive="md" :items="itemsToShow" v-if="orders">
        <template #head(precio)>
          <span>Precio Final</span>
        </template>
        <template #cell(kits)="data">
          <span v-html="data.value"></span>
        </template>

        <template #cell(productos)="data">
          <span v-html="data.value"></span>
        </template>
        <template #cell(id)="data">
          <b-td class="text-primary" style="white-space:nowrap;"
            >{{ data.value.substr(13) }}
            <b-dropdown variant="white" no-caret>
              <template #button-content>
                <b-icon
                  scale="0.9"
                  icon="three-dots-vertical"
                  aria-hidden="true"
                ></b-icon>
              </template>
              <b-dropdown-item-button
                @click.stop="editOrder(data.item.id)"
                tabindex="-1"
                variant="info"
              >
                <b-icon icon="pencil" aria-hidden="true"></b-icon>
                Editar
              </b-dropdown-item-button>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="danger"
                @click.stop="deleteOrder(data.item.id)"
              >
                <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
                Eliminar
              </b-dropdown-item-button>
            </b-dropdown></b-td
          >
        </template></b-table
      >
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";
  import Vue from "vue";

  export default {
    name: "orders",
    components: { filterItems },
    data() {
      return {
        items: [],
        itemsToShow: [],
        prices: {},
        kitPrices: {},
        productPrices: {},
      };
    },
    created() {
      this.$store.dispatch("setOrders");
    },
    computed: {
      ...mapState(["orders"]),
      async productAndKitsText() {
        if (this.orders) {
          let paragraphsOfKitsAndProduct = {};
          for (const nameOfActualItem of this.orders) {
            paragraphsOfKitsAndProduct[nameOfActualItem.id] = {};
            let queryProducts = await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${nameOfActualItem.id}/products`
              )
              .once("value");

            let queryKits = await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/orders/${nameOfActualItem.id}/kits`
              )
              .once("value");

            if (queryProducts.val()) {
              let productsArray = Object.keys(queryProducts.val()).map((el) => {
                return `${el}:&nbsp;${queryProducts.val()[el].quantity} <br/>`;
              });
              let productsParagraph = productsArray
                ? productsArray.join(", ")
                : "-";

              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].products = productsParagraph;
            }
            if (queryKits.val()) {
              let kitsArray = Object.keys(queryKits.val()).map((el) => {
                return `${el}:&nbsp;${queryKits.val()[el].quantity} <br/>`;
              });
              let kitsParagraph = kitsArray ? kitsArray.join("") : "-";
              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].kits = kitsParagraph;
            }
          }

          return paragraphsOfKitsAndProduct;
        }
      },
    },
    watch: {
      orders: {
        async handler(newVal, oldVal) {
          let result = {};
          let productsPrices = {};
          let kitsPrices = {};
          //Orders
          for (const order of newVal) {
            let kits = order.kits;
            let products = order.products;
            //Kits
            if (kits) {
              for (const iterator in kits) {
                let prices = [];
                let kitQuantity = await db
                  .ref(
                    `users/${this.$store.getters["user/userProfile"].uid}/orders/${order.id}/kits/${iterator}/quantity`
                  )
                  .once("value");
                let productsOfKit = await db
                  .ref(
                    `users/${this.$store.getters["user/userProfile"].uid}/kits/${iterator}/products`
                  )
                  .once("value");
                for (const key in productsOfKit.val()) {
                  let product = productsOfKit.val()[key];
                  let priceOfProduct =
                    (await this.$store.dispatch(
                      "setProductPrice",
                      product.name
                    )) * product.quantity;
                  prices.push(priceOfProduct);
                  let finalPrice = prices.reduce((a, b) => a + b, 0) || 0;
                  kitsPrices[order.id] = finalPrice * kitQuantity.val();
                }
              }
            }
            if (products) {
              for (const key in products) {
                let prices = [];
                let product = products[key];
                let priceOfProduct =
                  (await this.$store.dispatch(
                    "setProductPrice",
                    product.name
                  )) * product.quantity;
                prices.push(priceOfProduct);
                let finalPrice = prices.reduce((a, b) => a + b, 0) || 0;
                productsPrices[order.id] = finalPrice;
              }
            }
          }
          this.kitPrices = kitsPrices;
          this.productPrices = productsPrices;
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      async setItems() {
        let texts = await this.productAndKitsText;
        this.items = [];
        let itemsWithoutFormat = this.orders;
        if (itemsWithoutFormat) {
          itemsWithoutFormat.forEach(async (element) => {
            if (!element.id) return false;
            let price = Number(
              (Number(this.productPrices[element.id]) || 0) +
                (Number(this.kitPrices[element.id]) || 0)
            );
            console.log(element.deliveryTime);
            this.items.push({
              id: element.id,
              cliente: element.client,
              productos: texts[element.id].products || "-",
              kits: texts[element.id].kits || "-",
              importancia: element.importance,
              fecha_de_creación: element.createdAt,
              fecha_de_entrega: element.deliveryTime,
              precio: `$${price.toLocaleString("es-AR")}`,
            });
            this.itemsToShow = this.items;
          });
        }
      },
      deleteOrder(order) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/orders/${order}`
        ).remove();
      },
      editOrder(order) {
        this.$store.commit("changeName", order);
        this.$router.push("ver-pedido");
      },
    },
  };
</script>

<style scoped>
  h1 {
    text-align: center;
    padding-top: 20px;
  }
  .table {
    max-width: 100%;
  }
</style>
