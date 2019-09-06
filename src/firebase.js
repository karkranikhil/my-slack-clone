import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/storage"
const config = {
  apiKey: "AIzaSyCe3KPhJVC8UA6kBlDI_JdXxuJFfFozurg",
  authDomain: "react-slack-clone-bd6b5.firebaseapp.com",
  databaseURL: "https://react-slack-clone-bd6b5.firebaseio.com",
  projectId: "react-slack-clone-bd6b5",
  storageBucket: "react-slack-clone-bd6b5.appspot.com",
  messagingSenderId: "124253278773",
  appId: "1:124253278773:web:757b92bad4a91966"
}
  firebase.initializeApp(config)
  export default firebase
