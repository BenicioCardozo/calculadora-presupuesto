<template>
  <supplier-layout
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
  ></supplier-layout>
</template>

<script>
  import supplierLayout from "../../components/layouts/clientAndSupplierLayout";
  export default {
    components: { supplierLayout },
    name: "create-supplier",
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
