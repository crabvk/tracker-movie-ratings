import aws4 from 'aws4'
import { rfc3986EncodeURIComponent } from './utils'

const APP_KEY = '76a6cc20-6073-4290-8a2c-951b4580ae4a'
const API_HOST = 'api.imdbws.com'

const requestCredentials = () => new Promise((resolve, reject) => {
  console.info('IMDb request credentials')
  chrome.runtime.sendMessage({
    action: 'fetchRequest',
    url: `https://${API_HOST}/authentication/credentials/temporary/ios82`,
    fetchOptions: {
      method: 'POST',
      body: JSON.stringify({ appKey: APP_KEY })
    },
    onError: error => {
      console.warn('IMDb credentials request error', error)
      reject(error)
    }
  }, json => {
    if (json && json.resource) {
      resolve(json.resource)
    } else {
      console.warn('IMDb credentials request error', json)
      reject(json)
    }
  })
})

const signQuery = (path, { accessKeyId, secretAccessKey, sessionToken }) => aws4.sign({
  signQuery: true,
  service: 'imdbapi',
  region: 'us-east-1',
  method: 'GET',
  host: API_HOST,
  path: path + '?X-Amz-Security-Token=' + rfc3986EncodeURIComponent(sessionToken)
}, {
  accessKeyId,
  secretAccessKey
})

const getRatings = (imdbId, creds) => new Promise((resolve, reject) => {
  const { host, path } = signQuery(`/title/${imdbId}/ratings`, creds)
  const onError = error => {
    console.error(`IMDb ratings request error for "${imdbId}"`, error)
    reject(error)
  }

  chrome.runtime.sendMessage({
    action: 'fetchRequest',
    url: 'https://' + host + path,
    onError
  }, json => {
    if (json && json.resource) {
      resolve(json.resource)
    } else {
      const error = 'No "resource" key in json response'
      onError(error)
      reject(error)
    }
  })
})

const encodeQuery = query => {
  const encoded = query.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return rfc3986EncodeURIComponent(encoded)
}

const search = query => new Promise((resolve, reject) => {
  const q = encodeQuery(query)
  const url = `https://v2.sg.media-imdb.com/suggests/${q[0]}/${q}.json`
  console.info(`IMDb search request for "${query}"`)
  const onError = error => {
    console.error(`IMDb search error for "${q}"`, error)
    reject(error)
  }

  chrome.runtime.sendMessage({
    action: 'fetchRequestText',
    url,
    onError
  }, text => {
    if (text) {
      const json = JSON.parse(text.match(/imdb\$.+?\((.+)\)/)[1])
      let results = []
      if (json.d) {
        results = json.d.filter(r => r.id.startsWith('tt'))
      }
      if (results.length === 0) {
        console.warn(`IMDb empty search result for "${q}"`)
      }
      resolve(results)
    } else {
      const error = 'Empty response'
      onError(error)
      reject(error)
    }
  })
})

export {
  requestCredentials,
  search,
  getRatings
}
