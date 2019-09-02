import React, { Component } from 'react'
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom'
class Register extends Component{
    styate={}
    handlechange=()=>{

    }
    render(){
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" color="orange" textAlign="center">
                        <Icon name="shield alternate" color="orange"/>
                        Register for DevChat
                    </Header>
                    <Form size="large" autocomplete="off">
                        <Segment stacked>
                            <Form.Input  type="text" fluid name="username" icon="user" iconPosition="left"
                            placeholder="Username" onChange={this.handleChange}/>
                            <Form.Input  type="email" fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email Address" onChange={this.handleChange}/>
                            <Form.Input  type="password" fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" onChange={this.handleChange}/>
                            <Form.Input  type="password" fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" onChange={this.handleChange}/>

                            <Button color="orange" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    <Message>Already a user?<Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
export default Register