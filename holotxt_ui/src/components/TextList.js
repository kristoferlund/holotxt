import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useEffect, useState } from 'react'

import { List } from 'semantic-ui-react'
import { ListItem } from '../components/ListItem'

import isObject from 'lodash/isObject'

// import useReactRouter from 'use-react-router'

export const TextList = () => {
  const [textList, setTextList] = useState(null)
  // const [locationKey, setLocationKey] = useState(null)
  const hc = useHolochain()
  // const { location } = useReactRouter()

  // useEffect(() => {
  //   if (location.key !== locationKey) {
  //     if (locationKey !== null) {
  //       fetchList()
  //     }
  //     setLocationKey(location.key)
  //   }
  // }, [location])

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
