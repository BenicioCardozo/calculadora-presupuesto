<template>
  <div>
    <h1>Productos</h1>
    <div>
      <filterItems
        :filtersOpt="[
          {
            type: 'Precio',
            name: 'Costo',
          },
          {
            name: 'Tipo',
            type: 'Tipo',
            propToCompare: 'tipo',
            types: ['Sss', 'Aaaa'],
          },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-producto"
      ></filterItems>

      <table-component
        lettersForId="PR"
        :itemsToShow="tableItems"
        @deleteItem="deleteProduct"
        @editItem="editProduct"
      >
        <template #materias_primas="slotProps">
          <span
            v-if="slotProps.data.value.length < 4"
            v-html="slotProps.data.value.join('<br/>')"
          ></span>
          <div v-else>
            <span
              v-html="
                !showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
                  ? sourceMaterialsText[slotProps.data.item.nombre].length
                  : sourceMaterialsText[slotProps.data.item.nombre].join('<br>')
              "
            >
            </span>
            <br
              v-if="
                showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
              "
            />
            <span
              @click="
                showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all = !showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
              "
              class="text-info mt-5"
              style="cursor:pointer;"
            >
              Ver
              {{
                !showComplete.find(
                  (el) => el.name === slotProps.data.item.nombre
                ).show_all
                  ? "más"
                  : "menos"
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
  import idCreator from "../../mixins/idCreator";
  import tableComponent from "../../components/table";
  export default {
    name: "products",
    mixins: [idCreator],
    components: {
      filterItems,
      tableComponent,
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
      tableItems() {
        let res = this.itemsToShow.map((_arrayElement) =>
          Object.assign({}, _arrayElement)
        );
        for (const item of res) {
          item.precio = `$${Number(
            item.precio.split("$")[1]
          ).toLocaleString()}`;
          item.opt = "";
        }
        return res;
      },
      sourceMaterialsText() {
        let sourceMaterials = {};
        for (const nameOfActualItem of this.products) {
          let query = this.products.find(
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
      items() {
        let texts = this.sourceMaterialsText;
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
      async prices() {
        let result = {};
        for (const key in this.products) {
          const element = this.products[key];
          let price = await this.$store.dispatch(
            "setProductPrice",
            element.name
          );
          console.log(price);
          result[element.name] = price;
        }
        return result;
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
