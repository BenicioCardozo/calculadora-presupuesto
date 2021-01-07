<template>
  <div>
    <div id="container">
      <span>
        <h2>{{ this.$store.state.nameOfActualItem }}</h2>
        <h4 style="color:rgb(51, 125, 59);">
          Precio Final ${{ price.toLocaleString("es-AR") }}
        </h4>
      </span>
      <span>
        <h5>Añadir Producto</h5>
        <b-input-group>
          <b-form-select v-model="newProductName" :options="productsList">
            <b-form-select-option hidden value="Nombre">
              Nombre
            </b-form-select-option>
          </b-form-select>
          <b-input
            v-model.number="newProductQuantity"
            type="number"
            placeholder="Cantidad"
            ref="productQuantityInput"
          ></b-input>
        </b-input-group>
        <b-button
          variant="secondary"
          pill
          :disabled="newProductName === 'Nombre' || !newProductQuantity"
          @click="addProduct(newProductName)"
          >Agregar Producto</b-button
        >
      </span>

      <b-table striped responsive="sm" :items="Object.values(productsOfKit)">
        <template #cell(nombre)="data">
          <span
            style="display: flex;
    align-items: center;
    justify-content: space-evenly;"
          >
            <h6>{{ data.value }}</h6>
            <b-icon
              style="cursor:pointer;color:rgb(208,6,6);"
              icon="trash"
              @click="deleteProduct(data.value)"
            ></b-icon>
          </span>
        </template>
        <template #cell(cantidad)="data">
          <b-input
            @input="
              actValue({
                product: data.item.nombre,
                field: 'quantity',
                newVal: $event,
              })
            "
            :value="data.value"
          >
          </b-input
        ></template>
      </b-table>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";
  export default {
    data() {
      return {
        price: 0,
        productsOfKit: {},
        productsList: ["Nombre"],
        newProductQuantity: undefined,
        newProductName: "Nombre",
      };
    },
    created() {
      this.setKitsProducts();
    },
    methods: {
      addProduct(newVal) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}/products/${this.newProductName}`
        ).set({
          name: this.newProductName,
          quantity: this.newProductQuantity,
        });
        this.setKitsProducts();
        this.$refs.productQuantityInput.blur();
        this.newProductQuantity = "";
        this.newProductName = "Nombre";
      },
      deleteProduct(name) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}/products/${name}`
        ).set(null);
        this.$delete(this.productsOfKit, name);
        this.setKitsProducts();
      },
      actValue(params) {
        if (params.newVal == 0 || !params.newVal) {
          this.$delete(this.productsOfKit, params.product);
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}/products/${params.product}`
          ).set(null);
          this.setKitsProducts();
        } else {
          let { product, field, newVal } = params;
          const ref = db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}/products/${product}/${field}`
          );
          ref.set(newVal);
          this.setKitsProducts();
        }
      },
      setKitsProducts() {
        this.price = 0;
        let kitProductsQuery = new Promise((res, rej) => {
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/kits/${this.$store.state.nameOfActualItem}/products`
          ).once("value", async (snapshot) => {
            let productsOfKit = [];
            for (const iterator of Object.values(snapshot.val())) {
              let productPrice = await this.$store.dispatch(
                "setProductPrice",
                iterator.name
              );
              this.price += productPrice * Number(iterator.quantity);
              productsOfKit.push(iterator.name);
              this.$set(this.productsOfKit, iterator.name, {
                nombre: iterator.name,
                cantidad: iterator.quantity,
                subtotal: `$${(
                  productPrice * Number(iterator.quantity)
                ).toLocaleString("es-AR")}`,
              });
            }
            res(productsOfKit);
          });
        });

        let productsQuery = new Promise((res, rej) => {
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/products`
          ).once("value", (snap) => {
            let allProducts = Object.values(snap.val()).map((el) => el.name);
            res(allProducts);
          });
        });

        Promise.all([kitProductsQuery, productsQuery]).then((res) => {
          let merge = res[0].concat(res[1]);
          let duplicates = merge.filter(
            (item, index) => merge.indexOf(item) != index
          );
          let mergeUnique = [...new Set(merge)];
          this.productsList = mergeUnique.filter(
            (el) => !duplicates.includes(el)
          );
        });
      },
    },
  };
</script>

<style scoped>
  h2 {
    text-align: center;
    font-weight: 500;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    min-height: 90vh;
    text-align: center;
  }
  div > table {
    margin: 0 0 5vh 0;
  }
  button {
    margin: 2vh 0 0 0;
  }
  input {
    text-align: center;
  }
  .input-group {
    max-width: 80vw;
    align-items: center;
    justify-content: center;
    min-width: 100%;
  }
  div > input,
  div > select {
    margin: 1px 20px 21px 20px;
  }
</style>
