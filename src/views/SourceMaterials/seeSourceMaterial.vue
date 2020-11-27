<template>
	<div id="container">
		<h1>{{ nameOfSourceMaterial.name }}</h1>
		<b-card-group columns>
			<b-card
				header="Color"
				header-tag="h3"
				border-variant="info"
				align="center"
			>
				<b-card-text v-if="!this.$store.state.edit" text-tag="h4">{{
					characteristicsOfSourceMaterial.color
				}}</b-card-text>
				<b-form-select v-else :options="colors"></b-form-select>
			</b-card>
			<!-- I didn't include the measurement unit field because that won't change very often -->
			<b-card
				header="Calidad"
				header-tag="h3"
				border-variant="info"
				align="center"
			>
				<b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
					characteristicsOfSourceMaterial.quality
				}}</b-card-text>
				<b-form-select v-else :options="qualities"></b-form-select>
			</b-card>
			<b-card
				header="Precio"
				header-tag="h3"
				border-variant="info"
				align="center"
			>
				<b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
					`$ ${price.amount.toLocaleString()}/${price.measurementUnit}`
				}}</b-card-text>
				<b-input v-else type="number"></b-input>
			</b-card>
		</b-card-group>
	</div>
</template>

<script>
	import { db } from '../../firebase/firebase.js';
	export default {
		data() {
			return {
				nameOfSourceMaterial: undefined,
				characteristicsOfSourceMaterial: undefined,
				price: 0,
				newSourceMaterialsCharacteristics: undefined,
				qualities: ['Alta', 'Media', 'Baja'],
				colors: ['Beige', 'Azul', 'Blanco'],
			};
		},
		created() {
			db.ref('/sourceMaterials/' + this.$store.state.nameOfActualItem).on(
				'value',
				snapshot => {
					this.nameOfSourceMaterial = {
						name: snapshot.val().name,
					};

					this.price = snapshot.val().price;

					this.characteristicsOfSourceMaterial = snapshot.val().characteristics;
				}
			);
		},
		methods: {
			editContent(field) {
				this.characteristicsOfSourceMaterial.edit = false;
				db.ref(
					`sourceMaterials/${this.nameOfSourceMaterial.name}/${field}`
				).set(this.newSourceMaterialsCharacteristics);
			},
		},
		computed: {},
	};
</script>

<style scoped>
	/* div > h3 {
		font-weight: 700;
		font-size: 2.4em;
	}
	div > h3 {
		font-size: 2em;
	} */
	@media screen and (min-width: 576px) {
		.card-columns {
			margin: 20vh 5vh 0 !important;
		}
	}

	h1 {
		margin: 0 0 8vh 0;
	}

	input {
		text-align: center;
		font-weight: 500;
		width: 100%;
	}
	#container {
		text-align: center;
	}
</style>
