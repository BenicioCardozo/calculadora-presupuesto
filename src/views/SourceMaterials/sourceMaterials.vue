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
        @setItems="setItems"
        :filtersOpt="['Precio', 'Tipo']"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
      ></filterItems>
      <b-table
        hover
        responsive="md"
        :fields="fields"
        :items="itemsToShow"
        v-if="sourceMaterials"
      >
        <template #cell(precio)="data">
          {{
            `$${Number(data.value.replace(/[^0-9&.]/g, "")).toLocaleString(
              "es-AR"
            )}/${data.value.split("/")[1]}`
          }}
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
                @click.stop="editSourceMaterial(data.value)"
                tabindex="-1"
                variant="info"
              >
                <b-icon icon="pencil" aria-hidden="true"></b-icon>
                Editar
              </b-dropdown-item-button>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="danger"
                @click.stop="deleteSourceMaterial(data.value)"
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
    name: "source-materials",
    components: {
      filterItems,
    },
    data() {
      return {
        fields: [
          "nombre",
          "color",
          "calidad",
          "tipo",
          "proveedor",
          "ID",
          "precio",
        ],
        items: [],
        itemsToShow: [],
      };
    },
    created() {
      this.$store.dispatch("setSourceMaterials");
    },
    computed: {
      ...mapState(["sourceMaterials"]),
    },
    watch: {
      sourceMaterials: {
        handler(newItems) {
          this.setItems(newItems);
        },
        immediate: true,
      },
    },
    methods: {
      deleteSourceMaterial(sourceMaterial) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${sourceMaterial}`
        ).remove();
      },
      editSourceMaterial(sourceMaterialName) {
        this.$store.commit("changeName", sourceMaterialName);
        this.$router.push("ver-materia-prima");
      },

      setItems(itemsWithoutFormat) {
        if (!itemsWithoutFormat.characteristics) {
          //Unformatted
          this.items = [];
          itemsWithoutFormat.forEach((element) => {
            console.log(element);

            this.items.push({
              nombre: element.name,
              color: element.characteristics.color,
              calidad: element.characteristics.quality,
              tipo: element.characteristics.type,
              proveedor: element.characteristics.supplier,
              ID: element.id.substr(13, element.id.length),
              precio: `$${element.price.amount}/${element.price.measurementUnit}`,
            });
          });
          this.itemsToShow = this.items;
        }
      },
    },
  };
</script>

<style></style>
