import React, { Component } from 'react'
import firebase from '../../firebase'
import {Menu, Icon, Modal, Form, Button, Input, Label} from 'semantic-ui-react'

import {connect} from 'react-redux'
import {setCurrentChannel, setPrivateChannel} from '../../actions/index'
class Channels extends Component{
    /** Initial States */
    state={
        activeChannel:'',
        channels:[],
        modal:false,
        channelName:'',
        channelDetails:'',
        channelRef:firebase.database().ref('channels'),
        user:this.props.currentUser,
        firstLoad:true,
        channel:null,
        messagesRef:firebase.database().ref('messages'),
        notifications:[],
        typingRef:firebase.database().ref('typing')

    }
    /** Lifecycle Hook On  Mount */
    componentDidMount(){
        this.addListners()
    }
    /** get all the channels in DB */
    addListners=()=>{
        let loadedChannels=[]
        this.state.channelRef.on('child_added', snap=>{ //snap is callback
            loadedChannels.push(snap.val())
            console.log(loadedChannels)
            this.setState({channels:loadedChannels},()=>this.setFirstChannel())
            this.addNotificationListner(snap.key)
        })
    }

    addNotificationListner = channelId=>{
        this.state.messagesRef.child(channelId).on('value', snap=>{
            if(this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap )
            }
        })
    }
    handleNotifications =(channelId, currentChannelId, notifications, snap)=>{
        let lastTotal = 0;
        let index = notifications.findIndex(notification =>notification.id === channelId)
        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total
                if(snap.numChildren() - lastTotal>0){
                    notifications[index].count = snap.numChildren()-lastTotal
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        } else {
            notifications.push({
                id:channelId,
                total:snap.numChildren(),
                lastKnownTotal:snap.numChildren(),
                count:0
            })
        }
        this.setState({notifications})
    }
    /** set the first channels */
    setFirstChannel=()=>{
        if(this.state.firstLoad && this.state.channels.length>0){
            const firstChannel = this.state.channels[0]
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
            this.setState({channel:firstChannel})
        }
        this.setState({firstLoad:false})
    }
    /** set the active channel id to the activeChannel state */
    setActiveChannel=channel=>{
        this.setState({activeChannel:channel.id})
    }
     /** Lifecycle Hook On un Mount */
     componentWillUnmount(){
        this.removeListners()
    }
    
    removeListners=()=>{
        this.state.channelRef.off()
    }


    

    
    /**CLose modal handler */
    closeModal=()=>this.setState({modal:false})

    /**Open modal handler */
    openModal=()=>this.setState({modal:true})

    /**form Field change handler */
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    }
    /** channel form in modal submit handler */
    handleSubmit = event=>{
        event.preventDefault()
        if(this.isFormValid(this.state)){
            this.addChannel()
        }
    }
    /** channel form in modal validation handler */
    isFormValid=({channelName, channelDetails})=>channelName && channelDetails
    /** channel form in modal add channel handler to save channel in DB */
    addChannel=()=>{
        const {channelRef, channelName, channelDetails, user} = this.state
        const key = channelRef.push().key // this generate a unique key
        const newChannel={
            id:key,
            name:channelName,
            details:channelDetails,
            createdBy:{
                name:user.displayName,
                avatar:user.photoURL
            }
        }
        channelRef.child(key).update(newChannel).then(()=>{
            this.setState({channelName:'', channelDetails:''});
            this.closeModal()
            console.log('channelAdded')
        }).catch(err=>console.log(err))
    }
    
    
    getNotificationCount=channel=>{
        let count =0
        this.state.notifications.forEach(notification=>{
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if(count>0) return count
    }

    /***Rendered the channel list */
    displayChannels=channels=>(
        channels.length>0 && channels.map(channel=>(
            <Menu.Item key={channel.id} onClick={()=>this.changeChannel(channel)} name={channel.name} style={{opacity:0.7}} active={channel.id === this.state.activeChannel}>
                {this.getNotificationCount(channel)&&(
                    <Label color="Red">{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    )
    /** change the channel */
    changeChannel=channel=>{
        this.setActiveChannel(channel)
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove()
        this.clearNotifications()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})
    }
    clearNotifications=()=>{
        let index = this.state.notifications.findIndex(notification=>notification.id === this.state.channel.id)
        if(index !== -1){
            let updateNotifications = [...this.state.notifications]
            updateNotifications[index].total = this.state.notifications[index].lastKnownTotal
            updateNotifications[index].count =0
            this.setState({notifications:updateNotifications})
        }
    }
    render(){
        const {channels, modal, channelName, channelDetails}=this.state
        return(
            <React.Fragment>
                {/** Channels menu list */}
            <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="exchange"/>CHANNELS
                </span>{" "}
                ({channels.length}) <Icon name="add" onClick={this.openModal}/>
            </Menu.Item>
            {this.displayChannels(channels)}
        </Menu.Menu>
        {/** add channel Modal */}
        <Modal open={modal} onClose={this.closeModal}>
            <Modal.Header>Add a channel</Modal.Header>
            <Modal.Content>
            <Form>
                <Form.Field>
                <label htmlFor="channelName">Name of Channel</label>
                <Input id="channelName" name="channelName" placeholder='Enter Name of channel' value={channelName} onChange={this.handleChange} />
                </Form.Field>
                <Form.Field>
                <label htmlFor="channelDetails">About the Channel</label>
                <Input id="channelDetails" name="channelDetails" placeholder='Enter about the channel' value={channelDetails} onChange={this.handleChange} />
                </Form.Field>
            </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="green" onClick={this.handleSubmit}>
                    <Icon name="checkmark"/> Add
                </Button>
                <Button color="red" onClick={this.closeModal}>
                    <Icon name="remove"/> cancel
                </Button>

            </Modal.Actions>
        </Modal>
        </React.Fragment>
        )
        
    }
}
export default connect(null , {setCurrentChannel, setPrivateChannel})(Channels)