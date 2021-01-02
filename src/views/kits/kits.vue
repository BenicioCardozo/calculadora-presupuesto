<template>
  <div>
    <h1>Kits</h1>
    <div>
      <div class="buttons-header">
        <b-button
          variant="primary"
          style="margin: 2vh 5vh;"
          size="lg"
          @click="$router.push('crear-kit')"
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

      <b-table
        striped
        hover
        responsive="sm"
        :fields="fields"
        :items="itemsToShow"
        v-if="kits"
      >
        <template #cell(nombre)="data">
          <b-td class="text-primary" style="white-space:nowrap;"
            >{{ data.value }}
            <b-dropdown variant="white" no-caret>
              <template #button-content>
                <b-icon
                  scale="0.9"
                  icon="three-dots-vertical"
                  aria-hidden="true"
                ></b-icon>
              </template>
              <b-dropdown-item-button
                @click.stop="editKit(data.value)"
                tabindex="-1"
                variant="info"
              >
                <b-icon icon="pencil" aria-hidden="true"></b-icon>
                Editar
              </b-dropdown-item-button>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="danger"
                @click.stop="deleteKit(data.value)"
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
    name: "kits",
    components: {
      filterItems,
    },
    data() {
      return {
        items: [],
        itemsToShow: [],
        prices: {},
        fields: ["nombre", "productos", "id", "precio"],
      };
    },
    created() {
      this.$store.dispatch("setKits");
    },
    computed: {
      ...mapState(["kits"]),
      async productsText() {
        if (this.kits) {
          let products = {};

          this.kits.forEach(async (nameOfActualItem) => {
            let query = await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/kits/${nameOfActualItem.name}/products`
              )
              .once("value");

            let p = Object.keys(query.val()).map((el) => {
              return `${el}: ${query.val()[el].quantity}`;
            });
            Vue.set(products, nameOfActualItem.name, p.join(", "));
          });
          return products;
        }
      },
    },
    watch: {
      kits: {
        async handler(newVal, oldVal) {
          let result = {};
          let kitsPrices = {};
          for (const iterator of newVal) {
            let result = {};
            let prices = [];
            for (const key in iterator.products) {
              let product = iterator.products[key];
              let priceOfProduct =
                (await this.$store.dispatch("setProductPrice", product.name)) *
                product.quantity;
              prices.push(priceOfProduct);
              let finalPrice = prices.reduce((a, b) => a + b, 0);
              Vue.set(result, iterator.name, finalPrice);
            }
            kitsPrices[iterator.name] = Object.values(result)[0];
          }
          this.prices = kitsPrices;
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      async setItems() {
        this.items = [];
        let itemsWithoutFormat = this.kits;
        if (itemsWithoutFormat) {
          itemsWithoutFormat.forEach(async (element) => {
            if (!element) return false;
            let price = this.prices[element.name];
            let products = await this.productsText;
            this.items.push({
              nombre: element.name,
              productos: products[element.name],
              id: element.id.substr(13),
              precio: `$${price.toLocaleString("es-AR")}`,
            });
            this.itemsToShow = this.items;
          });
        }
      },
      deleteKit(kit) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${kit}`
        ).remove();
      },
      editKit(kit) {
        this.$store.commit("changeName", kit);
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
