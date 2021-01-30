<template>
  <form @submit.prevent="sendData()" novalidate>
    <b-input-group prepend="Cliente" class="mb-2">
      <b-form-select v-model="client">
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
      <b-form-select :options="importanceOpt" v-model="importance">
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Fecha de Entrega" class="mb-2">
      <b-form-datepicker
        v-model="deliveryTime"
        :min="today"
        language
        :date-format-options="{
          year: undefined,
          month: 'long',
          day: '2-digit',
          weekday: 'long',
        }"
        hide-header
        locale="es-AR"
        placeholder=""
      ></b-form-datepicker>
    </b-input-group>

    <span id="sub-title">
      <h4 class="mb-1 mt-3">{{ subtitle }} que Lleva</h4>

      <toggle-button
        :value="true"
        :color="{
          checked: '#6c757d',
          unchecked: '#6c757d',
        }"
        :labels="{
          checked: 'Kits',
          unchecked: 'Productos',
        }"
        :width="120"
        :height="30"
        :font-size="15"
        v-model="seeKits"
        class="mb-3"
      />
    </span>
    <b-input-group
      class="mb-2"
      :prepend="'Nombre del ' + subtitle.slice(0, -1)"
    >
      <b-form-select v-model="kit">
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
        :placeholder="`Cantidad del ${subtitle.slice(0, -1)}`"
        type="number"
        v-model="quantity"
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
            @input="updQuantity($event, data.item.name)"
            :value="data.value.toLocaleString('es-AR')"
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
    <!-- <span
      v-if="Object.keys(kitsAndProducts).length > 0"
      style="display:flex; justify-content: space-around;width:80vw;"
    >
      <h5 :key="kit.name" v-for="kit in kitsAndProducts">
        {{ `${kit.name}  ${kit.quantity} ` }}
        <b-icon
          style="cursor:pointer;"
          icon="trash"
          scale="1.1"
          @click.stop="deleteKitOrProduct(kit.name)"
        >
        </b-icon>
      </h5>
    </span> -->

    <span>
      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="
          $v.$invalid === true || Object.values(kitsAndProducts).length < 1
        "
        >Guardar Pedido</b-button
      >
      <cancelationButton redirectionForCancelation="/pedidos" />
    </span>
  </form>
</template>

