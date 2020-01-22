import { useRedux } from 'hooks-for-redux'

const textIndex = (state, address) => state.findIndex(
  txt => txt.address === address
)

export const [useTextList, { resetList, setList, addToList, updateListItem }] = useRedux('textList', [], {
  resetList: () => [],

  setList: (state, list) => [...list],

  addToList: (state, text) => [
    ...state,
    {
      ...text
    }
  ],

  updateListItem: (state, text) => {
    const idx = textIndex(state, text.address)
    return [
      ...state.slice(0, idx),
      {
        ...state[idx],
        ...text
      },
      ...state.slice(idx + 1)
    ]
  }
})
