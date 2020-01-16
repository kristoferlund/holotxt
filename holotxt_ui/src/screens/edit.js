import * as Y from 'yjs'
import React, { useEffect, useState } from 'react'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import { Editor } from '../components/Editor'
import { Link } from 'react-router-dom'
import { SaveTextButton } from '../components/SaveTextButton'
import { TitleInput } from '../components/TitleInput'
import { WebrtcProvider } from 'y-webrtc'
import { Loader } from 'semantic-ui-react'

import isObject from 'lodash/isObject'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('holo.txt room', ydoc, {
  signaling: ['wss://signallingserver.herokuapp.com']
})

const defaultText = (text) => [{
  type: 'paragraph',
  children: [{ text: text }]
}]

const defaultTextObj = {
  name: 'Title',
  contents: defaultText('Text')
}

export const ScreensEdit = ({ match: { params } }) => {
  const hc = useHolochain()
  const { textAddress } = params
  const [textObj, setTextObj] = useState(null)
  const [loadErrorMsg, setLoadErrorMsg] = useState(null)

  const ymap = ydoc.getMap(textAddress)
  ydoc.on('update', update => {
    Y.applyUpdate(ydoc, update)
    setTextObj(ymap.get('text_obj'))
  })

  const handleInputChange = (key, value) => {
    const newTextObj = {
      ...textObj,
      [key]: value
    }
    setTextObj(newTextObj)
    ymap.set('text_obj', newTextObj)
  }

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED) {
      try {
        hc.connection.callZome(
          'holotxt',
          'txt',
          'get_text')({ 'text_address': textAddress })
          .then((result) => {
            const obj = JSON.parse(result)
            console.log(obj)
            if (!isObject(obj)) {
              throw new Error('Server returned invalid response')
            }
            if (obj.Ok) {
              // Initialize textObj
              const hcTextObj = obj.Ok
              try {
                hcTextObj.contents = JSON.parse(hcTextObj.contents)
              } catch (err) {
                hcTextObj.contents = defaultText(hcTextObj.contents)
              }
              // Set text obj values to working if present
              const yTextObj = ymap.get('text_obj')
              hcTextObj.name = yTextObj && yTextObj.name
                ? yTextObj.name
                : hcTextObj.name
              hcTextObj.contents = yTextObj && yTextObj.contents
                ? yTextObj.contents
                : hcTextObj.contents
              hcTextObj.text_address = textAddress
              setTextObj(hcTextObj)
              return
            }
            if (obj.Err) {
              if (obj.Err.Internal) {
                setLoadErrorMsg(obj.Err.Internal)
                return
              }
            }
            throw new Error('Server returned invalid response')
          })
      } catch (err) {
        console.error(err)
        setLoadErrorMsg(err.message)
      }
    }
  }, [hc.connection, hc.status, textAddress, ymap])

  if (loadErrorMsg) {
    return (
      <div style={styles.top}>
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
        <div className='f4 lh-copy pt3'>
          {loadErrorMsg}
        </div>
      </div>
    )
  }

  if (!textObj) {
    return (
      <Loader active inline='centered' />
    )
  }

  return (
    <>
      <div style={styles.top}>
        <SaveTextButton textObj={textObj} />
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
      </div>
      <TitleInput
        onChange={(e, data) => {
          handleInputChange('name', data.value)
        }}
        title={textObj.name}
      />
      <div className='f5 gray'>Text address: {textAddress}</div>
      <div style={styles.editor}>
        <Editor
          textObj={textObj}
          onChange={
            (text) => {
              handleInputChange('contents', text)
            }}
        />
      </div>
    </>
  )
}

const styles = {
  top: {
    height: 100
  },
  editor: {
    marginTop: 30
  }
}
