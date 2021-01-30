<template>
  <div>
    <h1>Materias Primas</h1>
    <div>
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
            'Mano de Obra',
          ],
        }"
        :filtersOpt="[
          { type: 'Precio', name: 'Costo' },
          { name: 'Tipo', type: 'Tipo' },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-materia-prima"
      ></filterItems>
      <b-alert :show="showAlert">
        <div>
          <h4>¿Seguro que querés eliminarla?</h4>
          <h5 v-if="productsText">
            {{ productsText }}
          </h5>
        </div>
        <span>
          <b-button variant="primary" @click="handleRemoval()"
            >Aceptar</b-button
          >
          <b-button variant="danger" @click="handleCancelationOfRemoval()"
            >Cancelar</b-button
          >
        </span>
      </b-alert>
      <b-table
        hover
        responsive="lg"
        :items="itemsToShow"
        v-if="sourceMaterials"
      >
        <template #cell(precio)="data" style="white-space: nowrap;">
          {{
            `$${Number(data.value.replace(/[^0-9&.]/g, "")).toLocaleString(
              "es-AR"
            )}/${data.value.split("/")[1]}`
          }}
        </template>
        <template #head(precio)>Costo</template>
        <template #cell(ID)="data">
          <b-td class="text-primary">
            {{ data.value }}
          </b-td>
        </template>
        <template #head(opt)> {{ "" }}</template>
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
              @click.stop="editSourceMaterial(data)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteSourceMaterial(data)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown></template
        >
      </b-table>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";
  export default {
    name: "source-materials",
    components: {
      filterItems,
    },
    data() {
      return {
        fields: [
          "ID",
          "nombre",
          "color",
          "calidad",
          "tipo",
          "proveedor",
          "precio",
          "opt",
        ],
        itemsToShow: [],
        sourceMaterialsWithProducts: undefined,
        showAlert: false,
        sourceMaterialToEliminateIndex: "",
        sourceMaterialToEliminate: undefined,
      };
    },

    computed: {
      ...mapState(["sourceMaterials"]),
      items() {
        let items = [];
        this.sourceMaterials.forEach((element) => {
          items.push({
            ID: element.id.substr(13, element.id.length),
            nombre: element.name,
            color: element.characteristics.color,
            calidad: element.characteristics.quality,
            tipo: element.characteristics.type,
            proveedor: element.characteristics.supplier,
            precio: `$${element.price.amount}/${element.price.measurementUnit}`,
            opt: null,
          });
        });
        this.itemsToShow = items;
        return items;
      },
      productsText() {
        if (!this.sourceMaterialsWithProducts) return false;
        if (
          this.sourceMaterialsWithProducts[this.sourceMaterialToEliminateIndex]
        ) {
          let productsText = this.sourceMaterialsWithProducts[
            this.sourceMaterialToEliminateIndex
          ].products.join(", ");
          productsText = productsText.replace(/,([^,]*)$/, " y $1");
          return `${productsText} llevan ${this.sourceMaterialToEliminate}`;
        } else {
          return "";
        }
      },
    },

    async mounted() {
      //For Prompt
      let result = [];
      let products_req = await db
        .ref(`users/${this.$store.getters["user/userProfile"].uid}/products`)
        .once("value");
      if (!products_req.val()) return false;
      let productsArray = Object.keys(products_req.val());
      for (const product of productsArray) {
        let sourceMaterials = await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/products/${product}/sourceMaterials`
          )
          .once("value");

        for (const sourceMaterial of Object.keys(sourceMaterials.val())) {
          if (result.some((el) => el.name === sourceMaterial)) {
            //Exists in array
            let indexOfSourceMaterial = result
              .map((el) => el.name)
              .indexOf(sourceMaterial);
            result[indexOfSourceMaterial].products.push(product);
          } else {
            result.push({
              name: sourceMaterial,
              products: [product],
            });
          }
        }
      }
      this.sourceMaterialsWithProducts = result;
    },
    methods: {
      async handleRemoval() {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.sourceMaterialToEliminate}`
          )
          .remove();
        this.showAlert = false;
      },
      handleCancelationOfRemoval() {
        this.showAlert = false;
      },
      async deleteSourceMaterial(sourceMaterial) {
        this.sourceMaterialToEliminate = sourceMaterial.item.nombre;
        if (this.sourceMaterialsWithProducts) {
          let indexOfSourceMaterial = this.sourceMaterialsWithProducts
            .map((el) => el.name)
            .indexOf(sourceMaterial.item.nombre);
          this.sourceMaterialToEliminateIndex = indexOfSourceMaterial;
        }
        this.showAlert = true;
      },
      editSourceMaterial(sourceMaterial) {
        this.$store.commit("changeName", sourceMaterial.item.nombre);
        this.$router.push("ver-materia-prima");
      },
    },
  };
</script>

<style scoped>
  .alert {
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: space-evenly;
    flex-flow: column wrap;
    align-items: center;
    z-index: 9999;
    outline: 10000px solid rgba(0, 0, 0, 0.418);
    box-shadow: 0 0 0.4em #7e7e7e;
  }
  .alert > * {
    margin: 3vh 1vw;
    width: 100%;
  }
  .alert > span {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }
  .alert > span > button {
    min-width: 100px;
    margin: 1vh 0;
  }
  @media screen and (max-width: 400px) {
    .alert {
      width: 100%;
    }
  }
</style>
