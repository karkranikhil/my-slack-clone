import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/storage"
const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
  firebase.initializeApp(config)
  export default firebase
