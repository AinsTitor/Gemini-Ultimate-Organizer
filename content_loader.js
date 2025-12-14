// content_loader.js
(async () => {
  // On passe directement la fonction dans l'import pour rassurer le validateur
  await import(chrome.runtime.getURL('main.js'));
})();