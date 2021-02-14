<template>
  <form @submit.prevent="sendData()" novalidate>
    <b-input-group class="mb-3" prepend="Nombre del Kit">
      <b-input
        @input="updValue({ newValue: $event, prop: 'nameKit' })"
        type="text"
        :value="nameKit"
      ></b-input
    ></b-input-group>
    <div class="products-form">
      <h3 class="mb-4 mt-3">Productos</h3>
      <b-input-group class="mb-4" prepend="Nombre del Producto">
        <b-form-select
          :options="filteredProducts"
          @input="updValue({ newValue: $event, prop: 'product' })"
          :value="product"
        >
          <b-form-select-option
            selected
            disabled
            hidden
            value="Nombre del Producto"
          >
            Nombre del Producto
          </b-form-select-option>
        </b-form-select>
      </b-input-group>
      <b-input-group
        class="mb-4"
        :prepend="`Cantidad ${product ? `de ${product}` : ''}`"
      >
        <b-input
          @input="updValue({ newValue: $event, prop: 'quantity' })"
          type="number"
          :value="quantity"
        ></b-input>
      </b-input-group>
      <b-button
        :disabled="!quantity || !product"
        variant="info"
        @click="pushProduct()"
        class="mb-4"
        >Agregar Producto</b-button
      >
      <b-table
        class="mb-3"
        responsive
        :items="productsWithDropdown"
        caption-top
      >
        <template #head(name)>Nombre</template>
        <template #head(quantity)>Cantidad</template>
        <template #head(opts)> {{ `` }}</template>
        <template #cell(quantity)="data">
          <b-input
            @input="updQuantity($event, data.item.name)"
            :value="data.value.toLocaleString('es-AR')"
            type="number"
          ></b-input>
        </template>
        <template #cell(opts)="data">
          {{ data.value }}
          <b-icon
            style="cursor:pointer;"
            icon="trash"
            scale="1.2"
            @click.stop="deleteProduct(data.item.name)"
          >
          </b-icon
        ></template>
      </b-table>
      <b-card v-if="kitInfo" class="mb-3">
        <h5>
          Costo Final:
          {{ '$' + Number(kitInfo.cost.toFixed(2)).toLocaleString('es-AR') }}
        </h5>
        <h5>
          Precio Final:
          {{
            '$' + Number(kitInfo.final_price.toFixed(2)).toLocaleString('es-AR')
          }}
        </h5>
        <h5>
          Ganancia:
          {{ '$' + Number(kitInfo.profit.toFixed(2)).toLocaleString('es-AR') }}
        </h5>
      </b-card>
    </div>
    <span>
      <b-button
        pill
        size="lg"
        class="mb-2"
        variant="success"
        type="submit"
        :disabled="!nameKit || Object.keys(products).length === 0"
      >
        {{ this.id ? 'Guardar' : 'Agregar' }}</b-button
      >
      <cancelationButton redirectionForCancelation="/kits" />
    </span>
  </form>
</template>

<script>
  import { db } from '../../firebase/firebase.js';
  import cancelationButton from '../../components/cancelationButton.vue';
  export default {
    components: { cancelationButton },
    name: 'kits-layout',
    props: {
      nameKit: {
        type: String
      },
      products: {
        type: Object
      },
      product: {
        type: String
      },
      quantity: {
        type: [String, Number]
      },
      id: {
        type: String
      }
    },
    data() {
      return {
        kitInfo: undefined
      };
    },

    watch: {
      products: {
        //Use Watcher because computed propery wont re-evaluate every time the quantity changes
        async handler() {
          let setPrices = Object.keys(this.products).map(async (el) => {
            let cost_query = await this.$store.dispatch('setProductPrice', el); //Cost
            let profit_query = this.$store.state.products.find(
              (product) => product.name === el
            );
            let final_price =
              this.getFinalPrice({
                price: cost_query,
                profit: profit_query.profit
              }) * this.products[el].quantity;
            return {
              cost: cost_query * this.products[el].quantity,
              final_price: final_price,
              profit: final_price - cost_query * this.products[el].quantity
            };
          });
          let decapsulated = await Promise.all(setPrices);
          let sum = decapsulated.reduce(
            (acc, { cost, final_price, profit }) => {
              return {
                cost: acc.cost + cost,
                final_price: acc.final_price + final_price,
                profit: acc.profit + profit
              };
            },
            {
              cost: 0,
              final_price: 0,
              profit: 0
            }
          );
          this.kitInfo = sum.cost !== 0 ? sum : undefined;
        },
        deep: true
      }
    },

    computed: {
      filteredProducts() {
        let merge = this.$store.state.products
          .map((el) => el.name)
          .concat(Object.keys(this.products));
        let duplicates = merge.filter(
          (item, index) => merge.indexOf(item) != index
        );
        let mergeUnique = [...new Set(merge)];
        return mergeUnique.filter((el) => !duplicates.includes(el));
      },
      productsWithDropdown() {
        let result = [];
        for (const iterator of Object.values(this.products)) {
          result.push({ ...iterator, opts: '' });
        }
        return result;
      }
    },

    methods: {
      getFinalPrice({ price, profit }) {
        return ((1 + profit / 100) * price).toFixed(2).toLocaleString('es-AR');
      },
      updValue({ newValue, prop }) {
        this.$emit(`update:${prop}`, newValue);
      },
      updQuantity(newQuantity, productName) {
        if (!newQuantity || newQuantity === 0) {
          console.log(productName);
          let copy = Object.assign({}, this.products);
          delete copy[productName];
          this.$emit('update:products', copy);
        } else {
          let copy = Object.assign({}, this.products);
          copy[productName].quantity = Number(newQuantity.replace(/,/g, '.'));
          this.$emit('update:products', copy);
        }
      },
      async sendData() {
        this.submitStatus = 'OK';
        let newKey = db
          .ref()
          .child('products')
          .push().key;
        let kitData = {
          name: this.nameKit,
          products: this.products,
          id: this.id || newKey
        };
        console.dir(kitData);
        let updates = {};
        updates[
          `users/${this.$store.getters['user/userProfile'].uid}/kits/${this.nameKit}`
        ] = kitData;
        await db.ref().update(updates);
        this.$router.push('kits');
      },
      pushProduct() {
        this.$set(this.products, this.product, {
          name: this.product,
          quantity: Number(this.quantity)
        });
        this.$emit('update:quantity', '');
        this.$emit('update:sourceMaterial', 'Nombre');
      },
      deleteProduct(name) {
        this.$delete(this.products, name);
      }
    }
  };
</script>

<style scoped>
  form > span {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .card {
    min-width: 50vw;
    text-align: center;
  }
  form {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    justify-content: space-around;
    align-items: center;
    min-height: 90vh;
  }
  .input-group {
    width: 80vw;
  }
  h2 {
    font-weight: 500;
    font-size: 2.4em;
  }
  .products-form {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: space-around;
  }
</style>
