import { Editable, Slate, withReact } from 'slate-react'
import React, { useCallback, useMemo } from 'react'

import { createEditor } from 'slate'
import { withHistory } from 'slate-history'

const DefaultElement = props => {
  return <div className='f4' {...props.attributes}>{props.children}</div>
}

export const Editor = (props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const { textObj, onChange } = props

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  if (textObj) {
    return (
      <Slate
        editor={editor}
        value={textObj.contents}
        onChange={onChange}
      >
        <Editable
          renderElement={renderElement}
        />
      </Slate>
    )
  }
  return 'Loading…'
}
