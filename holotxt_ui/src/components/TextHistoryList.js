import * as globalState from '../redux'

import { List } from 'semantic-ui-react'
import { ListItem } from '../components/ListItem'
import React from 'react'

export const TextHistoryList = () => {
  const textHistoryList = globalState.useTextHistoryList()

  if (Array.isArray(textHistoryList) && textHistoryList.length > 0) {
    return (
      <List>
        {
          textHistoryList.map((text) => <ListItem address={text.address} name={text.name} timestamp={text.timestamp} key={text.address} />)
        }
      </List>
    )
  }
  return <div className='f4 lh-copy mb3'>Here, emptiness.</div>
}
