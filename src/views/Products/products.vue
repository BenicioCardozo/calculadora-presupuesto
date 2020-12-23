<template>
  <div>
    <h1>Productos</h1>
    <div>
      <div class="buttons-header">
        <b-button
          variant="primary"
          style="margin: 2vh 5vh;"
          size="lg"
          @mouseover="hover = 'rgb(255, 255, 255)'"
          @mouseout="hover = 'rgb(0, 123, 255)'"
          @click="$router.push('crear-producto')"
        >
          Crear<b-icon icon="plus" aria-hidden="true"></b-icon
        ></b-button>
        <filterItems
          :methodOpt="{
            price: ['<', '>'],
            types: [
              'Linón',
              'Tela Puntillé',
              'Lienzo',
              'Cinta PP',
              'Cierre',
              'Etiquetas',
              'Bagún',
              'Cristal',
              'Deslizador',
              'Gabardina',
            ],
          }"
          @setItems="setItems"
          :filtersOpt="['Precio', 'Tipo']"
          :items.sync="items"
          :itemsToShow.sync="itemsToShow"
        >
        </filterItems>
        <!-- <b-dropdown text="Filtrar">
          <b-dropdown-text
            :key="criteria + ' ' + index"
            v-for="(criteria, index) in filtersOpt"
          >
            <h6>Por {{ criteria }}</h6>
            <b-input-group style="display:flex;align-items:center;">
              <template v-if="criteria === 'Precio'" #prepend>
                <b-form-select
                  size="sm"
                  v-model="filter.price.method"
                  :options="methodOpt.price"
                >
                </b-form-select>
              </template>
              <b-form-select
                v-else
                size="sm"
                @change="filterMethod(criteria)"
                v-model="filter.type"
                :options="methodOpt.types"
              >
              </b-form-select>
              <b-form-input
                size="sm"
                v-if="criteria === 'Precio'"
                type="number"
                style="margin: 1vw 1.5vw;"
                v-model="filter.price.number"
                placeholder="$"
                @input="filterMethod(criteria)"
              ></b-form-input>
            </b-input-group>
            <b-dropdown-divider></b-dropdown-divider>
          </b-dropdown-text>
        </b-dropdown>
        <span :key="filter + ' ' + index" v-for="(filter, index) in filters">
          <h5 v-if="filter.name === 'Precio'">
            {{ filter.name }} {{ filter.method }} ${{ filter.number }}
            <b-icon
              icon="trash"
              style="cursor:pointer;"
              @click="deleteFilter(filter.name)"
            ></b-icon>
          </h5>
          <h5 v-else-if="filter.type">
            {{ filter.type }}s
            <b-icon
              icon="trash"
              style="cursor:pointer;"
              @click="deleteFilter('Tipo')"
            ></b-icon>
          </h5>
        </span> -->
      </div>

      <b-table
        striped
        hover
        responsive="md"
        :fields="fields"
        :items="itemsToShow"
        v-if="products"
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
                @click.stop="editProduct(data.value)"
                tabindex="-1"
                variant="info"
              >
                <b-icon icon="pencil" aria-hidden="true"></b-icon>
                Editar
              </b-dropdown-item-button>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="danger"
                @click.stop="deleteProduct(data.value)"
              >
                <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
                Eliminar
              </b-dropdown-item-button>
            </b-dropdown></b-td
          >
        </template></b-table
      >
    </div>
    <!-- <h1>Productos</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="product + ' ' + index"
          v-for="(product, index) in products"
          @click="seeProductInfo(product.name)"
        >
          {{ product.name }}
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editProduct(product.name)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteProduct(product.name)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown>
        </b-button>
        <b-button
          @click="$router.push('crear-producto')"
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
    </div> -->
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import Vue from "vue";
  import filterItems from "./filterItems";

  export default {
    name: "products",
    components: {
      filterItems,
    },
    data() {
      return {
        fields: [
          "nombre",
          "color",
          "calidad",
          "tamaño",
          "materias_primas",
          "ID",
          "precio",
        ],
        items: [],
        itemsToShow: [],
        hover: "rgb(0, 123, 255)",
        prices: {},
      };
    },
    created() {
      this.$store.dispatch("setProducts");
    },
    computed: {
      ...mapState(["products"]),
      async sourceMaterialsText() {
        if (this.$store.state.products) {
          let sourceMaterials = {};

          this.$store.state.products.forEach(async (nameOfActualItem) => {
            let query = await db
              .ref(`products/${nameOfActualItem.name}/sourceMaterials`)
              .once("value");

            let p = Object.keys(query.val()).map((el) => {
              return `${el}: ${query.val()[el].howMuch}`;
            });
            Vue.set(sourceMaterials, nameOfActualItem.name, p.join(", "));
          });

          return sourceMaterials;
        }
      },
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
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      setItems(itemsWithoutFormat) {
        this.items = [];
        if (!itemsWithoutFormat.isChecked) {
          let itemsWithoutFormat = this.products;
          console.log(this.items, itemsWithoutFormat);
          itemsWithoutFormat.forEach(async (element) => {
            let precio = Number(this.prices[element.name])
              .toLocaleString()
              .replace(",", ".");
            let sourceMaterials = await this.sourceMaterialsText;
            if (!element) return false;
            this.items.push({
              nombre: element.name,
              color: element.characteristics.color,
              calidad: element.characteristics.quality,
              tamaño: element.characteristics.size,
              materias_primas: sourceMaterials[element.name],
              ID: element.id.substr(13, element.id.length),
              precio: `$${precio}`,
            });
            this.itemsToShow = this.items;
          });
        } else {
          console.log(itemsWithoutFormat);
          this.items = [...itemsWithoutFormat.items];
        }
      },
      deleteProduct(product) {
        db.ref("/products/" + product).remove();
      },
      editProduct(productName) {
        this.$store.commit("changeName", productName);
        this.$router.push("ver-producto");
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
