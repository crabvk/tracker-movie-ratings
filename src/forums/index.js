import movieForumsText from './movie.txt'
import docForumsText from './documentary.txt'

const splitForums = fs => new Set(fs.split('\n').filter(f => f))
const movieForums = splitForums(movieForumsText)
const docForums = splitForums(docForumsText)

const getForumType = forum => {
  if (/^(Фильмы|Зарубежное кино|Аниме)/.test(forum) || movieForums.has(forum)) {
    return 'movie'
  } else if (/^Мультсериалы|^Сериалы\s|\sсериалы/.test(forum)) {
    return 'serial'
  } else if (/\[Док\]\s/.test(forum) || docForums.has(forum)) {
    return 'documentary'
  }
}

export default getForumType
