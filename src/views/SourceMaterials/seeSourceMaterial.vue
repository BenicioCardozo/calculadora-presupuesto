<template>
	<div id="container">
		<h1>{{ name }}</h1>
		<b-card-group columns>
			<b-card
				header="Color"
				header-tag="h3"
				border-variant="info"
				align="center"
			>
				<b-card-text v-if="!this.$store.state.edit" text-tag="h4">{{
					characteristics.color
				}}</b-card-text>
				<b-form-select
					v-model="characteristics.color"
					v-else
					:options="colors"
				></b-form-select>
			</b-card>
			<!-- I didn't include the measurement unit field because that won't change very often -->
			<b-card
				header="Calidad"
				header-tag="h3"
				border-variant="info"
				align="center"
			>
				<b-card-text text-tag="h4" v-if="!this.$store.state.edit">{{
					characteristics.quality
				}}</b-card-text>
				<b-form-select
					v-model="characteristics.quality"
					v-else
					:options="qualities"
				></b-form-select>
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
				<b-input v-model="price.amount" v-else type="number"></b-input>
			</b-card>
		</b-card-group>
	</div>
</template>

<script>
	import { db } from '../../firebase/firebase.js';

	export default {
		data() {
			return {
				name: undefined,
				price: 0,
				qualities: ['Alta', 'Media', 'Baja'],
				colors: ['Beige', 'Azul', 'Blanco'],
				price: undefined,
				characteristics: {
					color: undefined,
					quality: undefined,
				},
			};
		},
		created() {
			if (!this.$store.state.nameOfActualItem) return false;
			db.ref('/sourceMaterials/' + this.$store.state.nameOfActualItem).on(
				'value',
				snapshot => {
					this.name = snapshot.val().name;

					this.price = snapshot.val().price;

					this.characteristics = snapshot.val().characteristics;
				}
			);
		},

		watch: {
			price: {
				handler(newPrice) {
					db.ref(`/sourceMaterials/${this.name}/price`).set(newPrice);
				},
				deep: true,
			},
			characteristics: {
				handler(newCharacteristics) {
					db.ref(`/sourceMaterials/${this.name}/characteristics`).set(
						newCharacteristics
					);
				},
				deep: true,
			},
		},
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
