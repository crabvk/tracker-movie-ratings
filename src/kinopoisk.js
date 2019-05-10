import md5 from 'md5'
import { rfc3986EncodeURIComponent } from './utils'

const API_URI = 'https://ext.kinopoisk.ru/ios/5.0.0/'
const SALT = 'IDATevHDS7'

const getHeaders = path => {
  const ts = Math.round(Date.now() / 1000).toString()
  const key = md5(path + ts + SALT)
  return {
    'Android-Api-Version': '19',
    'device': 'android',
    'X-TIMESTAMP': ts,
    'X-SIGNATURE': key
  }
}

const search = query => {
  console.info(`Kinopoisk search request for "${query}"`)
  const q = rfc3986EncodeURIComponent(query)
  const path = `getKPSearchInFilms?keyword=${q}&page=1`

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'fetchRequest',
      url: API_URI + path,
      fetchOptions: {
        headers: getHeaders(path)
      },
      onError: error => {
        console.error(`Kinopoisk search error for "${query}"`, error)
        reject(error)
      }
    }, json => {
      if (json && json.data && json.data.pagesCount > 0) {
        resolve(json.data.searchFilms)
      } else {
        console.warn(`Kinopoisk empty search result for "${query}"`)
        resolve([])
      }
    })
  })
}

export { search }
