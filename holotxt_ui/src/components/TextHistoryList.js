import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useEffect, useState } from 'react'

import { List } from 'semantic-ui-react'
import { ListItem } from '../components/ListItem'

import { getHistory } from '../util/textHistory'

export const TextHistoryList = () => {
  const [textList, setTextList] = useState(null)
  const hc = useHolochain()

  useEffect(() => {
    if (hc.status === CONNECTION_STATUS.CONNECTED && hc.meta.agent_address) {
      const history = getHistory(hc)
      if (history && history.items) {
        setTextList(history.items)
      }
    }
  }, [hc, hc.meta.lastListUpdate])

  if (Array.isArray(textList) && textList.length > 0) {
    return (
      <List>
        {
          textList.map((textAddress) => <ListItem address={textAddress} />)
        }
      </List>
    )
  }
  return <div className='f4 lh-copy mb3'>Here, emptiness.</div>
}
