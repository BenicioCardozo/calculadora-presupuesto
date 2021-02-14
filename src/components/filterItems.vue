<template>
  <div id="container">
    <div class="buttons-header">
      <b-button variant="primary" @click="$router.push(action)">
        Crear&nbsp;<b-icon icon="plus" aria-hidden="true"></b-icon
      ></b-button>
      <b-dropdown text="Filtrar">
        <b-dropdown-form>
          <b-dropdown-text
            :key="name + ' ' + index"
            v-for="({ name, type, types }, index) in filtersOpt"
          >
            <h6 class="mb-3">Por {{ name }}</h6>
            <b-input-group>
              <template v-if="type === 'Precio'">
                <b-form-input
                  size="sm"
                  type="number"
                  placeholder="$ Mínimo"
                  class="mb-2"
                  v-model.number="priceFilters.min"
                ></b-form-input>
                <b-form-input
                  size="sm"
                  type="number"
                  placeholder="$ Máximo"
                  class="mb-2"
                  v-model.number="priceFilters.max"
                  ref="priceInputMax"
                ></b-form-input>
              </template>
              <template v-else>
                <b-form-select size="sm" :options="types" v-model="typeFilters">
                </b-form-select
              ></template>
            </b-input-group>
            <b-dropdown-divider></b-dropdown-divider>
          </b-dropdown-text>
        </b-dropdown-form>
      </b-dropdown>
    </div>
    <span
      class="filters-list"
      v-if="priceFilters.max || priceFilters.min || typeFilters"
    >
      <span :key="key" v-for="(value, key) in onlyValidFilters">
        <h5
          :style="[
            isMinValueHigherThanMaxValue && key === 'Precio'
              ? { color: 'rgb(217, 68, 24)' }
              : null,
          ]"
        >
          {{
            typeof value === "object"
              ? `Mínimo $${value.min.toLocaleString("es-AR") || 0} ${
                  value.max
                    ? ` - Maximo $${value.max.toLocaleString("es-AR")}`
                    : ""
                }`
              : value
            /* pluralize function!*/
          }}
        </h5>
      </span>
      <b-button
        class="mb-3 mt-1"
        @click="deleteAllFilters"
        size="sm"
        variant="outline-danger"
        >Eliminar Filtros</b-button
      >
    </span>
  </div>
</template>

<script>
  export default {
    props: {
      filtersOpt: Array,
      items: Array,
      itemsToShow: Array,
      action: String,
    },
    data() {
      return {
        priceFilters: {
          min: undefined,
          max: undefined,
        },
        typeFilters: undefined,
        minIsGreaterThanMax: false,
      };
    },
    watch: {
      items: {
        handler() {
          this.deleteAllFilters();
        },
        deep: true,
      },
      priceFilters: {
        async handler(newValue, oldValue) {
          console.log(!newValue);
          if (!newValue) {
            await this.deleteFilter({ filterType, isMinOrMax });
            return;
          }
          await this.emitWrapedInAPromise("update:itemsToShow", this.items);

          let isMinOrMax = newValue.min === oldValue.min ? "min" : "max";
          this.applyFilters(this.itemsToShow);
        },
        deep: true,
      },
      async typeFilters() {
        await this.emitWrapedInAPromise("update:itemsToShow", this.items);
        this.applyFilters(this.itemsToShow);
      },
    },
    computed: {
      onlyValidFilters() {
        let result = {};
        for (const key in this.allFilters) {
          if (Object.hasOwnProperty.call(this.allFilters, key)) {
            const element = this.allFilters[key];
            let condition =
              typeof element === "object"
                ? element.min || element.max
                : element;
            console.log(element, condition);
            if (condition) result[key] = element;
          }
        }
        console.log(result);
        return result;
      },
      isMinValueHigherThanMaxValue() {
        if (this.priceFilters.min && this.priceFilters.max)
          return this.priceFilters.min > this.priceFilters.max;
        else return false;
      },
      allFilters() {
        let typeFilter = this.typeFilters;
        let priceFilters = { ...this.priceFilters };
        return { Tipo: typeFilter, Precio: priceFilters };
      },
    },
    methods: {
      deleteAllFilters() {
        this.priceFilters = {};
        this.typeFilters = undefined;
        this.$emit("update:itemsToShow", this.items);
      },
      emitWrapedInAPromise(eventName, value) {
        return new Promise((resolve, reject) => {
          this.$emit(eventName, value);
          this.$nextTick(resolve);
        });
      },
      async applyFilters(itemsToFilter) {
        let copy = [...itemsToFilter];
        let itemsToEliminate = [];
        for (const filter in this.allFilters) {
          if (Object.hasOwnProperty.call(this.allFilters, filter)) {
            let element = this.allFilters[filter];
            if (!element || Object.keys(element).length === 0) continue;
            else if (filter === "Tipo") {
              let { propToCompare } = this.filtersOpt.find(
                (el) => el.type === filter
              );
              let notFilteredItemsByType = copy.filter(
                (el) => el[propToCompare] === element
              );
              itemsToEliminate.push(
                ...copy.filter((el) => !notFilteredItemsByType.includes(el))
              );
            } else {
              if (element.min > element.max || (!element.max && !element.min))
                continue;
              console.log(copy);
              const evaluateItem = (number) =>
                (element.max ? number < element.max : true) &&
                number > (element.min || 0);
              let notFilteredItemsByPrice = copy.filter(
                (el) =>
                  !evaluateItem(Number(el.precio.replace(/[^0-9&.]/g, "")))
              );
              itemsToEliminate.push(
                ...copy.filter((el) => notFilteredItemsByPrice.includes(el))
              );
            }
          }
          let IDsOfitemsToEliminate = itemsToEliminate.map((el) => el.ID);
          IDsOfitemsToEliminate = [...new Set(IDsOfitemsToEliminate)];
          await this.emitWrapedInAPromise(
            "update:itemsToShow",
            copy.filter((el) => !IDsOfitemsToEliminate.includes(el.ID))
          );
        }
      },
      async deleteFilter({ filterType, isMinOrMax }) {
        filterType === "Tipo"
          ? (this.typeFilters = undefined)
          : this.$delete(this.priceFilters, isMinOrMax);
        this.applyFilters(this.itemsToShow);
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
    width: 100vw;
  }
  h6,
  h5 {
    text-align: center;
  }
  .input-group {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .input-group > * {
    min-width: 12vw !important;
  }
  .filters-list {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    align-items: center;
  }
  .filters-list > button {
    flex-basis: auto !important;
  }
</style>
