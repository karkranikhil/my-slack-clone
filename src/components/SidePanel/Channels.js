import React, { Component } from 'react'
import firebase from '../../firebase'
import {Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react'

import {connect} from 'react-redux'
import {setCurrentChannel} from '../../actions/index'
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
        firstLoad:true
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
        })
    }
    /** set the first channels */
    setFirstChannel=()=>{
        if(this.state.firstLoad && this.state.channels.length>0){
            const firstChannel = this.state.channels[0]
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
        }
        this.setState({firstLoad:false})
    }
    /** set the active channel id to the activeChannel state */
    setActiveChannel=channel=>{
        this.setState({activeChannel:channel.id})
    }
     /** Lifecycle Hook On un Mount */
    componentDidUnmount(){
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
    
    

    /***Rendered the channel list */
    displayChannels=channels=>(
        channels.length>0 && channels.map(channel=>(
            <Menu.Item key={channel.id} onClick={()=>this.changeChannel(channel)} name={channel.name} style={{opacity:0.7}} active={channel.id === this.state.activeChannel}>
                # {channel.name}
            </Menu.Item>
        ))
    )
    /** change the channel */
    changeChannel=channel=>{
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel)
    }
    render(){
        const {channels, modal, channelName, channelDetails}=this.state
        return(
            <React.Fragment>
                {/** Channels menu list */}
            <Menu.Menu style={{paddingBottom:'2rem'}}>
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
                <input id="channelName" name="channelName" placeholder='Enter Name of channel' value={channelName} onChange={this.handleChange} />
                </Form.Field>
                <Form.Field>
                <label htmlFor="channelDetails">About the Channel</label>
                <input id="channelDetails" name="channelDetails" placeholder='Enter about the channel' value={channelDetails} onChange={this.handleChange} />
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
export default connect(null , {setCurrentChannel})(Channels)