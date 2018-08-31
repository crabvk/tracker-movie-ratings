import { search as searchKinopoisk } from './kinopoisk'
import {
  requestCredentials,
  search as searchImdb,
  getRatings
} from './imdb'
import { escapeRegExp } from './utils'

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

// TODO: cache results
const findKinopoisk = params => searchKinopoisk(params.title)
  .then(results => {
    const filtered = applyFilters(results, [
      r => r.nameEN.match(titleRegExp(params.title)),
      r => r.year && r.year.toString().match(yearRegExp(params.year))
    ])
    if (filtered.length === 0) {
      throw errors.nothingFound
    }
    return mapKinopoiskResult(filtered[0])
  })
  .catch(error => {
    throw (error ? (error.message || error.toString()) : errors.unknown)
  })

const mapImdbResult = r => ({
  title: r.l,
  year: r.y.toString(),
  rating: r.rating.toFixed(1),
  link: `https://www.imdb.com/title/${r.id}/`
})

// TODO: write to localStorage
let credentials

const getCredentials = () => {
  if (credentials) {
    return Promise.resolve(credentials)
  }
  return requestCredentials().then(creds => {
    credentials = creds
    return creds
  })
}

const findImdb = params => searchImdb(params.title)
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
      .then(ratings => mapImdbResult({ ...result, rating: ratings.rating }))
  })
  .catch(error => {
    throw (error ? (error.message || error.toString()) : errors.unknown)
  })

export {
  errors,
  findKinopoisk,
  findImdb
}
