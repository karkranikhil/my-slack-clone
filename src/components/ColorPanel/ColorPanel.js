import React, { Component } from 'react'
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react'
import {SliderPicker} from 'react-color'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setColors} from '../../actions'
class ColorPanel extends Component{
    state={
        modal:false,
        primary:'',
        secondary:'',
        user:this.props.currentUser,
        usersRef:firebase.database().ref('users'),
        userColors:[]
    }

    componentDidMount(){
        if(this.state.user){
            this.addListner(this.state.user.uid)
        }
    }
    addListner=userId =>{
        let userColors =[]
        this.state.usersRef.child(`${userId}/colors`).on("child_added", snap=>{
            userColors.unshift(snap.val())
            this.setState({userColors})
        })
    }


    openModal=()=>this.setState({modal:true})

    closeModal=()=>this.setState({modal:false})

    handlerChangeSecondary=color=>this.setState({secondary:color.hex})
    handlerChangePrimary=color=>this.setState({primary:color.hex})

    handleSaveColor=()=>{
        if(this.state.primary && this.state.secondary){
            this.saveColors(this.state.primary,this.state.secondary)
        }
    }
    saveColors =(primary, secondary)=>{
        this.state.usersRef
        .child(`${this.state.user.uid}/colors`)
        .push()
        .update({
            primary,
            secondary
        }).then(()=>{
            console.log("colors added")
            this.closeModal()
        }).catch(err=>console.err(err))
    }

    displayUserColors=colors=>(
        colors.length>0 && colors.map((color,i)=>(
            <React.Fragment>
                <Divider/>
                <div className="color__container" onClick={()=>this.props.setColors(color.primary, color.secondary)}>
                    <div className="color__square" style={{background:color.primary}}>
                        <div className="color__overlay" style={{background:color.secondary}}>
                        
                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )
    render(){
        const {modal, primary, secondary, userColors} = this.state
        return(
            <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin">
                <Divider/>
                <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                {this.displayUserColors(userColors)}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                        <Label content="Primary Color" className="mb-1"/>
                        <SliderPicker color={primary} className="mb-2" onChange={this.handlerChangePrimary}/>
                        </Segment>
                        <Segment inverted>
                        <Label content="Secondary Color" className="mb-1"/>
                        <SliderPicker color={secondary} className="mb-2" onChange={this.handlerChangeSecondary}/>
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColor}>
                            <Icon name="checkmark"/> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}
export default connect(null, {setColors})(ColorPanel)