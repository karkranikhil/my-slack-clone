import React, { Component } from 'react'
import mime from 'mime-types'
import { Input, Button, Icon, Modal } from 'semantic-ui-react';

class FileModal extends Component{
    state={
        file:null,
        authorized:['image/jpeg', 'image/png']
    }
    addFile=event=>{
        const file = event.target.files[0]
        if(file){
            this.setState({file})
        }
    }
    sendFile=()=>{
        const {file} = this.state
        const {uploadFile, closeModal} = this.props
        if(file !==null){
            if(this.isAuthorize(file.name)){
                const metadata={contentType:mime.lookup(file.name)}
                uploadFile(file, metadata)
                closeModal()
                this.clearFile()
            }
        }
    }
    isAuthorize=fileName=>this.state.authorized.includes(mime.lookup(fileName))
    clearFile=()=>this.setState({file:null})
    render(){
        const {modal, closeModal} = this.props
        return(
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>
                    Select an Image FileModal
                </Modal.Header>
                <Modal.Content>
                    <Input
                    fluid
                    onChange={this.addFile}
                    label="File types: jpg, png"
                    name="file"
                    type="file"/>

                </Modal.Content>
                <Modal.Actions>
                    <Button 
                    color="green"
                    inverted
                    onClick={this.sendFile}>
                        <Icon name="checkmark"/> Send
                    </Button>
                    <Button color="red"
                    inverted onClick={closeModal}>
                        <Icon name="remove"/> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal