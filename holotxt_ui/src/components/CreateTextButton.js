import * as globalState from '../redux'
import * as txtApi from '../api/txt'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import React, { useState } from 'react'
import { Button } from 'semantic-ui-react'

export const CreateTextButton = () => {
  const [isCreating, setIsCreating] = useState(false)
  const hc = useHolochain()

  const createText = () => {
    if (hc.status === CONNECTION_STATUS.CONNECTED) {
      setIsCreating(true)
      const defaultNewText = {
        'name': 'New text',
        'contents': "Let's write something…",
        'timestamp': new Date().getTime()
      }
      txtApi.call(hc, 'create_text', defaultNewText)
        .then((address) => {
          globalState.addToList({
            address: address,
            name: defaultNewText.name,
            timestamp: defaultNewText.timestamp
          })
          setIsCreating(false)
        }, (err) => {
          console.error(err)
          setIsCreating(false)
          // TODO Notify unable to create text
        })
    }
  }

  if (isCreating) {
    return (
      <Button
        loading
        content='Creating…'
        floated='right'
        size='mini'
      />
    )
  }
  return (
    <Button
      disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
      content='Create'
      icon='add'
      labelPosition='left'
      floated='right'
      onClick={createText}
      size='mini'
    />
  )
}
