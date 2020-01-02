import React, { useState } from 'react'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import { Button } from 'semantic-ui-react'

export const SaveTextButton = (props) => {
  const { textObj } = props
  const [creating, setCreating] = useState(false)
  const hc = useHolochain()

  const _save = (fn, data) => {
    hc.connection.callZome(
      'holotxt',
      'txt',
      fn)(data)
      .then((result) => {
        setCreating(false)
        hc.setMeta('lastListUpdate', new Date().getTime())
      })
  }

  const saveText = () => {
    if (hc.status === CONNECTION_STATUS.CONNECTED) {
      setCreating(true)
      try {
        const data = {
          ...textObj,
          'contents': JSON.stringify(textObj.contents),
          'timestamp': new Date().getTime()
        }
        if (hc.meta.agent_address !== textObj.author_id) {
          data.agent_address = textObj.author_id
          _save('remote_save_text', data)
          return
        }
        _save('save_text', data)
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
        content='Saving…'
        floated='right'
        size='mini'

      />
    )
  }
  return (
    <Button
      disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
      content='Save'
      icon='save'
      labelPosition='left'
      floated='right'
      size='mini'
      onClick={saveText}
    />
  )
}
