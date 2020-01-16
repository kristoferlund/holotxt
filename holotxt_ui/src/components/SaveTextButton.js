import { Button } from 'semantic-ui-react'
import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useState } from 'react'

import { ErrorMsg } from '../components/ErrorMsg'

import get from 'lodash/get'
import isObject from 'lodash/isObject'

export const SaveTextButton = (props) => {
  const { textObj } = props
  const [creating, setCreating] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const hc = useHolochain()

  const _save = (fn, data) => {
    try {
      hc.connection.callZome(
        'holotxt',
        'txt',
        fn)(data)
        .then((result) => {
          setCreating(false)
          const obj = JSON.parse(result)
          if (!isObject(obj)) {
            throw new Error('Server returned invalid response')
          }
          if (obj.Ok) {
            hc.setMeta('lastListUpdate', new Date().getTime())
            return
          }
          let error = get(obj, 'Err.Internal')
          if (error.includes('"kind":"Timeout"')) {
            setErrorMsg('Save timeout. Text owner is probably offline.')
            setShowError(true)
            return
          }
          throw new Error('Server returned invalid response')
        }, err => {
          console.error(err)
          setErrorMsg(err.message)
          setShowError(true)
        })
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message)
      setShowError(true)
    }
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
    <>
      <ErrorMsg open={showError} message={errorMsg} onClose={() => setShowError(false)} />
      <Button
        disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
        content='Save'
        icon='save'
        labelPosition='left'
        floated='right'
        size='mini'
        onClick={saveText}
      />
    </>
  )
}
