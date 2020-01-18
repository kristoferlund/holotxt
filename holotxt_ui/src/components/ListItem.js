import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import { Icon, List } from 'semantic-ui-react'
import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import formatDistance from 'date-fns/formatDistance'
import isObject from 'lodash/isObject'

export const ListItem = (props) => {
  const [textData, setTextData] = useState(null)
  const [loaded, setLoaded] = useState(false)
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
              setTextData(obj.Ok)
            }
            setLoaded(true)
          })
      } catch (err) {
        //
      }
    }
  }, [hc, props.address])

  if (props.address && textData) {
    const fromNow = formatDistance(parseInt(textData.timestamp), Date.now())
    return (
      <List.Item>
        <List.Content floated='right'>
          <List.Description style={styles.listDescription}>{fromNow} ago</List.Description>
        </List.Content>
        <Icon name='file text' color='black' />
        <List.Content>
          <div className='mb2'><Link to={`/${props.address}`} className='f5 f4-ns fw6 link dim black'>{textData.name}</Link></div>
        </List.Content>
      </List.Item>
    )
  }

  if (!loaded) {
    return (
      <List.Item>
        <Icon name='file text' color='black' />
        <List.Content>
          <div className='w4 bg-black-10 pv2 mb2' />
        </List.Content>
      </List.Item>
    )
  }

  return null
}

const styles = {
  listDescription: {
    color: '#666'
  }
}
