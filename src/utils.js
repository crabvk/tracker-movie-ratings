const stringPresence = str => typeof str === 'string' ? (str.trim() === '' ? null : str) : null

const decodeHtml =
  html => new DOMParser().parseFromString(html, 'text/html').documentElement.textContent

const parseRutrackerTitle = title => {
  const rus = title.match(/^.+?(?=\s?(\(|\/|\[))/) || []
  const eng = title.match(/\/\s+?([^а-яёА-ЯЁ].+?(?=\s?(\(|\/|\[)))/) || []
  const year = title.match(/(?!\[)\d+(?=,)/) || []
  return {
    title: eng[1],
    titleRu: rus[0],
    year: year[0]
  }
}

const formatTitle = ({ title, titleRu, year }) => {
  const t = [stringPresence(title), stringPresence(titleRu)].filter(n => n).join(' / ')
  return t + (year ? ` [${year}]` : '')
}

// https://stackoverflow.com/a/26375459/1878180
const hex = str => {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16)
  }
  return result
}

// https://stackoverflow.com/a/18251730
const rfc3986EncodeURIComponent = str => encodeURIComponent(str).replace(/[!'()*]/g, escape)

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export {
  decodeHtml,
  parseRutrackerTitle,
  formatTitle,
  hex,
  rfc3986EncodeURIComponent,
  escapeRegExp
}
