import React, { Component } from 'react'
import  MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import {Segment, Comment} from 'semantic-ui-react'
import firebase from '../../firebase'
import Message from './Message'
class Messages extends Component{
    state={
        messages:[],
        messagesLoading:false,
        messagesRef:firebase.database().ref('messages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser

    }
    componentDidMount(){
        const {channel, user} = this.state
        if(channel && user){
            this.addListner(channel.id)
        }
    }
    addListner = channelId=>{
        this.addMessageListner(channelId)
    }
    addMessageListner = channelId=>{
        let loadedMessage=[]
        this.state.messagesRef.child(channelId).on('child_added', snap=>{
            loadedMessage.push(snap.val())
            console.log(loadedMessage)
            this.setState({
                messages:loadedMessage,
                messagesLoading:false
            })
        })
    }
    displayMessages=messages=>(
        messages.length>0 && messages.map(message=>(
            <Message
            key={message.timestamp}
            message={message}
            user={this.state.user}
            />
        ))
    )
    render(){
        const {messagesRef, messages, channel, user} = this.state
        return(
            <React.Fragment>
                <MessagesHeader/>
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm
                 messagesRef={messagesRef}
                 currentChannel={channel}
                 currentUser={user}/>
            </React.Fragment>
        )
    }
}
export default Messages