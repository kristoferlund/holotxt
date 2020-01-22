import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React from 'react'

import { Button } from 'semantic-ui-react'

export const SaveTextButton = (props) => {
  const hc = useHolochain()

  if (props.isSaving) {
    return (
      <Button
        loading
        content='Saving…'
        floated='right'
        size='mini'
      />
    )
  }
  return (
    <>
      <Button
        disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
        content='Save'
        icon='save'
        labelPosition='left'
        floated='right'
        size='mini'
        onClick={props.onClick}
      />
    </>
  )
}
