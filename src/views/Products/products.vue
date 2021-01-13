<template>
  <div>
    <h1>Productos</h1>
    <div>
      <filterItems
        :methodOpt="{
          price: ['<', '>'],
          types: ['Sss', 'Aaaa'],
        }"
        @setItems="setItems"
        :filtersOpt="[
          { type: 'Precio', name: 'Precio' },
          { name: 'Tipo', type: 'Tipo' },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-producto"
      >
      </filterItems>

      <b-table
        striped
        hover
        responsive
        :fields="fields"
        :items="itemsToShow"
        v-if="products"
      >
        <template #cell(materias_primas)="data">
          <span
            v-if="data.value.length < 3"
            v-html="data.value.join('<br/>')"
          ></span>
          <div v-else>
            <span
              v-html="
                showComplete.find((el) => el.name === data.item.nombre).show_all
                  ? sourceMaterialsText[data.item.nombre].join('<br>')
                  : moreExpensiveSourceMaterials(data.value, data.item.nombre)
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
          ><b-dropdown right style="max-width:100%;" variant="white" no-caret>
            <template #button-content>
              <b-icon
                scale="1.1"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editProduct(data)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteProduct(data)"
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
  import Vue from "vue";
  import filterItems from "../../components/filterItems";

  export default {
    name: "products",
    components: {
      filterItems,
    },
    data() {
      return {
        fields: [
          "ID",
          "nombre",
          "tipo",
          "color",
          "calidad",
          "tamaño",
          "materias_primas",
          "precio",
          "precio_final",
          "ganancia",
          "opt",
        ],
        items: [],
        itemsToShow: [],
        prices: {},
        showComplete: [],
        sourceMaterialsTex: undefined,
      };
    },
    created() {
      this.$store.dispatch("setProducts");
    },
    computed: {
      ...mapState(["products"]),
    },

    watch: {
      products: {
        async handler(newVal, oldVal) {
          let result = {};
          for (const key in newVal) {
            const element = newVal[key];
            let price = await this.$store.dispatch(
              "setProductPrice",
              element.name
            );
            Vue.set(result, element.name, price);
          }
          this.prices = result;

          if (newVal) {
            let sourceMaterials = {};
            for (const nameOfActualItem of newVal) {
              let query = await db
                .ref(
                  `users/${this.$store.getters["user/userProfile"].uid}/products/${nameOfActualItem.name}/sourceMaterials`
                )
                .once("value");

              let p = Object.keys(query.val()).map((el) => {
                return `${el}: ${Number(query.val()[el].howMuch).toLocaleString(
                  "es-AR"
                )}`;
              });

              sourceMaterials[nameOfActualItem.name] = p;

              this.showComplete.push({
                name: nameOfActualItem.name,
                show_all: false,
              });
            }
            this.sourceMaterialsText = sourceMaterials;
          }
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      moreExpensiveSourceMaterials(array, product) {
        let prices = [];
        for (const iterator of array) {
          db.ref(
            `users/${
              this.$store.getters["user/userProfile"].uid
            }/sourceMaterials/${iterator.split(":")[0]}/price/amount`
          ).once("value", (snap) => {
            let result = snap.val() * iterator.split(":")[1];
            prices.push({ name: iterator.split(":")[0], price: result });
          });
        }
        let result = prices
          .sort((a, b) => a.price - b.price)
          .reverse()
          .slice(0, 3);
        let parapraph = result.map((el) =>
          array.find((text) => text.includes(el.name))
        );
        return parapraph.join("<br>");
      },
      setItems() {
        this.items = [];
        let itemsWithoutFormat = this.products;
        if (itemsWithoutFormat) {
          itemsWithoutFormat.forEach(async (element) => {
            let precio = Number(this.prices[element.name]);
            let sourceMaterials = this.sourceMaterialsText;
            if (!element) return false;
            this.items.push({
              ID: element.id.substr(13),
              nombre: element.name,
              tipo: element.type,
              color: element.characteristics.color,
              calidad: element.characteristics.quality,
              tamaño: element.characteristics.size,
              materias_primas: sourceMaterials[element.name],
              precio: `$${precio}`,
              precio_final: `$3`,
              ganancia: `$${element.profit}`,
            });
            this.itemsToShow = this.items;
          });
        }
      },
      deleteProduct(product) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/products/${product.item.nombre}`
        ).remove();
      },
      editProduct(productName) {
        this.$store.commit("changeName", productName.item.nombre);
        this.$router.push("ver-producto");
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
