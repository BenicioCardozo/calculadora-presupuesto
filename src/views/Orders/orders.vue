<template>
  <div>
    <h1>Pedidos</h1>
    <div>
      <filterItems
        :methodOpt="{
          price: ['<', '>'],
          types: ['Entregado', 'Pendiente'],
        }"
        :filtersOpt="[
          { type: 'Precio', name: 'Precio' },
          {
            type: 'Tipo',
            name: 'Status',
            propToCompare: 'status',
          },
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-pedido"
      >
      </filterItems>

      <b-table responsive hover :items="itemsToShow" v-if="orders">
        <template #cell(precio)="data">{{
          "$" +
            Number(data.value.replace(/[^0-9&.]/g, "")).toLocaleString("es-AR")
        }}</template>
        <template #cell(ID)="data">
          <b-td class="text-primary" style="white-space:nowrap;"
            >{{ createId("PE", data.value) }}
          </b-td>
        </template>
        <template #head(opt)>{{ `` }}</template>
        <template #cell(kits)="data">
          <span v-html="data.value"></span>
        </template>
        <template #cell(productos)="data">
          <span v-html="data.value"></span>
        </template>

        <!-- <template #cell(fecha_de_creación)="data">
          <span>{{
            data.value.substring(0, data.value.lastIndexOf("de"))
          }}</span>
        </template>
        <template #cell(fecha_de_entrega)="data">
          <span>{{
            data.value.substring(0, data.value.lastIndexOf("de"))
          }}</span>
        </template> -->
        <template #cell(opt)="data"
          ><b-dropdown right style="max-width:100%;" variant="white" no-caret>
            <template #button-content>
              <b-icon
                scale="1.1"
                icon="three-dots-vertical"
                aria-hidden="true"
              ></b-icon>
            </template>
            <b-dropdown-item-button
              @click.stop="editOrder(data.item.ID)"
              tabindex="-1"
              variant="info"
            >
              <b-icon icon="pencil"></b-icon>
              Editar
            </b-dropdown-item-button>
            <div
              v-if="
                itemsToShow.find((el) => el.ID === data.item.ID).status !==
                  'Entregado'
              "
            >
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item-button
                variant="success"
                @click.stop="changeStatus(data.item.ID)"
              >
                <b-icon icon="journal-check"></b-icon>
                Cambiar status
              </b-dropdown-item-button>
            </div>
          </b-dropdown>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import { mapState } from "vuex";
  import filterItems from "../../components/filterItems";
  import createId from "../../mixins/idCreator.js";
  import { format, compareAsc } from "date-fns";
  import { es } from "date-fns/locale";
  export default {
    name: "orders",
    mixins: [createId],
    components: { filterItems },
    data() {
      return {
        dateUtils: {
          format,
          es,
          compareAsc,
        },
        items: [],
        itemsToShow: [],
        prices: {},
        kitPrices: {},
        productPrices: {},
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

    computed: {
      ...mapState(["orders"]),
      async productAndKitsText() {
        if (this.orders) {
          let paragraphsOfKitsAndProduct = {};
          for (const nameOfActualItem of this.orders) {
            paragraphsOfKitsAndProduct[nameOfActualItem.id] = {};
            let queryProducts = nameOfActualItem.products;
            let queryKits = nameOfActualItem.kits;
            if (queryProducts) {
              let productsArray = Object.values(queryProducts).map((el) => {
                return `${el.name}:&nbsp;${
                  queryProducts[el.name].quantity
                } <br/>`;
              });
              let productsParagraph = productsArray
                ? productsArray.join(", ")
                : "-";

              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].products = productsParagraph;
            }
            if (queryKits) {
              let kitsArray = Object.values(queryKits).map((el) => {
                return `${el.name}:&nbsp;${queryKits[el.name].quantity} <br/>`;
              });
              let kitsParagraph = kitsArray ? kitsArray.join("") : "-";
              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].kits = kitsParagraph;
            }
          }

          return paragraphsOfKitsAndProduct;
        }
      },
    },
    created() {
      this.setItems();
    },
    methods: {
      formatDate(date) {
        if (!date) return;
        return this.dateUtils.format(new Date(date), "PPP", {
          locale: this.dateUtils.es,
        });
      },
      isItDelayed({ deliveryTime }) {
        const comparation = this.dateUtils.compareAsc(
          new Date(),
          new Date(deliveryTime)
        );
        return comparation !== 1 ? false : true;
      },
      async changeStatus(id) {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/orders/${id}/status`
          )
          .set("Entregado");

        this.items.find((el) => el.ID === id).estado = "Entregado";
        this.items.find((el) => el.ID === id)._rowVariant = "success";
      },
      async setItems() {
        let texts = await this.productAndKitsText;
        this.items = [];
        if (this.orders) {
          this.orders.forEach(async (element) => {
            if (!element.id) return false;
            this.items.push({
              ID: element.id,
              cliente: element.client,
              productos: texts[element.id].products || "-",
              kits: texts[element.id].kits || "-",
              importancia: element.importance,
              fecha_de_creación: this.formatDate(element.createdAt),
              fecha_de_entrega: this.formatDate(element.deliveryTime),
              precio: `$${element.price}`,
              estado: element.status,
              opt: undefined,
              _rowVariant:
                element.status === "Entregado"
                  ? "success"
                  : this.isItDelayed({
                      deliveryTime: element.deliveryTime,
                    })
                  ? "danger"
                  : null,
            });
            this.itemsToShow = this.items;
          });
        }
      },
      deleteOrder(order) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/orders/${order}`
        ).remove();
      },
      editOrder(order) {
        this.$store.commit("changeName", order);
        this.$router.push("ver-pedido");
      },
    },
  };
</script>

<style scoped>
  h1 {
    text-align: center;
    padding-top: 20px;
  }
  .table {
    max-width: 100%;
  }
</style>
