import * as globalState from '../redux'

import isObject from 'lodash/isObject'

const HC_INSTANCE = 'holotxt'
const HC_ZOME = 'txt'

export const call = (hc, fn, payload) => {
  return new Promise((resolve, reject) => {
    try {
      hc.connection.callZome(
        HC_INSTANCE,
        HC_ZOME,
        fn)(payload)
        .then((result) => {
          const obj = JSON.parse(result)
          if (isObject(obj) && obj.Ok) {
            resolve(obj.Ok)
          }
          if (isObject(obj) && obj.Err) {
            const err = new Error('Server error')
            err.data = obj.Err
            reject(err)
          }
          reject(new Error('Unspecified error'))
        }, err => {
          console.error(err)
          reject(err)
        })
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}

export const fetchTextList = async (hc) => {
  try {
    const list = await call(hc, 'list_texts',
      { 'agent_address': hc.meta.agent_address })
    const textList = []
    console.log(list)
    for (let item of list.links) {
      const txt = await call(hc, 'get_text_short',
        { 'text_address': item.address })
      textList.push({
        address: item.address,
        name: txt.name,
        timestamp: txt.timestamp
      })
    }
    globalState.setList(textList)
  } catch (err) {
    console.error(err)
    throw (err)
  }
}

export const saveText = async (hc, fn, txt) => {
  try {
    await call(hc, fn, txt)
    const newTextListItem = {
      'address': txt.text_address,
      'name': txt.name,
      'timestamp': new Date().getTime()
    }
    globalState.updateListItem(newTextListItem)
    globalState.addToHistory(newTextListItem)
  } catch (err) {
    console.error(err)
    throw (err)
  }
}
