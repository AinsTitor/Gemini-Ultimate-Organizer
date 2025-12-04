// content_loader.js
(async () => {
  const src = chrome.runtime.getURL('main.js');
  await import(src);
})();