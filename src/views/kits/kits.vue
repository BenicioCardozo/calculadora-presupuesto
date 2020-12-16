<template>
  <div>
    <h1>Kits</h1>
    <div
      style="display:flex; justify-content:space-evenly; align-items: center;"
    >
      <div class="container">
        <b-button
          variant="primary"
          :key="kit + ' ' + index"
          v-for="(kit, index) in kits"
          @click="seeKitInfo(kit.name)"
        >
          {{ kit.name }}
          <b-dropdown variant="primary">
            <template #button-content>
              <b-icon
                scale="1.2"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              variant="danger"
              @click.stop="deleteKit(kit.name)"
            >
              <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
              Eliminar
            </b-dropdown-item-button>
          </b-dropdown>
        </b-button>
        <b-button
          @click="$router.push('crear-kit')"
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
    name: "kits",
    data() {
      return {
        kits: this.$store.state.kits,
        hover: "rgb(0, 123, 255)",
      };
    },
    beforeCreate() {
      this.$store.dispatch("setKits");
    },
    computed: {
      newKits() {
        return this.$store.state.kits;
      },
    },
    watch: {
      newKits(newItems) {
        this.kits = newItems;
      },
    },
    methods: {
      deleteKit(kit) {
        db.ref("/kits/" + kit).remove();
      },
      editKit(kit) {
        this.$store.commit("changeName", kit);
        this.$store.commit("changeEditStatus", true);
        this.$router.push("ver-kit");
      },
      seeKitInfo(kit) {
        this.$store.commit("changeName", kit);
        this.$router.push("ver-kit");
        this.$store.commit("changeEditStatus", false);
      },
    },
  };
</script>

<style scoped>
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
    padding-top: 20px;
  }
</style>