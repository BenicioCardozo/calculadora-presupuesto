import firebase from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import store from "../store/index";
import router from "../router/index";

const firebaseConfig = {
  apiKey: "AIzaSyAPGp8Y-o-U95J9kEN4bzxqESGKdPsopGQ",
  authDomain: "calculadora-de-presupuesto-v2.firebaseapp.com",
  databaseURL: "https://calculadora-de-presupuesto-v2.firebaseio.com",
  projectId: "calculadora-de-presupuesto-v2",
  storageBucket: "calculadora-de-presupuesto-v2.appspot.com",
  messagingSenderId: "555556489716",
  appId: "1:555556489716:web:6354291366de2eb63e51a1",
  measurementId: "G-GMZYNT1J60",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Auth
firebase.auth().onAuthStateChanged((user) => {
  console.log(user);
  if (user) {
    store.commit("user/USER_DETAILS", user);
    router.push("/materias-primas");
  } else {
    store.commit("user/LOGOUT");
  }
});
export const auth = firebase.auth();

export const db = firebase.database();
