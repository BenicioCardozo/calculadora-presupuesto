<template>
  <div id="container">
    <div class="buttons-header">
      <b-button variant="primary" @click="$router.push(action)">
        Crear&nbsp;<b-icon icon="plus" aria-hidden="true"></b-icon
      ></b-button>
      <b-dropdown text="Filtrar">
        <b-dropdown-form>
          <b-dropdown-text
            :key="criteria + ' ' + index"
            v-for="(criteria, index) in filtersOpt"
          >
            <h6>Por {{ criteria.name }}</h6>
            <b-input-group style="display: flex; align-items: center">
              <template v-if="criteria.type === 'Precio'" #prepend>
                <b-form-select
                  size="sm"
                  v-model="filter.price.method"
                  :options="methodOpt.price"
                >
                </b-form-select>
              </template>
              <b-form-select
                v-else-if="criteria.type === 'Tipo'"
                size="sm"
                @change="filterMethod(criteria.type)"
                v-model="filter.type"
                :options="methodOpt.types"
              >
              </b-form-select>

              <b-form-input
                size="sm"
                v-if="criteria.type === 'Precio'"
                type="number"
                style="margin: 1vw 1.5vw"
                v-model="filter.price.number"
                placeholder="$"
                @input="filterMethod(criteria.type)"
              ></b-form-input>
            </b-input-group>
            <b-dropdown-divider></b-dropdown-divider>
          </b-dropdown-text>
        </b-dropdown-form>
      </b-dropdown>
    </div>
    <span :key="filter + ' ' + index" v-for="(filter, index) in filters">
      <h5 v-if="filter.name === 'Precio'">
        {{ filtersOpt.find((el) => el.type === "Precio").name }}
        {{ filter.method }} ${{ Number(filter.number).toLocaleString("es-AR") }}
        <b-icon
          icon="trash"
          style="cursor:pointer;"
          @click="deleteFilter(filter.name, 'price')"
        ></b-icon>
      </h5>
      <h5 v-else-if="filter.type">
        {{ filter.type }}
        <b-icon
          icon="trash"
          style="cursor:pointer;"
          @click="deleteFilter('Tipo', 'type')"
        ></b-icon>
      </h5>
    </span>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import Vue from "vue";

  export default {
    props: ["filtersOpt", "methodOpt", "items", "itemsToShow", "action"],
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
      };
    },
    watch: {
      filters: {
        handler(newFilters) {
          this.applyFilters(newFilters);
        },
        deep: true,
      },
    },
    computed: {
      ...mapState(["products"]),
    },
    methods: {
      deleteFilter(filter, filterProp) {
        this.filter[filterProp].number
          ? (this.filter[filterProp].number = "")
          : (this.filter[filterProp] = undefined);
        Vue.delete(this.filters, filter);
        this.applyFilters(this.filters);
      },
      filterMethod(criteria) {
        if (criteria === "Precio") {
          if (this.filter.price.number == (undefined || "")) return false;
          Vue.set(this.filters, criteria, {
            number: this.filter.price.number,
            method: this.filter.price.method,
            name: criteria,
          });
        } else if (criteria === "Tipo") {
          Vue.set(this.filters, criteria, {
            type: this.filter.type,
          });
        }
        this.applyFilters(this.filters);
      },
      applyFilters(filters) {
        if (Object.values(filters).length < 1)
          this.$emit("update:itemsToShow", this.items);
        for (const key in filters) {
          if (key === "Precio") {
            let filteredItems = this.items.filter((item) => {
              return filters[key].method === ">"
                ? Number(item.precio.replace(/[^0-9&.]/g, "")) >
                    Number(filters[key].number)
                : Number(item.precio.replace(/[^0-9&.]/g, "")) <
                    Number(filters[key].number);
            });
            this.$emit("update:itemsToShow", filteredItems);
          } else if (key === "Tipo") {
            let filteredItems = this.items.filter((item) => {
              return (
                item[
                  this.filtersOpt.find((el) => el.type === "Tipo")
                    .propToCompare || "tipo"
                ] === filters[key].type
              );
            });
            this.$emit("update:itemsToShow", filteredItems);
          }
        }
      },
    },
  };
</script>

<style scoped>
  div.dropdown,
  button {
    flex-basis: 30vw;
    min-width: 200px;
  }
  .buttons-header > * {
    margin: 1.2vh 0 2vh 0;
  }
  .buttons-header {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    align-items: center;
  }
  h6,
  h5 {
    margin: 0 0 2vh;
    text-align: center;
  }
</style>
