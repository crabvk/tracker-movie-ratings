import getForumType from './forums/index'
import { parseRutrackerTitle, hex } from './utils'
import {
  addColumn,
  tablesorterRecreateTable,
  tablesorterTriggerUpdate,
  setCellResult,
  setCellError
} from './ui'
import { errors, findKinopoisk, findImdb } from './search'

const keysParams = new Map()
const trsKeys = new Map()

document.querySelectorAll('#tor-tbl tbody tr').forEach(tr => {
  const type = getForumType(tr.querySelector('td.f-name a').textContent)
  if (!type) { return }

  const a = tr.querySelector('td.t-title a')
  const { title, titleRu, year } = parseRutrackerTitle(a.textContent)
  if (!title) {
    setCellError(a.parentNode, errors.parsing)
    return
  }

  const key = hex(title + type + (type === 'serial' ? '' : year))
  trsKeys.set(tr, key)
  if (keysParams.get(key) == null) {
    keysParams.set(key, { title, titleRu, type, year })
  }
})

if (keysParams.size > 0) {
  chrome.runtime.sendMessage({ action: 'showPageAction' })

  const find = {
    kinopoisk: findKinopoisk,
    imdb: findImdb
  }

  const queries = {
    kinopoisk: keysParams.entries(),
    imdb: keysParams.entries()
  }

  const sequence = (provider, key, params) => {
    const updateCells = (fn, arg) =>
      document.querySelectorAll(`#tor-tbl tbody td.tmr-${provider}-${key}`)
        .forEach(td => fn(td, arg))
    find[provider](key, params)
      .then(movie => updateCells(setCellResult, movie))
      .catch(error => updateCells(setCellError, error))
      .then(() => {
        const { value, done } = queries[provider].next()
        if (done) {
          tablesorterTriggerUpdate(provider)
        } else {
          sequence(provider, value[0], value[1])
        }
      })
  }

  addColumn('imdb', trsKeys)
  addColumn('kinopoisk', trsKeys)
  tablesorterRecreateTable()
  sequence('kinopoisk', ...queries['kinopoisk'].next().value)
  sequence('imdb', ...queries['imdb'].next().value)
} else {
  chrome.runtime.sendMessage({ action: 'hidePageAction' })
}
