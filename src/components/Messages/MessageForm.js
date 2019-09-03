import React, { Component } from 'react'
import firebase from '../../firebase'
import {Segment, Button, Input} from 'semantic-ui-react'
class MessageForm extends Component{
    state={
        message:'',
        loading:false,
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        errors:[]
    }
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    }
    createMessage=()=>{
        const message={
            timestamp:firebase.database.ServerValue.TIMESTAMP,
            user:{
                id:this.state.user.uid,
                name:this.state.user.displayName,
                avatar:this.state.user.photoURL,
            },
            content:this.state.message
        }
        return message
    }
    sendMessage=()=>{
        const {messagesRef} = this.props;
        const {message, channel} = this.state
        if(message){
            this.setState({loading:true})
            messagesRef.child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({loading:false, message:'', errors:[]})
            }).catch(err=>{
                console.error(err)
                this.setState({
                    loading:false,
                    errors:this.state.errors.concat(err)
                })
            })
        } else {
            this.setState({
                errors:this.state.errors.concat({message:'Add a message'})
            })
        }
    }
    render(){
        const{errors, message, loading} = this.state
        return(
                <Segment className="message__form">
                    <Input
                        fluid
                        name="message"
                        style={{marginBottom:'0.7em'}}
                        label={<Button icon={'add'}/>}
                        labelPosition="left"
                        value={message}
                        className={errors.some(error=>error.message.toLowerCase().includes('message'))? 'error':''}
                        placeholder="write your messages"
                        onChange={this.handleChange}/>
                    <Button.Group icon widths="2">
                        <Button disabled={loading} className="slack-yellow white-color" content="Add Reply" labelPosition="left" icon="edit" onClick={this.sendMessage}/>
                        <Button className="slack-green white-color" content="Upload Media" labelPosition="right" icon="cloud upload"/>
                    </Button.Group>
                </Segment>
        )
    }
}
export default MessageForm