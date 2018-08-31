chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.from === 'content' && msg.subject === 'showPageAction') {
    chrome.pageAction.show(sender.tab.id)
  }
  if (msg.from === 'content' && msg.subject === 'hidePageAction') {
    chrome.pageAction.hide(sender.tab.id)
  }
})
