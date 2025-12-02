document.getElementById('open-gemini').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://gemini.google.com/' });
});