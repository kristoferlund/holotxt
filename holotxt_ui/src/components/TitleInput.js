import React, { useState } from 'react'

import { Input } from 'semantic-ui-react'

export const TitleInput = (props) => {
  const { onChange, title } = props
  const [inputStyle, setInputStyle] = useState(styles.titleBlur)
  return (
    <Input
      fluid
      onChange={onChange}
      onFocus={() => {
        setInputStyle(styles.titleFocus)
      }}
      onBlur={() => {
        setInputStyle(styles.titleBlur)
      }}
    >
      <input
        value={title}
        style={inputStyle}
      />
    </Input>
  )
}

const styles = {
  titleFocus: {
    fontSize: 'xx-large',
    fontWeight: 900,
    border: 'none',
    borderBottom: '2px solid #CCC',
    borderRadius: 0,
    background: 'none',
    margin: 0,
    marginTop: 40,
    marginBottom: 5,
    padding: 0,
    paddingBottom: 5

  },
  titleBlur: {
    fontSize: 'xx-large',
    fontWeight: 900,
    border: 'none',
    borderBottom: '2px solid #FFF',
    borderRadius: 0,
    background: 'none',
    margin: 0,
    marginTop: 40,
    marginBottom: 5,
    padding: 0,
    paddingBottom: 5
  }
}
