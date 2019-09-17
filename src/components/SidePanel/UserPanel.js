import React, { Component } from 'react'
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from 'semantic-ui-react'
import firebase from '../../firebase'
import AvatarEditor from 'react-avatar-editor'
class UserPanel extends Component{
    constructor(props){
        super(props)
        this.state={
            modal:false,
            user:this.props.currentUser,
            storageRef:firebase.storage().ref(),
            previewImage:'',
            croppedImage:'',
            uploadCroppedImage:'',
            blob:'',
            userRef:firebase.auth().currentUser,
            usersRef:firebase.database().ref('users'),
            metadata:{
                contentType:'image/jpeg'
            }
        }
    }
    openModel=()=>this.setState({modal:true})
    closeModel=()=>this.setState({modal:false})
    
    dropdownOptions=()=>[
        {key:'user',text:<span>Signed in as <strong>{this.state.user.displayName}</strong></span>},
        {key:'avtar',text:<span onClick={this.openModel}>Change Avatar</span>},
        {key:'signout',text:<span onClick={this.handleSignout}>Sign Out</span>}
    ]

    handleSignout=()=>{
        firebase
        .auth()
        .signOut()
        .then(()=>{
            console.log('signed out!!')
        })
    }
    handleChange=event=>{
        const file = event.target.files[0]
        const reader = new FileReader()
        if(file){
            reader.readAsDataURL(file)
            reader.addEventListener('load', ()=>{
                this.setState({previewImage:reader.result})
            })
        }
    }

    handleCropImage=()=>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{
                let imageUrl = URL.createObjectURL(blob)
                this.setState({
                    croppedImage:imageUrl,
                    blob
                })
            })
        }
    }
    setEditorRef = (editor) => this.avatarEditor = editor


    uploadCroppedImage=()=>{
        const {storageRef, userRef, blob, metadata} = this.state
        storageRef.child(`avatar/users/${userRef.uid}`)
        .put(blob, metadata)
        .then(snap=>{
            snap.ref.getDownloadURL().then(downloadURL=>{
                this.setState({uploadCroppedImage:downloadURL},()=>this.changeAvatar())
            })
        })
    }

    changeAvatar =()=>{
        this.state.userRef
        .updateProfile({
            photoURL:this.state.uploadCroppedImage
        })
        .then(()=>{
            console.log('PhotoURL updated')
            this.closeModel()
        }).catch(err=>{
            console.log(err)
        })
        this.state.usersRef
        .child(this.state.user.uid)
        .update({avatar:this.state.uploadCroppedImage})
        .then(()=>{
            console.log('user avtar updated')
        }).catch(err=>{
            console.log(err)
        })
    }
    render(){
        const {user, modal, croppedImage, previewImage}= this.state
        const {primaryColor} = this.props
        return(
            <Grid style={{background:primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2rem', margin:0}}>
                        {/*App Header*/}
                        <Header inverted floated="left" as="h2">
                            <Icon name="american sign language interpreting"/>
                            <Header.Content>Connect</Header.Content>
                        </Header>
                    {/**User Dropdown */}
                    <Header style={{padding:'0.25rem'}} as="h4" inverted>
                        <Dropdown trigger={
                            <span>
                            <Image src={user.photoURL} spaced="right" avatar/>
                                {user.displayName}
                            </span>
                        } options={this.dropdownOptions()}/>
                    </Header>
                    </Grid.Row>
                    <Modal open={modal} onClose={this.closeModel}>
                        <Modal.Content>
                            <Input 
                            fluid
                            type="file"
                            label="New Avtar"
                            name="previewImage"
                            onChange={this.handleChange}/>
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center alighned grid">
                                        {previewImage && (
                                            <AvatarEditor
                                            ref={this.setEditorRef}
                                            image={previewImage}
                                            width={120}
                                            height={120}
                                            border={50}
                                            scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                            stye={{margin: '3.5rem auto'}}
                                            width={100}
                                            height={100}
                                            src={croppedImage}/>
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="green" onClick={this.uploadCroppedImage}>
                                <Icon name="save"/> Change Avtar
                            </Button>}
                            <Button color="green" onClick={this.handleCropImage}>
                                <Icon name="image"/> Preview
                            </Button>
                            <Button color="red" onClick={this.closeModel}>
                                <Icon name="remove"/> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel