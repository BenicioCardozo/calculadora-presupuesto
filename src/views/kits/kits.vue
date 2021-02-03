<template>
  <div>
    <h1>Kits</h1>
    <div>
      <filterItems
        :methodOpt="{
          price: ['<', '>'],
        }"
        :filtersOpt="[{ type: 'Precio', name: 'Costo' }]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-kit"
      >
      </filterItems>

      <b-table hover responsive :items="itemsToShow" v-if="kits">
        <template #cell(productos)="data">
          <span v-if="data.value.length < 3" v-html="data.value.join('<br/>')">
            sads</span
          >
          <div v-else>
            <span
              v-html="
                showComplete.find((el) => el.name === data.item.nombre).show_all
                  ? productsText
                      .find((el) => el.name === data.item.nombre)
                      .p.map((el) => el.p)
                      .join('<br>')
                  : moreExpensiveProducts(data.item.nombre)
              "
            >
            </span>
            <br />
            <span
              @click="
                showComplete.find(
                  (el) => el.name === data.item.nombre
                ).show_all = !showComplete.find(
                  (el) => el.name === data.item.nombre
                ).show_all
              "
              class="text-info"
              style="cursor:pointer;"
            >
              Ver
              {{
                showComplete.find((el) => el.name === data.item.nombre).show_all
                  ? "menos"
                  : "más"
              }}
            </span>
          </div>
        </template>
        <template #cell(precio)="data">{{
          "$" +
            Number(data.value.replace(/[^0-9&.]/g, "")).toLocaleString("es-AR")
        }}</template>
        <template #head(precio)>Costo</template>
        <template #cell(ID)="data">
          <b-td class="text-primary" style="white-space:nowrap;"
            >{{ data.value }}
          </b-td>
        </template>
        <template #head(opt)>{{ `` }}</template>
        <template #cell(opt)="data"
          ><b-dropdown
            no-flip
            right
            style="max-width:100%;"
            variant="white"
            no-caret
          >
            <template #button-content>
              <b-icon
                scale="1.1"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editKit(data)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteKit(data)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown></template
        ></b-table
      >
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";

  export default {
    name: "kits",
    components: {
      filterItems,
    },
    data() {
      return {
        items: [],
        itemsToShow: [],
        showComplete: [],
      };
    },

    computed: {
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
    created() {
      this.setItems(this.kits);
    },

    methods: {
      moreExpensiveProducts(name) {
        let total_sum = [];
        for (const cost of this.costs[name]) {
          total_sum.push({
            name: cost.name,
            final_price: cost.price,
          });
        }
        let names = total_sum
          .sort((a, b) => a.final_price - b.final_price)
          .reverse()
          .map((el) => el.name)
          .slice(0, 2);

        let all_products_paragraph_of_kit = this.productsText.find(
          (el) => el.name === name
        ).p;

        let paragraphs = names.map(
          (product) =>
            all_products_paragraph_of_kit.find((el) => el.name === product).p
        );
        console.log(paragraphs);
        return paragraphs.join("<br/>");
      },
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
      async setItems(itemsWithoutFormat) {
        this.items = [];
        if (!itemsWithoutFormat) return false;
        itemsWithoutFormat.forEach(async (element) => {
          if (!element) return false;
          console.log(this.costs);
          let price = await this.costs;
          price = price[element.name].reduce((a, b) => a + b.price, 0);
          let products = this.productsText;
          let final_price = await this.getFinalPrice(element.name);
          this.items.push({
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
          this.itemsToShow = this.items;
        });
      },
      deleteKit({ item }) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${item.nombre}`
        ).remove();
        this.items.splice(
          this.items.findIndex((el) => el.nombre === item.nombre),
          1
        );
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
