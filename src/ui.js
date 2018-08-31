import { decodeHtml, formatTitle } from './utils'
import tablesorter from './tablesorter'

const script = document.createElement('script')
script.type = 'text/javascript'
script.charset = 'utf-8'
script.textContent = tablesorter
document.head.appendChild(script)

const tablesorterRecreateTable = () =>
  window.postMessage({ type: 'tmrsearchbegin' }, `${window.location.protocol}//rutracker.org`)

const tablesorterTriggerUpdate = provider =>
  window.postMessage({ provider, type: 'tmrsearchend' }, `${window.location.protocol}//rutracker.org`)

const providers = Object.freeze({
  kinopoisk: 'КиноПоиск',
  imdb: 'IMDb'
})

const addColumn = (provider, trsKeys) => {
  const thNext = document.querySelector('#tor-tbl thead tr th:nth-child(5)')
  const th = document.createElement('th')
  th.className = `tmr-loading tmr-${provider}`
  const b = document.createElement('b')
  b.className = `tbs-text`
  b.title = providers[provider]
  th.appendChild(b)
  document.querySelector('#tor-tbl thead tr').insertBefore(th, thNext)

  document.querySelectorAll('#tor-tbl tbody tr').forEach(tr => {
    const tdNext = tr.querySelector('td:nth-child(5)')
    const td = document.createElement('td')
    const key = trsKeys.get(tr)
    td.className = key ? `row4 tmr-cell tmr-loading tmr-${provider}-${key}` : 'row4'
    tr.insertBefore(td, tdNext)
  })

  document.querySelector('#tor-tbl tfoot td').colSpan += 1
}

const setCellResult = (td, movie) => {
  const a = document.createElement('a')
  a.target = '_blank'
  a.href = movie.link
  a.textContent = movie.rating > 0 ? movie.rating : '—'
  a.title = decodeHtml(formatTitle(movie))
  a.className = 'med'
  td.classList.remove('tmr-loading')
  td.appendChild(a)
}

const setCellError = (td, error) => {
  const span = document.createElement('span')
  span.textContent = ':/'
  span.title = error
  td.classList.remove('tmr-loading')
  td.appendChild(span)
}

export {
  addColumn,
  tablesorterRecreateTable,
  tablesorterTriggerUpdate,
  setCellResult,
  setCellError
}
