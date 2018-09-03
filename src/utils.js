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

// https://stackoverflow.com/a/2117523/1878180
const uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11)
  .replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
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
  uuidv4,
  rfc3986EncodeURIComponent,
  escapeRegExp
}
