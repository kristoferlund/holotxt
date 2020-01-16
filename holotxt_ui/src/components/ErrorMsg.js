import { Button, Header, Modal } from 'semantic-ui-react'
import React from 'react'

export const ErrorMsg = (props) => (
  <Modal open={props.open} basic size='small'>
    <Header icon='warning circle' content='Unable to save text' />
    <Modal.Content>
      <p>
        {props.message}
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button basic onClick={props.onClose} inverted>
        Close
      </Button>
    </Modal.Actions>
  </Modal>
)
