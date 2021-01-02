<template>
  <div>
    <h1>Productos</h1>
    <div>
      <div class="buttons-header">
        <b-button
          variant="primary"
          style="margin: 2vh 5vh;"
          size="lg"
          @click="$router.push('crear-producto')"
        >
          Crear<b-icon icon="plus" aria-hidden="true"></b-icon
        ></b-button>
        <filterItems
          :methodOpt="{
            price: ['<', '>'],
            types: ['Sss', 'Aaaa'],
          }"
          @setItems="setItems"
          :filtersOpt="['Precio', 'Tipo']"
          :items.sync="items"
          :itemsToShow.sync="itemsToShow"
        >
        </filterItems>
      </div>

      <b-table
        striped
        hover
        responsive="md"
        :fields="fields"
        :items="itemsToShow"
        v-if="products"
      >
        <template #cell(materias_primas)="data">
          <span v-html="data.value"></span>
        </template>
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
          "nombre",
          "tipo",
          "color",
          "calidad",
          "tamaño",
          "materias_primas",
          "ID",
          "precio",
        ],
        items: [],
        itemsToShow: [],
        prices: {},
      };
    },
    created() {
      this.$store.dispatch("setProducts");
    },
    computed: {
      ...mapState(["products"]),
      async sourceMaterialsText() {
        if (this.products) {
          let sourceMaterials = {};

          this.products.forEach(async (nameOfActualItem) => {
            let query = await db
              .ref(
                `users/${this.$store.getters["user/userProfile"].uid}/products/${nameOfActualItem.name}/sourceMaterials`
              )
              .once("value");

            let p = Object.keys(query.val()).map((el) => {
              return `${el}: ${query.val()[el].howMuch}`;
            });
            Vue.set(sourceMaterials, nameOfActualItem.name, p.join("<br/>"));
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
      setItems() {
        this.items = [];
        let itemsWithoutFormat = this.products;
        if (itemsWithoutFormat) {
          itemsWithoutFormat.forEach(async (element) => {
            let precio = Number(this.prices[element.name])
              .toLocaleString()
              .replace(",", ".");
            let sourceMaterials = await this.sourceMaterialsText;
            if (!element) return false;
            this.items.push({
              nombre: element.name,
              tipo: element.type,
              color: element.characteristics.color,
              calidad: element.characteristics.quality,
              tamaño: element.characteristics.size,
              materias_primas: sourceMaterials[element.name],
              ID: element.id.substr(13),
              precio: `$${precio}`,
            });
            this.itemsToShow = this.items;
          });
        }
      },
      deleteProduct(product) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/products/${product}`
        ).remove();
      },
      editProduct(productName) {
        this.$store.commit("changeName", productName);
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
