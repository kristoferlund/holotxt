import { useRedux } from 'hooks-for-redux'

const textIndex = (state, address) => state.findIndex(
  txt => txt.address === address
)

export const [useTextHistoryList, { resetHistory, addToHistory }] = useRedux('textHistoryList', [], {
  resetHistory: () => [],

  addToHistory: (state, text) => {
    const idx = textIndex(state, text.address)
    if (idx === -1 || idx >= 4) {
      return [
        {
          ...text
        },
        ...state.slice(0, 4)
      ]
    }
    return [
      {
        ...text
      },
      ...state.slice(0, idx),
      ...state.slice(idx + 1, 5)
    ]
  }
})
