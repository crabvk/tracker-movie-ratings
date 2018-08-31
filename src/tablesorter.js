/* global $ */
window.addEventListener('message', e => {
  if (e.data.type === 'tmrsearchbegin') {
    const t = document.querySelector('#tor-tbl')
    const t2 = t.cloneNode(true)
    t2.querySelectorAll('thead span.tbs-icon').forEach(e => e.remove())
    $(t2).tablesorter()
    t.parentNode.replaceChild(t2, t)
  } else if (e.data.type === 'tmrsearchend') {
    const t = document.querySelector('#tor-tbl')
    $(t).trigger('update')
    t.querySelector('thead th.tmr-loading.tmr-' + e.data.provider).classList.toggle('tmr-loading')
  }
}, false)
