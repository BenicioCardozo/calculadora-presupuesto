<template>
  <div>
    <h1>Pedidos</h1>
    <div>
      <filterItems
        :filtersOpt="[
          {
            type: 'Precio',
            name: 'Precio'
          },
          {
            name: 'Estado',
            type: 'Tipo',
            propToCompare: 'estado',
            types: ['Entregado', 'Pendiente']
          }
        ]"
        :items.sync="items"
        :itemsToShow.sync="itemsToShow"
        action="/crear-pedido"
      ></filterItems>

      <table-component
        lettersForId="PE"
        :itemsToShow="tableItems"
        @deleteItem="deleteOrder"
        @editItem="editOrder"
      >
        <template v-slot:deleteButton="slotProps"
          ><div
            v-if="
              itemsToShow.find((el) => el.ID === slotProps.data.item.ID)
                .estado !== 'Entregado'
            "
          >
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              variant="success"
              @click="changeStatus(slotProps.data.item.ID, 'Delivered')"
            >
              <b-icon icon="journal-check"></b-icon>
              Entregar
            </b-dropdown-item-button>
          </div>
          <div v-else>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button
              @click="changeStatus(slotProps.data.item.ID, 'Pending')"
            >
              <b-icon icon="exclamation-circle-fill"></b-icon>
              Pendiente
            </b-dropdown-item-button>
          </div></template
        >
      </table-component>
    </div>
  </div>
</template>

<script>
  import { db } from '../../firebase/firebase.js';
  import { mapState } from 'vuex';
  import filterItems from '../../components/filterItems';
  import createId from '../../mixins/idCreator.js';
  import { format, compareAsc } from 'date-fns';
  import { es } from 'date-fns/locale';
  import tableComponent from '../../components/table';
  export default {
    name: 'orders',
    mixins: [createId],
    components: { filterItems, tableComponent },
    data() {
      return {
        dateUtils: {
          format,
          es,
          compareAsc
        },
        itemsToShow: [],
        prices: {},
        kitPrices: {},
        productPrices: {},
        months: {
          enero: '01',
          febrero: '02',
          marzo: '03',
          abril: '04',
          mayo: '05',
          junio: '06',
          julio: '07',
          agosto: '08',
          septiembre: '09',
          octubre: '10',
          noviembre: '11',
          diciembre: '12'
        }
      };
    },

    computed: {
      items() {
        let texts = this.productAndKitsText;
        let items = [];
        if (this.orders) {
          this.orders.forEach((element) => {
            if (!element.id) return false;
            items.push({
              ID: element.id,
              cliente: element.client,
              productos: texts[element.id].products || '-',
              kits: texts[element.id].kits || '-',
              importancia: element.importance,
              fecha_de_creación: this.formatDate(element.createdAt),
              fecha_de_entrega: this.formatDate(element.deliveryTime),
              precio: `$${element.price}`,
              estado: element.status,
              opt: undefined,
              _rowVariant:
                element.status === 'Entregado'
                  ? 'success'
                  : this.isItDelayed({
                      deliveryTime: element.deliveryTime
                    })
                  ? 'danger'
                  : null
            });
          });
          this.itemsToShow = items;
          return items;
        }
      },
      tableItems() {
        let res = this.itemsToShow.map((_arrayElement) =>
          Object.assign({}, _arrayElement)
        );
        for (const item of res) {
          item.precio =
            '$' +
            Number(item.precio.replace(/[^0-9&.]/g, '')).toLocaleString(
              'es-AR'
            );
        }
        return res;
      },

      ...mapState(['orders']),
      productAndKitsText() {
        if (this.orders) {
          let paragraphsOfKitsAndProduct = {};
          for (const nameOfActualItem of this.orders) {
            paragraphsOfKitsAndProduct[nameOfActualItem.id] = {};
            let queryProducts = nameOfActualItem.products;
            let queryKits = nameOfActualItem.kits;
            if (queryProducts) {
              let productsArray = Object.values(queryProducts).map((el) => {
                return `${el.name}:\xA0${queryProducts[el.name].quantity} \n`;
              });
              let productsParagraph = productsArray
                ? productsArray.join(', ')
                : '-';

              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].products = productsParagraph;
            }
            if (queryKits) {
              let kitsArray = Object.values(queryKits).map((el) => {
                return `${el.name}:\xA0${queryKits[el.name].quantity} \n`;
              });
              let kitsParagraph = kitsArray ? kitsArray.join('') : '-';
              paragraphsOfKitsAndProduct[
                nameOfActualItem.id
              ].kits = kitsParagraph;
            }
          }

          return paragraphsOfKitsAndProduct;
        }
      }
    },
    methods: {
      formatDate(date) {
        if (!date) return;
        return this.dateUtils.format(new Date(date), 'PPP', {
          locale: this.dateUtils.es
        });
      },
      isItDelayed({ deliveryTime }) {
        const comparation = this.dateUtils.compareAsc(
          new Date(),
          new Date(deliveryTime)
        );
        return comparation !== 1 ? false : true;
      },
      changeStatus(id, newStatus) {
        let status = newStatus === 'Pending' ? 'Pendiente' : 'Entregado';

        this.items.find((el) => el.ID === id).estado = status;
        this.items.find((el) => el.ID === id)._rowVariant =
          status === 'Pendiente' ? null : 'success';
        db.ref(
          `users/${this.$store.getters['user/userProfile'].uid}/orders/${id}/status`
        ).set(status);
      },

      deleteOrder(order) {
        db.ref(
          `users/${this.$store.getters['user/userProfile'].uid}/orders/${order.item.ID}`
        ).remove();
      },
      editOrder(order) {
        console.log(order);
        this.$store.commit('changeName', order.item.ID);
        this.$router.push('ver-pedido');
      }
    }
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
