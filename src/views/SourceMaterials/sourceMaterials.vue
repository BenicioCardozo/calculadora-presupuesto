<template>
  <div>
    <h1>Materias Primas</h1>
    <div>
      <b-button
        variant="primary"
        style="margin: 2vh 5vh;"
        size="lg"
        @mouseover="hover = 'rgb(255, 255, 255)'"
        @mouseout="hover = 'rgb(0, 123, 255)'"
        @click="$router.push('crear-materia-prima')"
      >
        Crear<b-icon icon="plus" aria-hidden="true"></b-icon
      ></b-button>
      <b-table
        striped
        hover
        responsive="md"
        :fields="fields"
        :items="items"
        v-if="sourceMaterials"
      >
        <template #cell(nombre)="data">
          <!-- `data.value` is the value after formatted by the Formatter -->
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
    <!-- <div class="container">
      <b-button
        variant="primary"
        :key="sourceMaterial + ' ' + index"
        v-for="(sourceMaterial, index) in sourceMaterials"
        @click.self="seeSourceMaterialInfo(sourceMaterial.name)"
      >
        {{ sourceMaterial.name }}
        <div>
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editSourceMaterial(sourceMaterial.name)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil" aria-hidden="true"></b-icon>
              Editar
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteSourceMaterial(sourceMaterial.name)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown>
        </div>
      </b-button>
      <b-button
        @click="$router.push('crear-materia-prima')"
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
    </div> -->
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";

  export default {
    name: "source-materials",
    data() {
      return {
        hover: "rgb(0, 123, 255)",
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
      };
    },
    beforeCreate() {
      this.$store.dispatch("setSourceMaterials");
    },
    computed: {
      ...mapState(["sourceMaterials"]),
    },
    watch: {
      sourceMaterials: {
        handler(newItems) {
          if (newItems) {
            this.items = [];
            newItems.forEach((element) => {
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
          }
        },
        immediate: true,
      },
    },
    methods: {
      deleteSourceMaterial(sourceMaterial) {
        db.ref(`/sourceMaterials/${sourceMaterial}`).remove();
      },
      editSourceMaterial(sourceMaterialName) {
        this.$store.commit("changeName", sourceMaterialName);
        this.$router.push("ver-materia-prima");
      },
    },
  };
</script>

<style>
  .table th,
  .table td {
    vertical-align: middle !important;
  }
</style>
