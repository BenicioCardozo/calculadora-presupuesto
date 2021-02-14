<template>
  <div>
    <h1>Clientes</h1>
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
      action="/crear-cliente"
    ></filterItems>
    <table-component
      lettersForId="CL"
      :itemsToShow="itemsToShow"
      @deleteItem="deleteClient"
      @editItem="editClient"
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
    name: "clients",
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
      ...mapState(["clients"]),
      allLocations() {
        let result = [];
        this.items.forEach((el) => {
          result.push(el.localidad);
        });
        return result;
      },
      items() {
        let res = [];
        console.dir(this.clients);
        this.clients.forEach((element) => {
          res.push({
            ID: element.characteristics.id,
            nombre: element.name,
            localidad: element.loc,
            dirección: element.characteristics.address,
            empresa: element.characteristics.company,
            número_de_teléfono: element.characteristics.phoneNumber,
            notas: element.notes,
            opt: "",
          });
          console.log(res);
        });
        this.itemsToShow = res;
        console.log(res);

        return res;
      },
    },
    methods: {
      async deleteClient(data) {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/clients/${data.item.ID}`
          )
          .remove();
      },
      editClient(data) {
        this.$store.commit("changeName", data.item.ID);
        this.$router.push("ver-cliente");
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
