<template>
  <div>
    <h1>Proveedores</h1>
    <filterItems
      :filtersOpt="[
        {
          name: 'Localidad',
          type: 'Tipo',
          propToCompare: 'localidad',
          types: this.allLocations,
        },
      ]"
      :items.sync="items"
      :itemsToShow.sync="itemsToShow"
      action="/crear-proveedor"
    ></filterItems>
    <table-component
      lettersForId="PV"
      :itemsToShow="itemsToShow"
      @deleteItem="deleteSupplier"
      @editItem="editSupplier"
    >
    </table-component>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";
  import idCreator from "../../mixins/idCreator";
  import tableComponent from "../../components/table";
  export default {
    name: "suppliers",
    mixins: [idCreator],
    components: {
      filterItems,
      tableComponent,
    },
    data() {
      return {
        itemsToShow: [],
      };
    },
    computed: {
      ...mapState(["suppliers"]),
      items() {
        let suppliers = this.suppliers;
        let suppliersFormatted = [];
        if (suppliers.length == 0) return [];
        suppliers.forEach((element) => {
          if (!element.characteristics.id) return false;
          suppliersFormatted.push({
            ID: element.characteristics.id,
            nombre: element.name,
            localidad: element.loc,
            dirección: element.characteristics.address,
            empresa: element.characteristics.company,
            teléfono: element.characteristics.phoneNumber,
            notas: element.notes,
            opt: "",
          });
        });
        this.itemsToShow = suppliersFormatted;
        return suppliersFormatted;
      },
      allLocations() {
        let result = [];
        this.items.forEach((el) => {
          result.push(el.localidad);
        });
        return result;
      },
    },
    methods: {
      async deleteSupplier(data) {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/suppliers/${data.item.ID}`
          )
          .remove();
      },
      editSupplier(data) {
        this.$store.commit("changeName", data.item.ID);
        this.$router.push("ver-proveedor");
      },
    },
  };
</script>

<style>
  .container {
    margin: 20px;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 80vw;
    height: 40vh;
  }
  .container > button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-basis: 250px;
    height: 10vh;
    margin: 50px;
    font-size: 1.3em;
  }
  h1 {
    text-align: center;
    font-size: 2.5em;
    padding-top: 20px;
  }
</style>
