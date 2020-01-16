import { Button, Header, Input } from 'semantic-ui-react'
import { CreateTextButton, TextList } from '../components/TextList'
import React, { useState } from 'react'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import { Link } from 'react-router-dom'

export const ScreensIndex = () => {
  const hc = useHolochain()
  const [openAddress, setOpenAddress] = useState('')

  return (
    <>
      <p className='f4 lh-copy'>
        <strong>__holo.txt:</strong>Proof of concept Holochain app showcasing simple collaborative notes editing. Makes use of the <a href='https://github.com/kristoferlund/react-holochain-hook' target='_blank' rel='noopener noreferrer'>useHolochain</a> React hook to simplify UI communication with Holochain, <a href='https://www.slatejs.org/' target='_blank' rel='noopener noreferrer'>Slate</a> for editing and <a href='https://yjs.dev/' target='_blank' rel='noopener noreferrer'>Yjs</a> for realtime sync between clients.
      </p>
      <p className='f5 gray mb4'>Agent address: {hc.meta.agent_address}</p>

      <CreateTextButton />
      <Header as='h2' dividing>My texts</Header>
      <TextList />

      <Input fluid placeholder='Open text by address...' onChange={(e, data) => {
        setOpenAddress(data.value)
      }}>
        <input />
        <Button
          className='ml2'
          as={Link}
          to={`/${openAddress}/edit`}
          disabled={hc.status !== CONNECTION_STATUS.CONNECTED}
          content='Open'
          style={styles.openButton}
        />
      </Input>
      <p className='f4 lh-copy mt4'>
        <a href='https://github.com/kristoferlund/holotxt' target='_blank' rel='noopener noreferrer'>🔗 https://github.com/
        kristoferlund/holotxt</a>
      </p>
    </>
  )
}

const styles = {
  openButton: {
    marginLeft: 10
  }
}
