import { Button, Icon, List } from 'semantic-ui-react'
import React, { useEffect, useState } from 'react'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import { Link } from 'react-router-dom'

import formatDistance from 'date-fns/formatDistance'
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

const ListItem = (props) => {
  const [textMeta, setTextMeta] = useState(null)
  const hc = useHolochain()

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED && props.address) {
      try {
        hc.connection.callZome(
          'holotxt',
          'txt',
          'get_text_short')({ 'text_address': props.address })
          .then((result) => {
            const obj = JSON.parse(result)
            if (isObject(obj) && obj.Ok) {
              setTextMeta(obj.Ok)
            }
          })
      } catch (err) {
        //
      }
    }
  }, [hc, props.address])

  if (props.address && textMeta) {
    const fromNow = formatDistance(parseInt(textMeta.timestamp), Date.now())

    return (
      <List.Item>
        <List.Content floated='right'>
          <List.Description style={styles.listDescription}>{fromNow} ago</List.Description>
        </List.Content>
        <Icon name='file text' color='black' />
        <List.Content>
          <div className='mb2'><Link to={`/${props.address}`} className='f5 f4-ns fw6 link dim black'>{textMeta.name}</Link></div>
        </List.Content>
      </List.Item>
    )
  }
  return null
}

export const TextList = () => {
  const [textList, setTextList] = useState(null)
  const hc = useHolochain()

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED && hc.meta.agent_address) {
      try {
        hc.connection.callZome(
          'holotxt',
          'txt',
          'list_texts')({ 'agent_address': hc.meta.agent_address })
          .then((result) => {
            const obj = JSON.parse(result)
            if (isObject(obj) && obj.Ok) {
              setTextList(obj.Ok.links)
            }
          })
      } catch (err) {
        //
      }
    }
  }, [hc, hc.meta.lastListUpdate])

  if (Array.isArray(textList) && textList.length > 0) {
    return (
      <List>
        {
          textList.map((text) => <ListItem address={text.address} />)
        }
      </List>
    )
  }
  return <div className='f4 lh-copy mb3'>No texts here yet.</div>
}

const styles = {
  listDescription: {
    color: '#666'
  }
}
