<template>
  <div>
    <h1>Kits</h1>
    <div>
      <filterItems
        :filtersOpt="[
          {
            type: 'Precio',
            name: 'Precio',
          },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-kit"
      ></filterItems>

      <table-component
        lettersForId="KI"
        :itemsToShow="tableItems"
        @deleteItem="deleteKit"
        @editItem="editKit"
      >
        <template v-slot:productos="slotProps">
          <span
            v-if="slotProps.data.value.length < 3"
            v-html="slotProps.data.value.join('<br/>')"
          >
            sads</span
          >
          <div v-else>
            <span
              v-html="
                showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
                  ? productsText
                      .find((el) => el.name === slotProps.data.item.nombre)
                      .p.map((el) => el.p)
                      .join('<br>')
                  : productsText.find(
                      (el) => el.name === slotProps.data.item.nombre
                    ).p.length
              "
            >
            </span>
            <br />
            <span
              @click="
                showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all = !showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
              "
              class="text-info"
              style="cursor:pointer;"
            >
              Ver
              {{
                showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
                  ? "menos"
                  : "más"
              }}
            </span>
          </div>
        </template>
      </table-component>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";
  import createId from "../../mixins/idCreator";
  import tableComponent from "../../components/table";
  export default {
    name: "kits",
    mixins: [createId],
    components: {
      filterItems,
      tableComponent,
    },
    data() {
      return {
        itemsToShow: [],
        showComplete: [],
      };
    },

    computed: {
      tableItems() {
        console.log(this.itemsToShow);
        let res = this.itemsToShow.map((_arrayElement) =>
          Object.assign({}, _arrayElement)
        );
        for (const item of res) {
          item.precio = `$${Number(
            item.precio.split("$")[1]
          ).toLocaleString()}`;
        }
        return res;
      },
      items() {
        let res = [];
        this.kits.forEach(async (element) => {
          if (!element) return false;
          let price = await this.costs;
          price = price[element.name].reduce((a, b) => a + b.price, 0);
          console.log(price);
          let products = this.productsText;
          let final_price = await this.getFinalPrice(element.name);
          res.push({
            ID: element.id.substr(13),
            nombre: element.name,
            productos: products
              .find((el) => el.name === element.name)
              .p.map((el) => el.p),
            precio: `$${price}`,
            precio_final: `$${final_price.toLocaleString("es-AR")}`,
            ganancia: `$${(final_price - price).toLocaleString("es-AR")}`,
            opt: "",
          });
          this.itemsToShow = res;
        });
        return res;
      },
      async costs() {
        let kitsPrices = {};
        if (!this.kits) return;
        for (const iterator of this.kits) {
          let result = [];
          let costs = [];
          for (const key in iterator.products) {
            try {
              let product = iterator.products[key];
              let priceOfProduct =
                (await this.$store.dispatch("setProductPrice", product.name)) *
                product.quantity;
              costs.push(priceOfProduct);
              result.push({
                name: product.name,
                price: priceOfProduct,
              });
            } catch (error) {
              await db
                .ref(
                  `users/${this.$store.getters["user/userProfile"].uid}/kits/${iterator.name}/products/${iterator.products[key].name}`
                )
                .set(null);
            }
          }
          kitsPrices[iterator.name] = result;
        }
        return kitsPrices;
      },
      ...mapState(["kits"]),
      productsText() {
        if (this.kits) {
          let products = [];

          this.kits.forEach(async (nameOfActualItem) => {
            let query = await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/kits/${nameOfActualItem.name}/products`
              )
              .once("value");

            let p = Object.keys(query.val()).map((el) => {
              return {
                name: el,
                p: `${el}:&nbsp;${Number(
                  query.val()[el].quantity
                ).toLocaleString("es-AR")}`,
              };
            });
            products.push({
              name: nameOfActualItem.name,
              p: p,
            });
            this.showComplete.push({
              name: nameOfActualItem.name,
              show_all: false,
            });
          });
          return products;
        }
      },
    },
    methods: {
      async getFinalPrice(name) {
        let kits_prices = [];
        let formula = (price, profit) =>
          ((1 + profit / 100) * price).toFixed(2).toLocaleString("es-AR");
        let prices = (await this.costs)[name].map(async (el) => {
          let profit = await db
            .ref(
              `users/${this.$store.getters["user/userProfile"].uid}/products/${el.name}/profit`
            )
            .once("value");
          profit = profit.val();
          return Number(formula(el.price, profit));
        });
        prices = await Promise.all(prices);
        kits_prices.push(Number(prices.reduce((a, b) => a + b, 0)));

        return kits_prices;
      },

      deleteKit({ item }) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${item.nombre}`
        ).remove();
      },
      editKit({ item }) {
        this.$store.commit("changeName", item.nombre);
        this.$router.push("ver-kit");
      },
    },
  };
</script>

<style scoped>
  h1 {
    text-align: center;
    padding-top: 20px;
  }
</style>
