import xhr from 'xhr'
import aws4 from 'aws4'
import { rfc3986EncodeURIComponent } from './utils'

const APP_KEY = '76a6cc20-6073-4290-8a2c-951b4580ae4a'
const API_HOST = 'api.imdbws.com'

const requestCredentials = () => new Promise((resolve, reject) => {
  console.info('IMDb request credentials')
  xhr({
    method: 'post',
    uri: `https://${API_HOST}/authentication/credentials/temporary/ios82`,
    body: JSON.stringify({ appKey: APP_KEY })
  }, (err, resp, body) => {
    if (resp.statusCode === 200) {
      const json = JSON.parse(body)
      resolve(json.resource)
    } else {
      // TODO: check if err is null, read body to get error message
      // (not only here)
      console.error('IMDb credentials request error', err, resp)
      reject(err)
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
  xhr({
    method: 'get',
    uri: 'https://' + host + path
  }, (err, resp, body) => {
    if (resp.statusCode === 200) {
      const json = JSON.parse(body).resource
      resolve(json)
    } else {
      console.error(`IMDb ratings request error for "${imdbId}"`, err)
      reject(err)
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
  const uri = `https://v2.sg.media-imdb.com/suggests/${q[0]}/${q}.json`
  console.info(`IMDb search request for "${query}"`)
  xhr({
    method: 'get',
    uri
  }, (err, resp, body) => {
    if (resp.statusCode === 200) {
      const json = JSON.parse(body.match(/imdb\$.+?\((.+)\)/)[1])
      let results = []
      if (json.d) {
        results = json.d.filter(r => r.id.startsWith('tt'))
      }
      if (results.length === 0) {
        console.warn(`IMDb empty search result for "${q}"`)
      }
      resolve(results)
    } else {
      console.error(`IMDb search error for "${q}"`, err, resp)
      reject(err)
    }
  })
})

export {
  requestCredentials,
  search,
  getRatings
}
