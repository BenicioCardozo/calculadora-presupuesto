export default {
  methods: {
    createId(firstTwoLetters, firebaseId) {
      let firebaseIdLetters = firebaseId.replace(/[\W\d_]/g, "");
      let fourNumberId = [...firebaseIdLetters]
        .map((el) => el.charCodeAt(0) + 1)
        .reduce((a, b) => a + b, 0);
      return `${firstTwoLetters}${[...fourNumberId.toString()]
        .slice(0, 4)
        .join("")}`;
    },
  },
};
