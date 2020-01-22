import { Icon, List } from 'semantic-ui-react'

import { Link } from 'react-router-dom'
import React from 'react'

import formatDistance from 'date-fns/formatDistance'

export const ListItem = (props) => {
  const fromNow = props.timestamp
    ? formatDistance(parseInt(props.timestamp), Date.now())
    : ''
  return (
    <List.Item>
      <List.Content floated='right'>
        <List.Description style={styles.listDescription}>{fromNow} ago</List.Description>
      </List.Content>
      <Icon name='file text' color='black' />
      <List.Content>
        <div className='mb2'><Link to={`/${props.address}`} className='f5 f4-ns fw6 link dim black'>{props.name}</Link></div>
      </List.Content>
    </List.Item>
  )
}

const styles = {
  listDescription: {
    color: '#666'
  }
}
