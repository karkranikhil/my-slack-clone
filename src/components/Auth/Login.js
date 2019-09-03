import React, { Component } from 'react'
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom'
import firebase from '../../firebase'

 
class Login extends Component{
    state={
        email:'',
        password:'',
        errors:[],
        loading:false,
    }

    /** Form fields change handler**/
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    }
    
    /** Form Submit handler**/
    handleSubmit=event=>{
        const {email, password}= this.state
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.setState({errors:[], loading:true})
            firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(singedInUser=>{
                console.log(singedInUser)
                this.setState({
                    loading:false
                })
            }).catch(err=>{
                console.error(err)
                this.setState({
                    errors:this.state.errors.concat(err),
                    loading:false
                })
            })
        }
        
    }

    isFormValid=({email, password})=> email && password;

    

    /** display error for the  */
    displayErrors =errors =>errors.map((error, i)=> <p key={i}>{error.message}</p>)


    /** handle input error msg */

    handleInputError =(errors, inputName)=>{
        return errors.some(error=>error.message.toLowerCase().includes(inputName)) ? 'error': ''
    }
    render(){
        const  { email, password, errors, loading} = this.state
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" className="slack-color" textAlign="center">
                        <Icon name="american sign language interpreting" className="slack-color"/>
                        Login to Connect
                    </Header>
                    <Form size="large" autoComplete="off" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input  type="email" fluid name="email" icon="mail" iconPosition="left"
                            className={this.handleInputError(errors, 'email')}
                            placeholder="Email Address" onChange={this.handleChange} value={email}/>
                            <Form.Input  type="password" fluid name="password" icon="lock" iconPosition="left"
                            className={this.handleInputError(errors, 'password')}
                            placeholder="Password" onChange={this.handleChange} value={password}/>

                            <Button disabled={loading} className={loading? 'loading slack-bgcolor white-color':'slack-bgcolor white-color'} fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length>0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}

                        </Message>
                        
                    )}
                    <Message>Don't have an account?<Link to="/register" className="slack-color"> Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
export default Login