<template>
  <form @submit.prevent="sendData()" novalidate>
    <div id="container" v-if="this.$store.state.sourceMaterials !== undefined">
      <b-input-group prepend="Nombre" class="mb-2">
        <b-input
          @input="$v.nameProduct.$touch"
          :style="[
            $v.nameProduct.$error
              ? { border: '2px solid rgb(255, 36, 36)' }
              : null,
          ]"
          type="text"
          v-model="nameProduct"
        ></b-input
      ></b-input-group>

      <b-input-group prepend="Tipo de Producto">
        <b-form-select v-model="type" :options="types"> </b-form-select
      ></b-input-group>
      <b-input-group prepend="Tamaño" class="mb-2 mt-3">
        <b-form-select
          v-model="size"
          class="select-inside-card"
          :options="sizes"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group prepend="Color" class="mb-2">
        <b-form-select
          v-model="color"
          class="select-inside-card"
          :options="colors"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group class="mb-2" prepend="Calidad">
        <b-form-select
          v-model="quality"
          class="select-inside-card"
          :options="qualities"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group
        prepend="Margen de Ganancia"
        :append="
          `% ${
            calOfFinalPrice
              ? `(Precio Final $${calOfFinalPrice.toFixed(2)})`
              : ''
          }`
        "
      >
        <b-input
          v-model.number="profit"
          class="select-inside-card"
          type="number"
        >
        </b-input>
      </b-input-group>
      <h5 class="mt-4">
        Materias Primas que Lleva
      </h5>
      <b-form-select
        :options="sourceMaterialsFiltered"
        v-model="sourceMaterial"
        class="mb-3"
      >
        <b-form-select-option selected disabled hidden value="Nombre">
          Nombre
        </b-form-select-option>
      </b-form-select>
      <b-input-group
        class="mb-3"
        :append="unitOfSourceMaterial ? `Por ${unitOfSourceMaterial}` : null"
      >
        <b-input
          v-model="howMuch"
          type="number"
          placeholder="Cantidad de Materia Prima"
        ></b-input>
      </b-input-group>
      <b-button
        :disabled="!howMuch || sourceMaterial === 'Nombre'"
        variant="info"
        @click="pushSourceMaterial()"
        >Agregar Materia Prima</b-button
      >
      <b-table responsive :items="sourceMaterialsListWithDropdown" caption-top>
        <template #head(name)>Nombre</template>
        <template #head(howMuch)>Cantidad</template>
        <template #head(measurementUnit)>Unidad de Medida</template>
        <template #head(opts)> {{ `` }}</template>
        <template #cell(howMuch)="data">
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
            @click.stop="deleteSourceMaterial(data.item.name)"
          >
          </b-icon
        ></template>
      </b-table>
      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        class="mb-2"
        :disabled="
          $v.$invalid === true || Object.keys(sourceMaterials).length === 0
        "
        >Agregar Producto</b-button
      >
    </div>
    <span v-else>
      <h2 style="text-align: center;">
        Todavía no tenés Materias Primas Creadas
        <router-link
          style="color: rgb(10, 92, 173); text-align:center; margin-top: 10px;"
          to="/crear-materia-prima"
        >
          <h2 style="font-size: 4rem;">
            ¡Crealas!
          </h2>
        </router-link>
      </h2>
    </span>
  </form>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";
  export default {
    name: "create-product",
    data() {
      return {
        nameProduct: undefined,
        submitStatus: null,
        sourceMaterials: {},
        sourceMaterial: "Nombre",
        howMuch: undefined,
        sizes: ["Grande", "Mediano", "Pequeño"],
        size: undefined,
        colors: ["Blanco", "Azul", "Beige"],
        color: undefined,
        qualities: ["Alta", "Media", "Baja"],
        quality: undefined,
        type: "Tipo de producto",
        types: ["Sss", "Aaaa"],
        unitOfSourceMaterial: null,
        sourceMaterialMeasurementUnit: null,
        profit: undefined,
        finalPrice: undefined,
      };
    },
    validations: {
      nameProduct: {
        required,
      },
      size: {
        required,
      },
      color: {
        required,
      },
      quality: {
        required,
      },
      sourceMaterials: {
        required,
      },
    },
    created() {
      this.$store.dispatch("setSourceMaterials");
    },
    computed: {
      calOfFinalPrice() {
        // 100% + margen% === precio final
        // costo === 100%
        if (!this.profit || Object.keys(this.sourceMaterials) < 1) return false;
        let prices = [];
        for (const iterator of Object.values(this.sourceMaterials)) {
          let price_query = db
            .ref(
              `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${iterator.name}/price/amount`
            )
            .once("value", (snap) => {
              prices.push(
                snap.val() * this.sourceMaterials[iterator.name].howMuch
              );
            });
        }
        console.log(
          prices.reduce((a, b) => a + b, 0),
          prices
        );
        let equation =
          (1 + this.profit / 100) * prices.reduce((a, b) => a + b, 0);
        console.log(equation);
        return equation;
      },
      sourceMaterialsListWithDropdown() {
        let result = [];
        for (const iterator of Object.values(this.sourceMaterials)) {
          result.push({ ...iterator, opts: "" });
        }
        return result;
      },
      sourceMaterialsFiltered() {
        let merge = this.$store.state.sourceMaterials
          .map((el) => el.name)
          .concat(Object.keys(this.sourceMaterials));
        let duplicates = merge.filter(
          (item, index) => merge.indexOf(item) != index
        );
        let mergeUnique = [...new Set(merge)];
        return mergeUnique.filter((el) => !duplicates.includes(el));
      },
    },
    methods: {
      async updQuantity(newQuantity, sourceMaterialName) {
        if (!newQuantity || newQuantity === 0) {
          Vue.delete(this.sourceMaterials, sourceMaterialName);
        } else {
          this.sourceMaterials[sourceMaterialName].howMuch = Number(
            newQuantity.replace(",", ".")
          );
        }
      },
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = "ERROR";
        } else {
          this.submitStatus = "OK";
          var newKey = db
            .ref()
            .child("products")
            .push().key;
          let productData = {
            name: this.nameProduct,
            type: this.type,
            sourceMaterials: this.sourceMaterials,
            characteristics: {
              color: this.color,
              size: this.size,
              quality: this.quality,
            },
            profit: this.profit,
            id: newKey,
          };
          console.dir(productData);
          let updates = {};
          updates[
            `users/${this.$store.getters["user/userProfile"].uid}/products/${this.nameProduct}`
          ] = productData;
          db.ref().update(updates);
          this.$router.push("productos");
        }
      },
      pushSourceMaterial(newMeasurementUnit) {
        if (
          this.sourceMaterial.$invalid !== "Nombre" &&
          this.howMuch &&
          this.sourceMaterial !== "Nombre"
        ) {
          this.$set(this.sourceMaterials, this.sourceMaterial, {
            name: this.sourceMaterial,
            howMuch: Number(this.howMuch.replace(",", ".")),
            measurementUnit: this.unitOfSourceMaterial,
          });
          this.howMuch = "";
          this.sourceMaterial = "Nombre";
          this.unitOfSourceMaterial = null;
        }
      },
      deleteSourceMaterial(name) {
        this.$delete(this.sourceMaterials, name);
      },
    },
    watch: {
      sourceMaterial: {
        handler(newVal) {
          if (!newVal) return false;
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.sourceMaterial}`
          ).on("value", (snapshot) => {
            let snap = snapshot.val();
            if (!snap) return false;
            this.unitOfSourceMaterial = snap.price.measurementUnit;
          });
        },
        immediate: true,
      },
    },
  };
</script>

<style scoped>
  #container {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    min-height: 92.3vh;
    justify-content: space-around;
    align-items: center;
  }

  form > span {
    display: flex;
    align-items: center;
    height: 85vh;
    justify-content: center;
  }

  .input-group {
    width: 80vw;
  }
  select {
    width: 80vw;
  }
  * {
    text-align: center;
  }
</style>
