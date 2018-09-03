import crypto from 'crypto'
import lscache from 'lscache'
import { search as searchKinopoisk } from './kinopoisk'
import {
  requestCredentials,
  search as searchImdb,
  getRatings
} from './imdb'
import { escapeRegExp, uuidv4 } from './utils'

const EXPIRATION_TIME = 60 // 1 hour
const CIPHER_PASSWORD = lscache.get('pass') || (() => {
  let pass = uuidv4()
  lscache.set('pass', pass)
  return pass
})()

const errors = Object.freeze({
  parsing: 'unable to parse title',
  nothingFound: 'nothing found',
  unknown: 'unknown error'
})

const mapKinopoiskResult = r => ({
  title: r.nameEN,
  titleRu: r.nameRU,
  year: r.year,
  rating: r.rating,
  link: `https://www.kinopoisk.ru/film/${r.id}/`
})

const applyFilters = (results, filters, n = 0) => {
  if (results.length < 2 || n >= filters.length) {
    return results
  }
  const filtered = results.filter(filters[n])
  results = filtered.length > 0 ? filtered : results
  return applyFilters(results, filters, ++n)
}

const titleRegExp = title => new RegExp(`^${escapeRegExp(title)}$`, 'i')
const yearRegExp = year => new RegExp(`^${escapeRegExp(year)}`)

const findKinopoisk = (key, params) => {
  key = 'kp-' + key
  let movie = lscache.get(key)
  if (movie) {
    return Promise.resolve(movie)
  }
  return searchKinopoisk(params.title)
    .then(results => {
      const filtered = applyFilters(results, [
        r => r.nameEN.match(titleRegExp(params.title)),
        r => r.year && r.year.toString().match(yearRegExp(params.year))
      ])
      if (filtered.length === 0) {
        throw errors.nothingFound
      }
      movie = mapKinopoiskResult(filtered[0])
      lscache.set(key, movie, EXPIRATION_TIME)
      return movie
    })
    .catch(error => {
      throw (error ? (error.message || error.toString()) : errors.unknown)
    })
}

const mapImdbResult = r => ({
  title: r.l,
  year: r.y.toString(),
  rating: r.rating.toFixed(1),
  link: `https://www.imdb.com/title/${r.id}/`
})

let credentials

const getCredentials = () => {
  if (credentials && Date.parse(credentials.expirationTimeStamp) > Date.now()) {
    return Promise.resolve(credentials)
  }
  const encrypted = lscache.get('imdb-creds')
  if (encrypted) {
    const decipher = crypto.createDecipher('aes192', CIPHER_PASSWORD)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    credentials = JSON.parse(decrypted)
    return Promise.resolve(credentials)
  }
  return requestCredentials()
    .then(({ accessKeyId, expirationTimeStamp, secretAccessKey, sessionToken }) => {
      credentials = { accessKeyId, expirationTimeStamp, secretAccessKey, sessionToken }

      // Calc credentials expiration time in minutes
      const time = Math.floor((Date.parse(expirationTimeStamp) - Date.now()) / 60000)

      // Encrypt credentials
      const cipher = crypto.createCipher('aes192', CIPHER_PASSWORD)
      let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex')
      encrypted += cipher.final('hex')

      lscache.set('imdb-creds', encrypted, time - 5)
      return credentials
    })
}

const findImdb = (key, params) => {
  key = 'imdb-' + key
  let movie = lscache.get(key)
  if (movie) {
    return Promise.resolve(movie)
  }
  return searchImdb(params.title)
    .then(results => {
      const filters = []
      if (params.type === 'serial') {
        filters.push(r => r.q === 'TV series')
      }
      const filtered = applyFilters(results, filters.concat([
        r => r.l.match(titleRegExp(params.title)),
        r => r.y && r.y.toString().match(yearRegExp(params.year))
      ]))
      if (filtered.length === 0) {
        throw errors.nothingFound
      }
      const result = filtered[0]
      return getCredentials()
        .then(creds => getRatings(result.id, creds))
        .then(ratings => {
          movie = mapImdbResult({ ...result, rating: ratings.rating })
          lscache.set(key, movie, EXPIRATION_TIME)
          return movie
        })
    })
    .catch(error => {
      throw (error ? (error.message || error.toString()) : errors.unknown)
    })
}

export {
  errors,
  findKinopoisk,
  findImdb
}
