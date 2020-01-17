import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import React, { useState } from 'react'
import { Button } from 'semantic-ui-react'

import isObject from 'lodash/isObject'

export const CreateTextButton = () => {
  const [creating, setCreating] = useState(false)
  const hc = useHolochain()

  const createText = () => {
    if (hc.status === CONNECTION_STATUS.CONNECTED) {
      setCreating(true)
      try {
        const newTextDefaults = {
          'name': 'New text',
          'contents': "Let's write something…",
          'timestamp': new Date().getTime()
        }

        hc.connection.callZome(
          'holotxt',
          'txt',
          'create_text')(newTextDefaults)
          .then((result) => {
            const obj = JSON.parse(result)
            if (isObject(obj) && obj.Ok) {
              //
            }
            setCreating(false)
            hc.setMeta('lastListUpdate', new Date().getTime())
          })
      } catch (err) {
        console.error(err)
        //
      }
    }
  }

  if (creating) {
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
