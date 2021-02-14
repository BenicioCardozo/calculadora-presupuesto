<template>
  <form @submit.prevent="sendData()" novalidate>
    <b-input-group prepend="Cliente" class="mb-2">
      <b-form-select
        :value="client"
        @input="updValue({ newValue: $event, prop: 'client' })"
      >
        <b-form-select-option
          :value="client.name"
          v-bind:key="client + ' ' + index"
          v-for="(client, index) in this.$store.state.clients"
        >
          {{ client.name }}
        </b-form-select-option>
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Importancia" class="mb-2">
      <b-form-select
        :options="importanceOpt"
        :value="importance"
        @input="updValue({ newValue: $event, prop: 'importance' })"
      >
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Fecha de Entrega" class="mb-2">
      <b-form-datepicker
        :value="deliveryTime"
        @input="updValue({ newValue: $event, prop: 'deliveryTime' })"
        :min="today"
        :date-format-options="{
          year: undefined,
          month: 'long',
          day: '2-digit',
          weekday: 'long'
        }"
        hide-header
        locale="es-AR"
        value-as-date
        placeholder=""
      ></b-form-datepicker>
    </b-input-group>

    <span id="sub-title">
      <h4 class="mb-1 mt-3">{{ subtitle }} que Lleva</h4>

      <toggle-button
        :value="true"
        :color="{
          checked: '#6c757d',
          unchecked: '#6c757d'
        }"
        :labels="{
          checked: 'Kits',
          unchecked: 'Productos'
        }"
        :width="120"
        :height="30"
        :font-size="15"
        v-model="seeKits"
        class="mb-3"
        @change="cleanInputs()"
      />
    </span>
    <b-input-group
      class="mb-2"
      :prepend="'Nombre del ' + subtitle.slice(0, -1)"
    >
      <b-form-select
        :value="kit"
        @input="updValue({ newValue: $event, prop: 'kit' })"
      >
        <b-form-select-option
          v-show="subtitle === 'Kits'"
          :value="kit.name"
          v-bind:key="kit.name + ' ' + index"
          v-for="(kit, index) in this.$store.state.kits"
        >
          {{ kit.name }}
        </b-form-select-option>
        <b-form-select-option
          v-show="subtitle === 'Productos'"
          :value="product.name"
          v-bind:key="product.name + ' ' + index"
          v-for="(product, index) in this.$store.state.products"
        >
          {{ product.name }}
        </b-form-select-option>
      </b-form-select></b-input-group
    >
    <b-input-group :prepend="`Cantidad del ${subtitle.slice(0, -1)}`">
      <b-input
        type="number"
        :value="quantity"
        @input="updValue({ newValue: $event, prop: 'quantity' })"
      >
      </b-input
    ></b-input-group>
    <b-table
      class="mb-2 mt-2"
      :fields="fields"
      responsive
      :items="Object.values(kitsAndProducts)"
      caption-top
      v-if="Object.values(kitsAndProducts).length > 0"
    >
      <template #head(name)>Nombre</template>
      <template #head(quantity)>Cantidad</template>
      <template #head(opts)> {{ `` }}</template>
      <template #cell(quantity)="data">
        <div class="d-flex justify-content-center ">
          <b-input
            style="max-width:70%;"
            type="number"
            @input="updQuantity($event, data.item.name)"
            :value="data.value"
          ></b-input>
        </div>
      </template>
      <template #cell(opts)="data">
        {{ data.value }}
        <b-icon
          style="cursor:pointer;"
          icon="trash"
          scale="1.2"
          @click.stop="deleteKitOrProduct(data.item.name)"
        >
        </b-icon
      ></template>
    </b-table>
    <b-button
      :disabled="!quantity || kit === 'Kit'"
      @click="pushKit()"
      variant="info"
      class="mb-2"
      >Agregar {{ subtitle.slice(0, -1) }}</b-button
    >
    <span>
      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="!isFormValid"
      >
        {{ this.id ? 'Guardar' : 'Agregar' }}
      </b-button>
      <cancelationButton redirectionForCancelation="/pedidos" />
    </span>
  </form>
</template>

