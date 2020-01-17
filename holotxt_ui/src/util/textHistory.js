import remove from 'lodash/remove'

export const addToHistory = (hc, textAddress) => {
  let items = []
  const history = getHistory(hc)
  if (history && history.items) {
    remove(history.items, (item) => item === textAddress)
    items = history.items
  }
  const newHistory = {
    agent_address: hc.meta.agent_address,
    items: [textAddress, ...items]
  }
  localStorage.setItem('history', JSON.stringify(newHistory))
}

export const getHistory = (hc) => {
  try {
    let history = JSON.parse(localStorage.getItem('history'))
    if (history.agent_address !== hc.meta.agent_address) {
      localStorage.removeItem('history')
      return null
    }
    return history
  } catch (err) {
    return null
  }
}
