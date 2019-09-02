import React, { Component } from 'react'
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom'
import firebase from '../../firebase'
import * as CONSTANTS  from '../constants';
 
class Register extends Component{
    state={
        username:'',
        email:'',
        password:'',
        passwordConfirmation:'',
        errors:[]
    }

    /** Form fields change handler**/
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    }
    
    /** Form Submit handler**/
    handleSubmit=event=>{
        if(this.isFormValid()){
            event.preventDefault();
            firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(createdUser=>{
                console.log(createdUser)
            })
            .catch(err=>console.error(err))
        }
        
    }

    /** form validations**/
    isFormValid=()=>{
        let errors=[]
        let error;
        if(this.isFormEmpty(this.state)){
            error={message:CONSTANTS.ErrorMessages.ALL_FIELDS_MANDATORY}
            this.setState({errors:errors.concat(error)})
            return false
        } else if(!this .isPasswordValid()){
            return false
        } else {
            return true
        }
    }

    /** empty field validations **/
    isFormEmpty=({username, email, password, passwordConfirmation})=>{
        console.log('isFormEmpty')
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }
    /** password validations **/
    isPasswordValid=({password, passwordConfirmation})=>{
        let errors=[]
        let error;
        if(password.length <6 || passwordConfirmation<6){
            error={message:CONSTANTS.ErrorMessages.PASSWORD_LENGTH_6}
            this.setState({errors:errors.concat(error)})
            return false
        } else if(password !== passwordConfirmation){
            error={message:CONSTANTS.ErrorMessages.PASSWORD_MISMATCH}
            this.setState({errors:errors.concat(error)})
            return false
        } else {
            return true
        }
    }

    /** display error for the  */
    displayErrors =errors =>errors.map((error, i)=> <p key={i}>{error.message}</p>)

    render(){
        const  {username, email, password, passwordConfirmation, errors} = this.state
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" color="orange" textAlign="center">
                        <Icon name="shield alternate" color="orange"/>
                        Register for DevChat
                    </Header>
                    <Form size="large" autoComplete="off" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input  type="text" fluid name="username" icon="user" iconPosition="left"
                            placeholder="Username" onChange={this.handleChange} value={username}/>
                            <Form.Input  type="email" fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email Address" onChange={this.handleChange} value={email}/>
                            <Form.Input  type="password" fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" onChange={this.handleChange} value={password}/>
                            <Form.Input  type="password" fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" onChange={this.handleChange} value={passwordConfirmation}/>

                            <Button color="orange" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length>0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}

                        </Message>
                        
                    )}
                    <Message>Already a user?<Link to="/login"> Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
export default Register