import * as Y from 'yjs'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useEffect, useState } from 'react'

import { Editor } from '../components/Editor'
import { Link } from 'react-router-dom'
import { Loader } from 'semantic-ui-react'
import { SaveTextButton } from '../components/SaveTextButton'
import { TitleInput } from '../components/TitleInput'
import { WebrtcProvider } from 'y-webrtc'

import { addToHistory } from '../util/textHistory'
import isObject from 'lodash/isObject'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('holo.txt room', ydoc, {
  signaling: ['wss://signallingserver.herokuapp.com']
})

const defaultText = (text) => [{
  type: 'paragraph',
  children: [{ text: text }]
}]

export const ScreensEdit = ({ match: { params } }) => {
  const { textAddress } = params
  const ymap = ydoc.getMap(textAddress)
  const [textObj, setTextObj] = useState(null)
  const [loadErrorMsg, setLoadErrorMsg] = useState(null)
  const hc = useHolochain()

  useEffect(() => {
    ydoc.on('update', update => {
      Y.applyUpdate(ydoc, update)
      const t = ymap.get('text_obj')
      if (t) {
        setTextObj(t)
      }
    })
  }, [ymap])

  const handleInputChange = (key, value) => {
    const newTextObj = {
      ...textObj,
      [key]: value
    }
    setTextObj(newTextObj)
    ymap.set('text_obj', newTextObj)
  }

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED && hc.meta.agent_address) {
      try {
        hc.connection.callZome(
          'holotxt',
          'txt',
          'get_text')({ 'text_address': textAddress })
          .then((result) => {
            const obj = JSON.parse(result)
            if (!isObject(obj)) {
              throw new Error('Server returned invalid response')
            }
            if (obj.Ok) {
              // Initialize textObj
              const t = obj.Ok
              try {
                t.contents = JSON.parse(t.contents)
              } catch (err) {
                t.contents = defaultText(t.contents)
              }
              t.text_address = textAddress
              setTextObj(t)
              addToHistory(hc, textAddress)
              return
            }
            if (obj.Err) {
              if (obj.Err.Internal) {
                setLoadErrorMsg(obj.Err.Internal)
                return
              }
            }
            throw new Error('Server returned invalid response')
          }, err => {
            console.error(err)
            setLoadErrorMsg(err.message)
          })
      } catch (err) {
        console.error(err)
        setLoadErrorMsg(err.message)
      }
    }
  }, [hc, textAddress])

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
      <div style={styles.top}>
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
        <Loader active inline='centered' />
      </div>
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
