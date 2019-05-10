chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showPageAction') {
    chrome.pageAction.show(sender.tab.id)
  }

  if (request.action === 'hidePageAction') {
    chrome.pageAction.hide(sender.tab.id)
  }

  if (request.action === 'fetchRequest') {
    window.fetch(request.url, request.fetchOptions)
      .then(response => response.json())
      .then(json => sendResponse(json))
      .catch(request.onError)
    return true
  }

  if (request.action === 'fetchRequestText') {
    window.fetch(request.url, request.fetchOptions)
      .then(response => response.text())
      .then(text => sendResponse(text))
      .catch(request.onError)
    return true
  }
})
