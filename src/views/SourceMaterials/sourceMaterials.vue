<template>
  <div>
    <h1>Materias Primas</h1>
    <div>
      <div class="buttons-header">
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
        <b-dropdown text="Filtrar">
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
            {{ filter.type }}
            <b-icon
              icon="trash"
              style="cursor:pointer;"
              @click="deleteFilter('Tipo')"
            ></b-icon>
          </h5>
        </span>
      </div>
      <b-table
        striped
        hover
        responsive="md"
        :fields="fields"
        :items="items"
        v-if="sourceMaterials"
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
  import Vue from "vue";
  export default {
    name: "source-materials",
    data() {
      return {
        filters: {},
        filter: {
          price: {
            method: ">",
            number: "",
          },
          type: undefined,
        },
        filtersOpt: ["Precio", "Tipo"],
        hover: "rgb(0, 123, 255)",
        methodOpt: {
          price: ["<", ">"],
          types: [
            "Linón",
            "Tela Puntillé",
            "Lienzo",
            "Cinta PP",
            "Cierre",
            "Etiquetas",
            "Bagún",
            "Cristal",
            "Deslizador",
            "Gabardina",
          ],
        },
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
          this.setItems(newItems);
        },
        immediate: true,
      },
      filters: {
        handler(newFilters) {
          this.applyFilters(newFilters);
        },
        deep: true,
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
      applyFilters(filters) {
        console.log(filters);
        this.setItems(this.sourceMaterials);
        for (const key in filters) {
          if (key === "Precio") {
            this.items = this.items.filter((item) => {
              return filters[key].method === ">"
                ? Number(item.precio.replace(/[^0-9]/g, "")) >
                    Number(filters[key].number)
                : Number(item.precio.replace(/[^0-9]/g, "")) <
                    Number(filters[key].number);
            });
          } else if (filters[key].type) {
            this.items = this.items.filter((item) => {
              return item.tipo === filters[key].type;
            });
          }
        }
      },
      setItems(itemsWithoutFormat) {
        if (itemsWithoutFormat) {
          this.items = [];
          itemsWithoutFormat.forEach((element) => {
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
      filterMethod(criteria) {
        this.applyFilters(this.filters);
        if (criteria === "Precio") {
          Vue.set(this.filters, criteria, {
            number: this.filter.price.number,
            method: this.filter.price.method,
            name: criteria,
          });
        } else {
          Vue.set(this.filters, criteria, {
            type: this.filter.type,
          });
        }
      },
      deleteFilter(filter) {
        Vue.delete(this.filters, filter);
        if (filter !== "Precio") {
          this.filter.type = undefined;
        } else {
          this.filter.price.number = "";
        }
        this.setItems(this.sourceMaterials);
        console.log(this.items);
      },
    },
  };
</script>

<style></style>
