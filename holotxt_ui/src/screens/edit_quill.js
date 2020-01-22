import 'react-quill/dist/quill.snow.css'

import * as Y from 'yjs'
import * as globalState from '../redux'
import * as txtApi from '../api/txt'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useEffect, useReducer, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'

import { ErrorMsg } from '../components/ErrorMsg'
import { Link } from 'react-router-dom'
import { Loader } from 'semantic-ui-react'
import { QuillBinding } from 'y-quill'
import QuillCursors from 'quill-cursors'
import { SaveTextButton } from '../components/SaveTextButton'
import { TitleInput } from '../components/TitleInput'
import { WebrtcProvider } from 'y-webrtc'

import get from 'lodash/get'

Quill.register('modules/cursors', QuillCursors)

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ]
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
]

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('holo.txt room', ydoc, {
  signaling: ['wss://signallingserver.herokuapp.com']
})

const initialState = {
  fetchStatus: 0
}

const reducer = (state, action) => {
  // console.log(action)
  switch (action.type) {
    case 'reset':
      return {
        ...initialState
      }
    case 'draftTextIsAvailable':
      return {
        ...state,
        draftTextFetched: true,
        fetchStatus: 2
      }
    case 'draftTextNotAvailable':
      return {
        ...state,
        draftTextFetched: false,
        fetchStatus: 1
      }
    case 'hcTextFetched':
      return {
        ...state,
        hcTextFetched: true,
        fetchStatus: 2
      }
    case 'fetchError':
      return {
        ...state,
        fetchError: true,
        fetchErrorMsg: action.msg,
        fetchStatus: 2
      }
    case 'isSaving':
      return {
        ...state,
        isSaving: action.value
      }
    case 'saveError':
      return {
        ...state,
        saveError: action.value,
        saveErrorMsg: action.msg
      }
    case 'clearSaveError':
      return {
        ...state,
        saveError: false,
        saveErrorMsg: undefined
      }
    default:
      throw new Error()
  }
}

export const ScreensEdit = ({ match: { params } }) => {
  const { textAddress } = params
  const ymeta = ydoc.getMap(`${textAddress}_meta`)
  const ytext = ydoc.getText(textAddress)

  const hc = useHolochain()
  const editor = useRef(null)
  const [title, setTitle] = useState('')

  const [state, dispatch] = useReducer(reducer, initialState)

  // Subscribe to title changes
  useEffect(() => {
    const update = () => {
      if (title !== ymeta.get('title')) {
        setTitle(ymeta.get('title'))
      }
    }
    ydoc.on('update', update)
    return () => {
      ydoc.off('update', update)
    }
  })

  // Use draft text if available
  useEffect(() => {
    if (state.fetchStatus === 0) {
      if (ytext.length > 0) {
        setTitle(ymeta.get('title'))
        dispatch({ type: 'draftTextIsAvailable' })
        return
      }
      const timeout = setTimeout(() => {
        if (ytext.length > 0) {
          dispatch({ type: 'draftTextIsAvailable' })
          return
        }
        dispatch({ type: 'draftTextNotAvailable' })
      }, 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [state.fetchStatus])

  // Attempt to fetch text from holochain
  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED &&
      hc.meta.agent_address &&
      state.fetchStatus === 1 &&
      !state.draftTextFetched
    ) {
      txtApi.call(hc, 'get_text', { 'text_address': textAddress })
        .then((txt) => {
          ymeta.set('title', txt.name)
          ymeta.set('author_id', txt.author_id)
          if (ytext.length === 0) {
            ytext.insert(0, txt.contents)
          }
          dispatch({ type: 'hcTextFetched' })
        }, (err) => {
          console.error(err)
          if (err.data && err.data.Internal) {
            dispatch({
              type: 'fetchError',
              msg: err.data.Internal
            })
          }
        })
    }
  }, [hc, textAddress, state])

  // Finished fetching, bind editor, update history
  useEffect(() => {
    if (state.fetchError) {
      return
    }
    if (state.fetchStatus === 2) {
      globalState.addToHistory({
        'address': textAddress,
        'name': ymeta.get('title'),
        'timestamp': new Date().getTime()
      })
      const binding = new QuillBinding(ytext, editor.current.getEditor(), provider.awareness)
      return () => {
        binding.destroy()
        dispatch('reset')
      }
    }
  }, [state.fetchStatus])

  const handleTitleChange = (e, data) => {
    setTitle(data.value)
    ymeta.set('title', data.value)
  }

  const onSaveClick = () => {
    if (hc.status === CONNECTION_STATUS.CONNECTED) {
      const txt = {
        text_address: textAddress,
        name: ymeta.get('title'),
        contents: ytext.toString(),
        timestamp: new Date().getTime()
      }
      dispatch({
        type: 'isSaving',
        value: true
      })
      let fn = 'save_text'
      if (hc.meta.agent_address !== ymeta.get('author_id')) {
        txt.agent_address = ymeta.get('author_id')
        fn = 'remote_save_text'
      }
      try {
        txtApi.saveText(hc, fn, txt)
        dispatch({
          type: 'isSaving',
          value: false
        })
      } catch (err) {
        let msg = err.message
        let internal = get(err.data, 'Internal')
        if (internal && internal.includes('"kind":"Timeout"')) {
          msg = ('Save timeout. Text owner is probably offline.')
        }
        dispatch({
          type: 'saveError',
          value: true,
          msg: msg
        })
      }
    }
  }

  if (state.fetchError) {
    return (
      <div style={styles.top}>
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
        <div className='f4 lh-copy pt3'>
          {state.fetchErrorMsg}
        </div>
      </div>
    )
  }

  if (state.fetchStatus < 2) {
    return (
      <div style={styles.top}>
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
        <div style={styles.loader}>
          <Loader active inline='centered' />
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={styles.top}>
        <Link to='/' className='f4 f3-ns fw6 link dim black'>⟵ Back to list</Link>
      </div>
      <ErrorMsg open={state.saveError} message={state.saveErrorMsg} onClose={() => dispatch({ type: 'clearSaveError' })} />
      <SaveTextButton onClick={onSaveClick} isSaving={state.isSaving} />
      <TitleInput
        title={title}
        onChange={handleTitleChange}
      />
      <div className='f5 gray'>Text address: {textAddress}</div>
      <div style={styles.editor}>
        <ReactQuill
          ref={editor}
          theme='snow'
          modules={modules}
          formats={formats} />
      </div>
    </>
  )
}

const styles = {
  top: {
    height: 100
  },
  loader: {
    marginTop: 100
  },
  editor: {
    marginTop: 30
  }
}
