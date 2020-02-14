// Downloads a file from a URL using the GET method.
//
// @note This must be in the background script.
//       Otherwise, the extension will get a Content Security Policy error.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'xhttp') {
        const xhttp = new XMLHttpRequest();

        // TODO: validate the url
        // "Content scripts are less trustworthy than the extension background page"
        // @see https://developer.chrome.com/extensions/messaging#security-considerations
        xhttp.open('GET', request.url);

        xhttp.addEventListener('progress', evt => {
            if (evt.lengthComputable) {
                // send progress to content script
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'progress',
                    url: request.url,
                    loaded: evt.loaded,
                    total: evt.total,
                });
            }
        });
        xhttp.addEventListener('load', () => {
            if (200 <= xhttp.status && xhttp.status < 300) {
                sendResponse({ success: true, text: xhttp.responseText });
            } else if (xhttp.status == 404) {
                // file not found
                sendResponse({ success: true, text: null });
            } else {
                sendResponse({
                    success: false,
                    text: `File download error: url=${request.url}, status="${xhttp.status} ${xhttp.statusText}"`,
                });
            }
        });
        xhttp.addEventListener('error', () => {
            sendResponse({
                success: false,
                text: `File download error: url=${request.url}`,
            });
        });
        xhttp.addEventListener('abort', () => {
            sendResponse({
                success: false,
                text: `File download canceled: url=${request.url}`,
            });
        });

        xhttp.send();
        return true; // process asynchroniously
    }
});
