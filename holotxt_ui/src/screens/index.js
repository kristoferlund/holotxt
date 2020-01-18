import { Button, Header, Input } from 'semantic-ui-react'
import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'
import React, { useState } from 'react'

import { CreateTextButton } from '../components/CreateTextButton'
import { Link } from 'react-router-dom'
import { TextHistoryList } from '../components/TextHistoryList'
import { TextList } from '../components/TextList'

import { clearHistory } from '../util/textHistory'

export const ScreensIndex = () => {
  const hc = useHolochain()
  const [openAddress, setOpenAddress] = useState('')

  return (
    <>
      <div className='f4 lh-copy mb3'>
        <strong>__holo.txt</strong>
      </div>
      <div className='f5 lh-copy gray mb4'>
        Agent address: {hc.meta.agent_address}
      </div>

      <div className='mb4'>
        <Input fluid placeholder='Open text by address...' onChange={(e, data) => {
          setOpenAddress(data.value)
        }}>
          <input />
          <Button
            className='ml2'
            as={Link}
            to={`/${openAddress}`}
            disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
            content='Open'
            style={styles.openButton}
          />
        </Input>

      </div>

      <CreateTextButton />
      <h2 className='f3 lh-header mt0'>My texts</h2>
      <TextList />
      <Button
        disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
        content='Clear history'
        icon='erase'
        labelPosition='left'
        floated='right'
        size='mini'
        onClick={() => { clearHistory(hc) }}
      />
      <h2 className='f3 lh-header mt0'>Recently viewed</h2>
      <TextHistoryList />

      <p className='f4 lh-copy mt4'>
        Proof of concept Holochain app showcasing simple collaborative notes editing. Makes use of the <a href='https://github.com/kristoferlund/react-holochain-hook' target='_blank' rel='noopener noreferrer'>useHolochain</a> React hook to simplify UI communication with Holochain, <a href='https://www.slatejs.org/' target='_blank' rel='noopener noreferrer'>Slate</a> for editing and <a href='https://yjs.dev/' target='_blank' rel='noopener noreferrer'>Yjs</a> for realtime sync between clients.
      </p>
      <p className='f4 lh-copy mt2'>
        <a href='https://github.com/kristoferlund/holotxt' target='_blank' rel='noopener noreferrer'>🔗 https://github.com/
        kristoferlund/holotxt</a>
      </p>
    </>
  )
}

const styles = {
  openButton: {
    marginLeft: 10,
    marginRight: 0
  }
}
