import * as globalState from '../redux'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import { List, Loader } from 'semantic-ui-react'
import React, { useEffect, useState } from 'react'

import { ListItem } from '../components/ListItem'

import { fetchTextList } from '../api/txt'

export const TextList = () => {
  const hc = useHolochain()
  const textList = globalState.useTextList()
  const [isFetching, setIsFetching] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED &&
      hc.meta.agent_address &&
      !hasFetched) {
      setHasFetched(true)
      setIsFetching(true)
      fetchTextList(hc).then(() => {
        setIsFetching(false)
      }, (err) => {
        console.error(err)
        setIsFetching(false)
      })
    }
  }, [hc, hasFetched])

  if (Array.isArray(textList) && textList.length > 0) {
    return (
      <List>
        {
          textList.map((text) => <ListItem address={text.address} name={text.name} timestamp={text.timestamp} key={text.address} />)
        }
      </List>
    )
  }

  if (isFetching) {
    return (
      <Loader active inline='centered' />
    )
  }

  return <div className='f4 lh-copy mb3'>No texts here yet.</div>
}