<script>
  import { required } from "vuelidate/lib/validators";

  import { db } from "../../firebase/firebase.js";
  import cancelationButton from "../../components/cancelationButton.vue";
  export default {
    components: { cancelationButton },
    name: "see-order",
    data() {
      return {
        client: undefined,
        kit: "Kit",
        kits: {},
        products: {},
        fields: ["name", "quantity", "opts"],
        quantity: undefined,
        importance: "Importancia",
        importanceOpt: ["Alta", "Media", "Baja"],
        deliveryTime: undefined,
        submitStatus: null,
        seeKits: true,
        createdAt: undefined,
        id: undefined,
        status: undefined,
        months: {
          enero: "01",
          febrero: "02",
          marzo: "03",
          abril: "04",
          mayo: "05",
          junio: "06",
          julio: "07",
          agosto: "08",
          septiembre: "09",
          octubre: "10",
          noviembre: "11",
          diciembre: "12",
        },
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
          console.log(key);
          let costOfProduct = await this.$store.dispatch(
            "setProductPrice",
            key
          );
          let profit = await db
            .ref(
              `users/${this.$store.getters["user/userProfile"].uid}/products/${key}/profit/`
            )
            .once("value");
          profit = profit.val();
          let priceOfProduct = ((1 + profit / 100) * costOfProduct)
            .toFixed(2)
            .toLocaleString("es-AR");
          let quantity = this.products[key].quantity;
          productsPrices.push(priceOfProduct * quantity);
        }
        return (
          kitsPrices.reduce((a, b) => a + b, 0) +
          productsPrices.reduce((a, b) => a + b, 0)
        );
      },
    },
    computed: {
      today() {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const minDate = new Date(today);

        return minDate;
      },
      subtitle() {
        return this.seeKits ? "Kits" : "Productos";
      },
      kitsAndProducts() {
        return { ...this.kits, ...this.products };
      },
    },
    validations: {
      client: {
        required,
      },
      deliveryTime: {
        required,
      },
      importance: {
        required,
      },
    },
    async created() {
      //Set initial Values
      let order_info = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.$store.state.nameOfActualItem}/`
        )
        .once("value");
      order_info = order_info.val();
      this.kits = order_info.kits || {};
      this.products = order_info.products || {};
      this.createdAt = order_info.createdAt;
      this.importance = order_info.importance;
      this.id = order_info.id;
      this.client = order_info.client;
      let deliveryTimeParts = order_info.deliveryTime.split(" ");
      this.deliveryTime = `${deliveryTimeParts[4]}-${
        this.months[deliveryTimeParts[2]]
      }-${Number(deliveryTimeParts[0]) + 1}`;
      this.status = order_info.status;
    },

    methods: {
      async getCostOfKit(kit) {
        let products = await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/kits/${kit}/products/`
          )
          .once("value");
        products = products.val();
        let result = [];
        for (const key in products) {
          let product = products[key];
          let priceOfProduct =
            (await this.$store.dispatch("setProductPrice", product.name)) *
            product.quantity;
          result.push({
            name: product.name,
            price: priceOfProduct,
          });
        }
        return result;
      },
      recomputePriceProperty() {
        return this.price;
      },
      async getFinalPriceOfKit(productsWithCosts) {
        let kits_prices = [];
        let formula = (price, profit) =>
          ((1 + profit / 100) * price).toFixed(2).toLocaleString("es-AR");
        let prices = productsWithCosts.map(async (el) => {
          let profit = await db
            .ref(
              `users/${this.$store.getters["user/userProfile"].uid}/products/${el.name}/profit`
            )
            .once("value");
          profit = profit.val();
          return Number(formula(el.price, profit));
        });
        prices = await Promise.all(prices);
        kits_prices.push(Number(prices.reduce((a, b) => a + b, 0)));

        return kits_prices;
      },
      updQuantity(newQuantity, name) {
        let isiTInKits = this.kits[name];
        if (!newQuantity || newQuantity === 0) {
          this.$delete(
            isiTInKits !== undefined ? this.kits : this.products,
            name
          );
        } else {
          (isiTInKits !== undefined ? this.kits : this.products)[
            name
          ].quantity = Number(
            newQuantity
              .replace(/,/g, "_")
              .replace(/\./g, "")
              .replace(/_/g, ".")
          );
        }
      },
      sendData() {
        this.$v.$touch();
        this.submitStatus = "OK";

        let orderData = {
          deliveryTime: this.toLocaleDate(this.deliveryTime),
          client: this.client,
          kits: this.kits,
          products: this.products,
          createdAt: this.createdAt,
          importance: this.importance,
          id: this.id,
          status: this.status,
          price: this.recomputePriceProperty(),
        };

        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/orders/${this.id}`
        ] = orderData;
        db.ref().update(updates);
        this.$router.push("pedidos");
      },
      toLocaleDate(date) {
        const options = {
          month: "long",
          day: "numeric",
          year: "numeric",
        };
        return new Date(date).toLocaleDateString("es-AR", options);
      },
      pushKit() {
        if (this.seeKits) {
          this.$set(this.kits, this.kit, {
            name: this.kit,
            quantity: this.quantity,
          });
        } else {
          this.$set(this.products, this.kit, {
            name: this.kit,
            quantity: this.quantity,
          });
        }
        (this.kit = "Kit"), (this.quantity = "");
      },
      deleteKitOrProduct(name) {
        this.kits[name]
          ? this.$delete(this.kits, name)
          : this.$delete(this.products, name);
      },
    },
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
  * {
    text-align: center;
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
