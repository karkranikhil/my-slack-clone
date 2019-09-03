/** global imports  */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
/** redux imports */
import {createStore} from 'redux'
import {Provider, connect} from 'react-redux'
import {composeWithDevTools} from 'redux-devtools-extension'


/***custom imports ****/
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import firebase from './firebase'
import Spinner from './spinner'
/****redux custom imports  ****/
import rootReducer from './reducers/index'
import {setUser, clearUser} from './actions/index'

const store = createStore(rootReducer, composeWithDevTools())

class Root extends Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        console.log(this.props.isLoading)
        firebase.auth().onAuthStateChanged(user=>{
            if(user){
                this.props.setUser(user)
                this.props.history.push('/')
            } else {
                this.props.history.push('/login')
                this.props.clearUser()
            }
        })
    }
    render(){
        return this.props.isLoading? <Spinner/>:(
                <Switch>
                    <Route exact path="/" component={App}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/register" component={Register}/>
                </Switch>
        )
    }
}
const mapDispatchToProps= {
    setUser,
    clearUser
  }
const mapStateToProps=state=>({
    isLoading:state.user.isLoading
}  )
const RootWithAuth = withRouter(connect(mapStateToProps, mapDispatchToProps)(Root))
ReactDOM.render(
    <Provider store={store}>
<Router>
    <RootWithAuth/>
</Router></Provider>
, document.getElementById('root'));
registerServiceWorker();
