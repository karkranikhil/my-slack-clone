import React, { Component } from 'react'
import firebase from '../../firebase'
import {Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react'
import { database } from 'firebase';
class Channels extends Component{
    state={
        channels:[],
        modal:false,
        channelName:'',
        channelDetails:'',
        channelRef:firebase.database().ref('channels'),
        user:this.props.currentUser
    }
    /**CLose modal handler */
    closeModal=()=>this.setState({modal:false})

    /**Open modal handler */
    openModal=()=>this.setState({modal:true})

    /**form Field change handler */
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    }
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
    handleSubmit = event=>{
        event.preventDefault()
        if(this.isFormValid(this.state)){
            this.addChannel()
        }
    }
    isFormValid=({channelName, channelDetails})=>channelName && channelDetails
    render(){
        const {channels, modal, channelName, channelDetails}=this.state
        return(
            <React.Fragment>
            <Menu.Menu style={{paddingBottom:'2rem'}}>
            <Menu.Item>
                <span>
                    <Icon name="exchange"/>CHANNELS
                </span>{" "}
                ({channels.length}) <Icon name="add" onClick={this.openModal}/>
            </Menu.Item>
        </Menu.Menu>
        {/** add channel */}
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
export default Channels