<script>
  import { db } from '../../firebase/firebase.js';
  import cancelationButton from '../../components/cancelationButton.vue';
  export default {
    components: { cancelationButton },
    name: 'order-layout',
    props: {
      client: {
        type: String
      },
      kit: {
        type: String
      },
      kits: {
        type: Object
      },
      products: {
        type: Object
      },
      quantity: {
        type: [String, Number]
      },
      importance: {
        type: String
      },
      deliveryTime: {
        type: [String, Date]
      },
      id: {
        type: String
      }
    },
    data() {
      return {
        fields: ['name', 'quantity', 'opts'],
        importanceOpt: ['Alta', 'Media', 'Baja'],
        seeKits: true
      };
    },
    asyncComputed: {
      async price() {
        let productsPrices = [];
        let kitsPrices = [];

        let kits = this.kits;
        let products = this.products;

        for (const iterator in kits) {
          let kitQuantity = Number(this.kits[iterator].quantity);
          let costs = await this.getCostOfKit(iterator);
          let kitPrice = await this.getFinalPriceOfKit(costs);
          kitsPrices.push(kitPrice * kitQuantity);
        }

        for (const key in products) {
          let costOfProduct = await this.$store.dispatch(
            'setProductPrice',
            key
          );
          let profit = await db
            .ref(
              `users/${this.$store.getters['user/userProfile'].uid}/products/${key}/profit/`
            )
            .once('value');
          profit = profit.val();
          let priceOfProduct = ((1 + profit / 100) * costOfProduct)
            .toFixed(2)
            .toLocaleString('es-AR');
          let quantity = this.products[key].quantity;
          productsPrices.push(priceOfProduct * quantity);
        }

        return (
          kitsPrices.reduce((a, b) => a + b, 0) +
          productsPrices.reduce((a, b) => a + b, 0)
        );
      }
    },
    computed: {
      isFormValid() {
        if (
          Object.values(this.kits).length > 0 &&
          Object.values(this.products) &&
          this.deliveryTime &&
          this.importance
        )
          return true;
        else return false;
      },
      today() {
        return new Date();
      },
      subtitle() {
        return this.seeKits ? 'Kits' : 'Productos';
      },
      kitsAndProducts() {
        return { ...this.kits, ...this.products };
      }
    },

    methods: {
      updValue({ newValue, prop }) {
        this.$emit(`update:${prop}`, newValue);
      },
      cleanInputs() {
        this.product = this.kit = this.quantity = undefined;
      },
      recomputePriceProperty() {
        return this.price;
      },
      async getCostOfKit(kit) {
        let products = await db
          .ref(
            `users/${this.$store.getters['user/userProfile'].uid}/kits/${kit}/products/`
          )
          .once('value');
        products = products.val();
        let result = [];
        for (const key in products) {
          let product = products[key];
          let priceOfProduct =
            (await this.$store.dispatch('setProductPrice', product.name)) *
            product.quantity;
          result.push({
            name: product.name,
            price: priceOfProduct
          });
        }
        return result;
      },
      async getFinalPriceOfKit(productsWithCosts) {
        let kits_prices = [];
        let formula = (price, profit) =>
          ((1 + profit / 100) * price).toFixed(2).toLocaleString('es-AR');
        let prices = productsWithCosts.map(async (el) => {
          let profit = await db
            .ref(
              `users/${this.$store.getters['user/userProfile'].uid}/products/${el.name}/profit`
            )
            .once('value');
          profit = profit.val();
          return Number(formula(el.price, profit));
        });
        prices = await Promise.all(prices);
        kits_prices.push(Number(prices.reduce((a, b) => a + b, 0)));

        return kits_prices;
      },
      updQuantity(newQuantity, name) {
        let isiTInKits = this.kits[name];
        let prop = isiTInKits !== undefined ? this.kits : this.products;
        let copy = Object.assign({}, prop);

        if (!newQuantity || newQuantity === 0) {
          delete copy[id];
          this.$emit(`update:${prop}`, copy);
        } else {
          copy[name].quantity = Number(newQuantity.replace(/,/g, '.'));
          this.$emit(`update:${prop}`, copy);
        }
      },
      sendData() {
        let newKey = db
          .ref()
          .child('orders')
          .push().key;
        let now = new Date();
        let orderData = {
          deliveryTime: this.deliveryTime.toString(),
          client: this.client,
          kits: this.kits,
          products: this.products,
          createdAt: now.toString(),
          importance: this.importance,
          id: this.id || newKey,
          status: 'Pendiente',
          price: this.recomputePriceProperty()
        };
        let updates = {};
        updates[
          `users/${this.$store.getters['user/userProfile'].uid}/orders/${this
            .id || newKey}`
        ] = orderData;
        db.ref().update(updates);
        this.$router.push('pedidos');
      },
      pushKit() {
        if (this.seeKits) {
          this.$set(this.kits, this.kit, {
            name: this.kit,
            quantity: this.quantity
          });
        } else {
          this.$set(this.products, this.kit, {
            name: this.kit,
            quantity: Number(this.quantity)
          });
        }
        this.$emit('update:kit', '');
        this.$emit('update:quantity', '');
      },
      deleteKitOrProduct(name) {
        let object = this.kits[name] ? this.kits : this.products;
        this.$delete(object, name);
      }
    }
  };
</script>

<style scoped>
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
  #sub-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  form > span {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
</style>
