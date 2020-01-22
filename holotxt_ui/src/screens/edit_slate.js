
import * as Y from 'yjs'
import * as globalState from '../redux'
import * as txtApi from '../api/txt'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useEffect, useState } from 'react'

import { Editor } from '../components/Editor'
import { Link } from 'react-router-dom'
import { Loader } from 'semantic-ui-react'
import { SaveTextButton } from '../components/SaveTextButton'
import { TitleInput } from '../components/TitleInput'
import { WebrtcProvider } from 'y-webrtc'

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
  const hc = useHolochain()
  const ymap = ydoc.getMap(textAddress)

  const [textObj, setTextObj] = useState(null)
  const [loadErrorMsg, setLoadErrorMsg] = useState(null)
  const [hasFetchedText, setHasFetchedText] = useState(false)

  useEffect(() => {
    ydoc.on('update', update => {
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
    console.log('change')
    ymap.set('text_obj', newTextObj)
  }

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED &&
      hc.meta.agent_address &&
      !hasFetchedText) {
      setHasFetchedText(true)
      txtApi.call(hc, 'get_text', { 'text_address': textAddress })
        .then((txt) => {
          txt.text_address = textAddress
          try {
            txt.contents = JSON.parse(txt.contents)
          } catch (err) {
            txt.contents = defaultText(txt.contents)
          }
          setTextObj(txt)
          globalState.addToHistory({
            'address': txt.text_address,
            'name': txt.name,
            'timestamp': txt.timestamp
          })
        }, (err) => {
          console.error(err)
          if (err.data && err.data.Internal) {
            setLoadErrorMsg(err.data.Internal)
          }
        })
    }
  }, [hc, textAddress, hasFetchedText])

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
