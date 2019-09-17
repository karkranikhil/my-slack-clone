import React, { Component } from 'react'
import  MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import {Segment, Comment} from 'semantic-ui-react'
import firebase from '../../firebase'
import Message from './Message'
import {connect} from 'react-redux'
import {setUserPosts} from '../../actions/index'
import Typing from '../Messages/Typing'
import Skeleton from '../Messages/Skeleton'
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
        searchResult:[],
        isChannelStarred:false,
        usersRef:firebase.database().ref('users'),
        typingRef:firebase.database().ref('typing'),
        typingUsers:[],
        connectedRef:firebase.database().ref('.info/connected'),
        listeners:[]
    }
    componentDidMount(){
        const {channel, user, listeners} = this.state
        if(channel && user){
            this.removeListeners(listeners)
            this.addListner(channel.id)
            this.addUserStarsListner(channel.id, user.uid)
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.messagesEnd){
            this.scrollToBottom()
        }
    }
    componentWillUnmount(){
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }

    removeListeners = listeiners=>{
        listeiners.forEach(listeiner=>{
            listeiner.ref.child(listeiner.id).off(listeiner.event)
        })
    }
    addToListeners = (id, ref, event)=>{
        const index = this.state.listeners.findIndex(listener =>{
            return listener.id === id && listener.ref === ref && listener.event === event;
        })
        if(index === -1){
            const newListener = {id, ref, event}
            this.setState({listeiners:this.state.listeners.concat(newListener)})
        }
    }

    scrollToBottom=()=>{
        this.messagesEnd.scrollIntoView({behavior:'smooth'})
    }
    
    addListner = channelId=>{
        this.addMessageListner(channelId)
        this.addTypingListners(channelId)
    }

    addTypingListners=channelId=>{
        let typingUsers=[]
        let {typingRef, user} = this.state
        typingRef.child(channelId).on('child_added', snap=>{
            if(snap.key !== user.uid){
                typingUsers=typingUsers.concat({
                    id:snap.key,
                    name:snap.val()
                })
                this.setState({typingUsers})
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_added')
        typingRef.child(channelId).on('child_removed', snap=>{
            const index = typingUsers.findIndex(user=>user.id == snap.key)
            if(index !==-1){
                typingUsers = typingUsers.filter(user=>user.id !== snap.key)
                this.setState({typingUsers})
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_removed')
        this.state.connectedRef.on('value', snap=>{
            if(snap.val() === true){
                typingRef
                .child(channelId)
                .child(user.uid)
                .onDisconnect()
                .remove(err=>{
                    if(err!==null){
                        console.error(err)
                    }
                })
            }
        })

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
            this.countUserPosts(loadedMessage)
        })
        this.addToListeners(channelId, ref, 'child_added')
    }
    addUserStarsListner=(channelId, userId)=>{
        this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data=>{
            if(data.val() !==null){
                const channelIds = Object.keys(data.val())
                const prevStarred= channelIds.includes(channelId)
                this.setState({isChannelStarred:prevStarred})
            }
        })
    }

    getMessagesRef=()=>{
        const {messagesRef, privateMessagesRef, privateChannel} = this.state
        return privateChannel? privateMessagesRef:messagesRef
    }
    countUserPosts= messages=>{
        let userPosts = messages.reduce((acc, message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count +=1
            } else {
                acc[message.user.name]={
                    avatar:message.user.avatar,
                    count:1
                }
            }
            return acc;
        },{})
        this.props.setUserPosts(userPosts)
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
    handleStar =()=>{
        this.setState(prevState=>({
            isChannelStarred:!prevState.isChannelStarred
        }),()=>this.starChannel())
    }
    starChannel=()=>{
        if(this.state.isChannelStarred){
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .update({
                [this.state.channel.id]:{
                    name:this.state.channel.name,
                    details:this.state.channel.details,
                    createdBy:{
                        name:this.state.channel.createdBy.name,
                        avatar:this.state.channel.createdBy.avatar
                    }
                }
            })
        } else {
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err=>{
                if(err !== null){
                    console.error(err)
                }
            })
        }
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
    displayTypingUsers=users=>(
        users.length>0 && users.map(user=>(
            <div style={{display:'flex', alignItems:'center', marginBottom:'0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} is typing</span><Typing/>
            </div>
        ))
    )
    displayMessagesSkeleton=loading=>(
        loading?(
            <React.Fragment>
                {[...Array(10)].map((_,i)=>(
                    <Skeleton key={i}/>
                ))}
            </React.Fragment>
        ):null
    )
    render(){
        const {messagesRef, messages, channel, user, numUniqueUsers, searchResult, searchTerm, 
            searchLoading, privateChannel, isChannelStarred, typingUsers, messagesLoading} = this.state
        return(
            <React.Fragment>
                <MessagesHeader 
                channelName={this.displayChannelName(channel)}
                numUniqueUsers={numUniqueUsers}
                handleSearchChange={this.handleSearchChange}
                searchLoading={searchLoading}
                isPrivateChannel={privateChannel}
                handleStar={this.handleStar}
                 isChannelStarred={isChannelStarred}/>
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessagesSkeleton(messagesLoading)}
                        {searchTerm 
                            ? this.displayMessages(searchResult)
                            :this.displayMessages(messages)
                            }
                            {this.displayTypingUsers(typingUsers)}
                            <div ref={node=>(this.messagesEnd = node)}></div>
                            
                    </Comment.Group>
                </Segment>
                <MessageForm
                 messagesRef={messagesRef}
                 currentChannel={channel}
                 currentUser={user}
                 isPrivateChannel={privateChannel}
                 getMessagesRef={this.getMessagesRef}
                 />
            </React.Fragment>
        )
    }
}
export default connect(null, {setUserPosts})(Messages)