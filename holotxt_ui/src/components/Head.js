import { Button, Container, Icon, Menu } from 'semantic-ui-react'
import React, { useEffect, useState } from 'react'

import { CONNECTION_STATUS, useHolochain } from 'react-holochain-hook'

import { Link } from 'react-router-dom'

const initHc = async (hc) => {
  if (hc && hc.connection) {
    try {
      const res = await hc.connection.callZome(
        'holotxt',
        'txt',
        'get_agent_id'
      )({ args: {} })
      const obj = JSON.parse(res)
      if (obj.Ok) {
        hc.setMeta('agent_address', obj.Ok)
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export const ConnectButton = () => {
  const hc = useHolochain()

  const connect = () => {
    hc.connect()
  }

  if (hc.status === CONNECTION_STATUS.CONNECTING) {
    return (
      <Button
        size='mini'
        color='green'
        loading
        content='Creating…'
        floated='right'
      />
    )
  }
  return (
    <Button
      compact
      size='mini'
      color='green'
      content='Connect'
      icon='power cord'
      labelPosition='left'
      onClick={connect}
    />
  )
}

const ConnectionStatus = () => {
  const hc = useHolochain()

  const statusString = () => {
    switch (hc.status) {
      case CONNECTION_STATUS.CONNECTED:
        return '✅ Connected to Holochain'
      case CONNECTION_STATUS.CONNECTING:
        return (
          <>
            <Icon loading name='spinner' />
            Connecting to Holochain…
          </>
        )
      case CONNECTION_STATUS.NOT_CONNECTED:
        return (
          <>
            <div style={styles.message}>🔴 Not connected to Holochain.</div>
            <ConnectButton />
          </>
        )
      case CONNECTION_STATUS.CONNECT_FAILED:
        return (
          <>
            <div style={styles.message}>🔴 Unable to connect to Holochain.</div>
            <ConnectButton />
          </>
        )
      case CONNECTION_STATUS.ATTEMPTING_RECONNECT:
        return (
          <>
            <Icon loading name='spinner' />
            Holochain connection lost. Attempting reconnect…
          </>
        )
      default:
        return null
    }
  }

  return <div>{statusString()}</div>
}

export const Head = () => {
  const hc = useHolochain()

  useEffect(() => {
    initHc(hc)
  }, [hc])

  return (
    <Menu fixed='top' inverted>
      <Container>
        <Menu.Item as={Link} to='/' header>
          __holo.txt
        </Menu.Item>
        <Menu.Item position='right'>
          <div><ConnectionStatus /></div>
        </Menu.Item>
      </Container>
    </Menu>
  )
}

const styles = {
  message: {
    display: 'inline-block',
    marginRight: 10
  }
}
