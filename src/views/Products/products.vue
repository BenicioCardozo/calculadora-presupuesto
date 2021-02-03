<template>
  <div>
    <h1>Productos</h1>
    <div>
      <filterItems
        :methodOpt="{
          price: ['<', '>'],
          types: ['Sss', 'Aaaa'],
        }"
        :filtersOpt="[
          { type: 'Precio', name: 'Costo' },
          { name: 'Tipo', type: 'Tipo' },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-producto"
      >
      </filterItems>

      <b-table
        hover
        responsive
        :fields="fields"
        :items="itemsToShow"
        v-if="products"
      >
        <template #cell(materias_primas)="data">
          <span
            v-if="data.value.length < 4"
            v-html="data.value.join('<br/>')"
          ></span>
          <div v-else>
            <span
              v-html="
                showComplete.find((el) => el.name === data.item.nombre).show_all
                  ? sourceMaterialsText[data.item.nombre].join('<br>')
                  : moreExpensiveSourceMaterials(data.value)
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
          "margen_de_ganancia",
          "ganancia",
          "opt",
        ],
        itemsToShow: [],
        showComplete: [],
      };
    },
    computed: {
      items() {
        let texts = this.sourceMaterialsText();
        console.log(texts);
        if (this.products) {
          let items = [];
          this.products.forEach(async (element) => {
            let price = await this.prices();
            price = Number(price[element.name]);
            console.log(texts);
            if (!element) return false;
            items.push({
              ID: element.id.substr(13),
              nombre: element.name,
              tipo: element.type,
              color: element.characteristics.color,
              calidad: element.characteristics.quality,
              tamaño: element.characteristics.size,
              materias_primas: texts[element.name],
              precio: `$${price}`,
              precio_final: `$${Number(
                await this.getFinalPrice(element.name, element.profit)
              ).toLocaleString("es-AR")}`,
              margen_de_ganancia: `${element.profit.toLocaleString("es-AR")}%`, //Profit Margin *
              ganancia: `$${Number(
                (
                  (await this.getFinalPrice(element.name, element.profit)) -
                  price
                ).toFixed(2)
              ).toLocaleString("es-AR")}`,
            });
          });
          this.itemsToShow = items;
          return items;
        }
      },
      ...mapState(["products"]),
    },
    methods: {
      sourceMaterialsText() {
        let sourceMaterials = {};
        for (const nameOfActualItem of this.products) {
          let query = this.$store.state.products.find(
            (el) => el.name === nameOfActualItem.name
          ).sourceMaterials;
          let p = Object.keys(query).map((el) => {
            return `${el}:&nbsp;${Number(query[el].howMuch).toLocaleString(
              "es-AR"
            )}`;
          });
          sourceMaterials[nameOfActualItem.name] = p;
          this.showComplete.push({
            name: nameOfActualItem.name,
            show_all: false,
          });
        }
        return sourceMaterials;
      },
      async prices() {
        let result = {};
        for (const key in this.products) {
          const element = this.products[key];
          let price = await this.$store.dispatch(
            "setProductPrice",
            element.name
          );
          result[element.name] = price;
        }
        return result;
      },
      moreExpensiveSourceMaterials(array) {
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
      async getFinalPrice(name, profit) {
        let prices = await this.prices();
        console.log(prices);
        return ((1 + profit / 100) * prices[name])
          .toFixed(2)
          .toLocaleString("es-AR");
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
