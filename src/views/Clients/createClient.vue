<template>
  <client-layout
    clientOrSupplier="clients"
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
  ></client-layout>
</template>

<script>
  import clientLayout from "../../components/layouts/clientAndSupplierLayout";
  export default {
    components: { clientLayout },
    name: "create-client",
    data() {
      return {
        streetName: "",
        streetNumber: "",
        name: "",
        surname: "",
        phoneNumber: "",
        prefix: "11",
        company: "",
        loc: "Ciudad",
        notes: "",
        id: "",
      };
    },
  };
</script>

<style scoped></style>
