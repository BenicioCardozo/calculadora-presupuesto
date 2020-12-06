<template>
  <div>
    <h1>Materias Primas</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="sourceMaterial + ' ' + index"
          v-for="(sourceMaterial, index) in sourceMaterials"
          @click.self="seeSourceMaterialInfo(sourceMaterial.name)"
        >
          {{ sourceMaterial.name }}
          <div>
            <b-dropdown variant="primary">
              <template #button-content>
                <b-icon
                  scale="1.2"
                  icon="three-dots-vertical"
                  aria-hidden="true"
                ></b-icon>
              </template>
              <b-dropdown-item-button
                @click.stop="editSourceMaterial(sourceMaterial.name)"
                tabindex="-1"
                variant="info"
              >
                <b-icon icon="pencil" aria-hidden="true"></b-icon>
                Editar
              </b-dropdown-item-button>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="danger"
                @click.stop="deleteSourceMaterial(sourceMaterial.name)"
              >
                <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
                Eliminar
              </b-dropdown-item-button>
            </b-dropdown>
          </div>
        </b-button>
        <b-button
          @click="$router.push('crear-materia-prima')"
          variant="outline-primary"
          @mouseover="hover = 'rgb(255, 255, 255)'"
          @mouseout="hover = 'rgb(0, 123, 255)'"
        >
          <b-icon
            :style="{ color: hover }"
            icon="plus"
            aria-hidden="true"
          ></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";

  export default {
    name: "source-materials",
    data() {
      return {
        sourceMaterials: this.$store.state.sourceMaterials,
        hover: "rgb(0, 123, 255)",
      };
    },
    computed: {
      newSourceMaterials() {
        return this.$store.state.sourceMaterials;
      },
    },
    beforeCreate() {
      this.$store.dispatch("setProducts");
      this.$store.dispatch("setSourceMaterials");
      this.$store.dispatch("setClients");
    },
    watch: {
      newSourceMaterials(newItems) {
        this.sourceMaterials = newItems;
      },
    },
    methods: {
      deleteSourceMaterial(sourceMaterial) {
        db.ref(`/sourceMaterials/${sourceMaterial}`).remove();
      },
      seeSourceMaterialInfo(sourceMaterialName) {
        this.$store.commit("changeName", sourceMaterialName);
        this.$store.commit("changeEditStatus", false);
        this.$router.push("ver-materia-prima");
      },
      // this.$store.commit('changeEditStatus', true);
      editSourceMaterial(sourceMaterialName) {
        this.$store.commit("changeName", sourceMaterialName);
        this.$store.commit("changeEditStatus", true);
        this.$router.push("ver-materia-prima");
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
