import firebase from "firebase";
import router from "../../router/index";
const state = {
  userProfile: {},
  loggedIn: false,
};
// users/${this.$store.getters['user/userProfile'].uid}
const getters = {
  userProfile: ({ userProfile }) => userProfile,
  loggedIn: ({ loggedIn }) => loggedIn,
};

const mutations = {
  USER_DETAILS(state, userProfile) {
    state.loggedIn = true;
    console.log(userProfile.uid);
    state.userProfile = {
      name: userProfile.displayName,
      uid: userProfile.uid,
    };
  },
  LOGOUT(state) {
    state.loggedIn = false;
    state.userProfile = {};
  },
};

const actions = {
  async login(store) {
    if (store.state.loggedIn) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
      router.push("/materias-primas");
    } catch (error) {
      console.log(error);
    }
  },

  async logout() {
    try {
      console.log(22);
      await firebase.auth().signOut();
    } catch (error) {
      console.log(error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};