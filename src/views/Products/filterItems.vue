<template>
  <div>
    <b-dropdown text="Filtrar">
      <b-dropdown-text
        :key="criteria + ' ' + index"
        v-for="(criteria, index) in filtersOpt"
      >
        <h6>Por {{ criteria }}</h6>
        <b-input-group style="display: flex; align-items: center">
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
            style="margin: 1vw 1.5vw"
            v-model="filter.price.number"
            placeholder="$"
            @input="filterMethod(criteria)"
          ></b-form-input>
        </b-input-group>
        <b-dropdown-divider></b-dropdown-divider>
      </b-dropdown-text>
    </b-dropdown>
    <span> </span>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import Vue from "vue";
  export default {
    props: ["filtersOpt", "methodOpt", "items", "itemsToShow"],
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
      filterMethod(criteria) {
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
        this.applyFilters(this.filters);
      },
      applyFilters(filters) {
        for (const key in filters) {
          if (key === "Precio") {
            this.items.forEach((element) => console.log(element.precio));
            let filteredItems = this.items.filter((item) => {
              return filters[key].method === ">"
                ? Number(item.precio.replace(/[^0-9]/g, "")) >
                    Number(filters[key].number)
                : Number(item.precio.replace(/[^0-9]/g, "")) <
                    Number(filters[key].number);
            });
            this.$emit("update:itemsToShow", filteredItems);
          } else if (filters[key].type) {
            this.items = this.items.filter((item) => {
              return item.tipo === filters[key].type;
            });
          }
        }
      },
    },
  };
</script>

<style scoped>
  div.dropdown {
    margin: 3vh auto !important;
    width: 30vw;
  }
  .buttons-header > * {
    margin: auto;
  }
</style>
