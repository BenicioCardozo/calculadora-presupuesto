<template>
  <div>
    <h1>Clientes</h1>
    <filterItems
      :methodOpt="{
        types: this.allLocations,
      }"
      @setItems="setItems"
      :filtersOpt="[
        {
          type: 'Tipo',
          name: 'Localidad',
          propToCompare: 'localidad',
        },
      ]"
      :items.sync="items"
      :itemsToShow.sync="itemsToShow"
      action="/crear-cliente"
    ></filterItems>
    <b-table hover responsive :items="itemsToShow" v-if="clients">
      <template #head(opt)> {{ "" }}</template>
      <template #cell(ID)="data">
        <b-td class="text-primary">
          {{ data.value.substring(13) }}
        </b-td>
      </template>
      <template #cell(opt)="data">
        <b-dropdown right variant="white" no-caret>
          <template #button-content>
            <b-icon
              scale="1.1"
              icon="three-dots-vertical"
              aria-hidden="true"
            ></b-icon>
          </template>
          <b-dropdown-item-button
            @click.stop="editClient(data)"
            tabindex="-1"
            variant="info"
          >
            <b-icon icon="pencil" aria-hidden="true"></b-icon>
            Editar
          </b-dropdown-item-button>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item-button
            variant="danger"
            @click.stop="deleteClient(data)"
          >
            <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
            Eliminar
          </b-dropdown-item-button>
        </b-dropdown>
      </template>
    </b-table>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";

  export default {
    name: "clients",
    components: {
      filterItems,
    },
    data() {
      return {
        hover: "rgb(0, 123, 255)",
        items: [],
        itemsToShow: [],
      };
    },
    created() {
      this.setItems(this.clients);
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
    },
    watch: {
      clients: {
        handler(newVal) {
          this.setItems(newVal);
        },
        deep: true,
      },
    },
    methods: {
      setItems(itemsWithoutFormat) {
        this.items = [];
        if (!itemsWithoutFormat) return false;
        itemsWithoutFormat.forEach((element) => {
          if (!element.characteristics.id) return false;
          this.items.push({
            ID: element.characteristics.id,
            nombre: element.name,
            localidad: element.loc,
            dirección: element.characteristics.address,
            empresa: element.characteristics.company,
            número_de_teléfono: element.characteristics.phoneNumber,
            notas: element.notes,
            opt: "",
          });
          this.itemsToShow = this.items;
        });
      },
      async deleteClient(name) {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/clients/${name.item.ID}`
          )
          .remove();
        this.setItems(this.clients);
      },
      editClient(name) {
        console.log(name.item.ID);
        this.$store.commit("changeName", name.item.ID);
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
