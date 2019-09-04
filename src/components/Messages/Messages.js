import React, { Component } from 'react'
import  MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import {Segment, Comment} from 'semantic-ui-react'
import firebase from '../../firebase'
import Message from './Message'
class Messages extends Component{
    state={
        privateChannel:this.props.isPrivateChannel,
        privateMessagesRef:firebase.database().ref('privateMessages'),
        messages:[],
        messagesLoading:false,
        messagesRef:firebase.database().ref('messages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResult:[]

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
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added', snap=>{
            loadedMessage.push(snap.val())
            console.log(loadedMessage)
            this.setState({
                messages:loadedMessage,
                messagesLoading:false
            })
            this.countUniqueUsers(loadedMessage)
        })
    }

    getMessagesRef=()=>{
        const {messagesRef, privateMessagesRef, privateChannel} = this.state
        return privateChannel? privateMessagesRef:messagesRef
    }

    countUniqueUsers=messages=>{
        const uniqueUsers = messages.reduce((acc, message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name)
            }
            return acc;
        },[])
        const plural = uniqueUsers.length>0 || uniqueUsers.length === 0
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's':''}`
        this.setState({numUniqueUsers})
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

    displayChannelName=channel=>{
      return  channel? `${this.state.privateChannel ? '@':'#'}${channel.name}`:''
    }
    handleSearchChange  = event =>{
        this.setState({
            searchTerm:event.target.value,
            searchLoading:true
        }, ()=>this.handleSearchMessages())
    }

    handleSearchMessages=()=>{
        const channelMessages =[...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, 'gi')
        const searchResult  = channelMessages.reduce((acc, message)=>{
            if((message.content && message.content.match(regex)) || (message.user && message.user.name.match(regex))){
                acc.push(message)
            }
            return acc
        },[])
        this.setState({searchResult})
        setTimeout(()=>this.setState({searchLoading:false}), 1000)
    }
    render(){
        const {messagesRef, messages, channel, user, numUniqueUsers, searchResult, searchTerm, searchLoading, privateChannel} = this.state
        return(
            <React.Fragment>
                <MessagesHeader 
                channelName={this.displayChannelName(channel)}
                numUniqueUsers={numUniqueUsers}
                handleSearchChange={this.handleSearchChange}
                searchLoading={searchLoading}
                isPrivateChannel={privateChannel}/>
                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResult):this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm
                 messagesRef={messagesRef}
                 currentChannel={channel}
                 currentUser={user}
                 isPrivateChannel={privateChannel}
                 getMessagesRef={this.getMessagesRef}/>
            </React.Fragment>
        )
    }
}
export default Messages