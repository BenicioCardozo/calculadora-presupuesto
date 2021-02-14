<template>
  <suppliers-layout
    clientOrSupplier="suppliers"
    :streetName.sync="streetName"
    :streetNumber.sync="streetNumber"
    :name.sync="name"
    :surname.sync="surname"
    :phoneNumber.sync="phoneNumber"
    :prefix.sync="prefix"
    :company.sync="company"
    :loc.sync="loc"
    :notes.sync="notes"
    :id.sync="id"
  ></suppliers-layout>
</template>

<script>
  import { db } from "../../firebase/firebase.js";
  import suppliersLayout from "../../components/layouts/clientAndSupplierLayout";
  export default {
    components: { suppliersLayout },
    name: "see-supplier",
    data() {
      return {
        streetName: undefined,
        streetNumber: undefined,
        name: undefined,
        surname: undefined,
        phoneNumber: "",
        prefix: undefined,
        company: undefined,
        loc: "Ciudad",
        notes: undefined,
        id: undefined,
      };
    },
    async created() {
      console.log(this.$store.state.nameOfActualItem);
      let req = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/suppliers/${this.$store.state.nameOfActualItem}`
        )
        .once("value");
      req = req.val();
      this.name = req.name.split(" ")[0].trim();
      this.surname = req.name.split(" ")[1].trim();
      this.streetName = req.address.replace(/[0-9]/g, "").trim();
      this.streetNumber = req.address.replace(/^\D+/g, "");
      this.phoneNumber = req.phoneNumber
        .substring(req.phoneNumber.indexOf(")") + 1)
        .trim();
      this.prefix = req.phoneNumber.substring(
        req.phoneNumber.lastIndexOf("(") + 1,
        req.phoneNumber.lastIndexOf(")")
      );
      this.company = req.company;
      this.loc = req.loc;
      this.notes = req.notes;
      this.id = req.id;
    },
  };
</script>
