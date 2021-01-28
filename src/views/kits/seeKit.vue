<template>
  <form @submit.prevent="sendData()" novalidate>
    <b-input-group prepend="Nombre del Kit">
      <b-input
        @input="$v.nameKit.$touch"
        :style="[
          $v.nameKit.$error ? { border: '2px solid rgb(255, 36, 36)' } : null,
        ]"
        type="text"
        v-model="nameKit"
        class="mb-3"
      ></b-input
    ></b-input-group>
    <div class="products-form">
      <h3 class="mb-4 mt-3">Productos</h3>
      <b-input-group class="mb-4" prepend="Nombre del Producto">
        <b-form-select :options="filteredProducts" v-model="product">
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
        <b-input type="number" v-model="quantity"></b-input>
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
          Ganancia:
          {{ "$" + Number(kitInfo.profit.toFixed(2)).toLocaleString("es-AR") }}
        </h5>
        <h5>
          Costo Final:
          {{ "$" + Number(kitInfo.cost.toFixed(2)).toLocaleString("es-AR") }}
        </h5>
        <h5>
          Precio Final:
          {{
            "$" + Number(kitInfo.final_price.toFixed(2)).toLocaleString("es-AR")
          }}
        </h5>
      </b-card>
    </div>
    <b-button
      pill
      size="lg"
      class="mb-2"
      variant="success"
      type="submit"
      :disabled="$v.$invalid === true || Object.keys(products).length === 0"
      >Guardar Kit</b-button
    >
  </form>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";
  export default {
    name: "create-product",
    data() {
      return {
        nameKit: undefined,
        submitStatus: null,
        products: {},
        product: undefined,
        quantity: undefined,
        kitInfo: undefined,
        id: undefined,
      };
    },
    validations: {
      nameKit: {
        required,
      },
    },
    async created() {
      this.$store.dispatch("setProducts");

      let kit_info = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}`
        )
        .once("value");
      kit_info = kit_info.val();
      console.log(kit_info);
      this.nameKit = kit_info.name;
      this.id = kit_info.id;
      this.products = kit_info.products;
    },
    watch: {
      products: {
        //Use Watcher because computed propery wont re-evaluate every time the quantity changes
        async handler() {
          let setPrices = Object.keys(this.products).map(async (el) => {
            let cost_query = await this.$store.dispatch("setProductPrice", el); //Cost
            let profit_query = this.$store.state.products.find(
              (product) => product.name === el
            );
            let final_price =
              this.getFinalPrice({
                price: cost_query,
                profit: profit_query.profit,
              }) * this.products[el].quantity;
            return {
              cost: cost_query * this.products[el].quantity,
              final_price: final_price,
              profit: final_price - cost_query * this.products[el].quantity,
            };
          });
          let decapsulated = await Promise.all(setPrices);
          let sum = decapsulated.reduce(
            (acc, { cost, final_price, profit }) => {
              return {
                cost: acc.cost + cost,
                final_price: acc.final_price + final_price,
                profit: acc.profit + profit,
              };
            },
            {
              cost: 0,
              final_price: 0,
              profit: 0,
            }
          );
          this.kitInfo = sum.cost !== 0 ? sum : undefined;
        },
        deep: true,
      },
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
          result.push({ ...iterator, opts: "" });
        }
        return result;
      },
    },

    methods: {
      getFinalPrice({ price, profit }) {
        return ((1 + profit / 100) * price).toFixed(2).toLocaleString("es-AR");
      },
      updQuantity(newQuantity, productName) {
        if (!newQuantity || newQuantity === 0) {
          this.$delete(this.products, productName);
        } else {
          this.products[productName].quantity = Number(
            newQuantity
              .replace(/,/g, "_")
              .replace(/\./g, "")
              .replace(/_/g, ".")
          );
        }
      },
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = "ERROR";
        } else {
          this.submitStatus = "OK";
          let kitData = {
            name: this.nameKit,
            products: this.products,
            id: this.id,
          };
          let updates = {};
          updates[
            `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.nameKit}`
          ] = kitData;
          db.ref().update(updates);
          this.$router.push("kits");
        }
      },
      pushProduct() {
        this.$set(this.products, this.product, {
          name: this.product,
          quantity: Number(this.quantity),
        });
        this.quantity = undefined;
        this.product = undefined;
      },
      deleteProduct(name) {
        this.$delete(this.products, name);
      },
    },
  };
</script>

<style scoped>
  * {
    text-align: center;
  }
  .card {
    min-width: 50vw;
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
