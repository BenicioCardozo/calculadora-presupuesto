<template>
  <b-table responsive hover :items="itemsToShow" v-if="itemsToShow.length > 0">
    <template #cell(ID)="data">
      <b-td class="text-primary" style="white-space:nowrap;"
        >{{ createId(lettersForId, data.value) }}
      </b-td>
    </template>
    <template #cell(productos)="data"
      ><slot :data="data" name="productos"> </slot
    ></template>
    <template #cell(materias_primas)="data"
      ><slot :data="data" name="materias_primas"></slot
    ></template>

    <template #head(opt)>{{ `` }}</template>
    <template #cell(opt)="data"
      ><b-dropdown right variant="white" no-caret>
        <template #button-content>
          <b-icon
            scale="1.1"
            icon="three-dots-vertical"
            aria-hidden="true"
          ></b-icon>
        </template>
        <b-dropdown-item-button
          @click.stop="editItem(data)"
          tabindex="-1"
          variant="info"
        >
          <b-icon icon="pencil"></b-icon>
          Editar
        </b-dropdown-item-button>
        <b-dropdown-divider></b-dropdown-divider>
        <slot :data="data" name="deleteButton">
          <b-dropdown-item-button
            variant="danger"
            @click.stop="deleteItem(data)"
          >
            <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
            Eliminar
          </b-dropdown-item-button></slot
        >
      </b-dropdown>
    </template>
  </b-table>
</template>

<script>
  import idCreator from "../mixins/idCreator";

  export default {
    props: {
      lettersForId: String,
      itemsToShow: Array,
      entity: String,
    },
    mixins: [idCreator],
    methods: {
      editItem(info) {
        this.$emit("editItem", info);
      },
      deleteItem(info) {
        this.$emit("deleteItem", info);
      },
    },
  };
</script>

<style></style>
