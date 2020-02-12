// Downloads a file from a URL using the GET method.
//
// @note This must be in the background script.
//       Otherwise, the extension will get a Content Security Policy error.
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == 'xhttp') {
        const xhttp = new XMLHttpRequest();

        xhttp.open('GET', request.url);

        xhttp.addEventListener('progress', evt => {
            if (evt.lengthComputable) {
                // TODO: send message to content script
                console.log('Downloaded: ' + evt.loaded + '/' + evt.total);
            } else {
                // total size is unknown
            }
        });
        xhttp.addEventListener('load', () => {
            if (200 <= xhttp.status && xhttp.status < 300) {
                callback({ success: true, text: xhttp.responseText });
            } else {
                callback({
                    success: false,
                    text: `File download error: url=${request.url}, status="${xhttp.status} ${xhttp.statusText}"`,
                });
            }
        });
        xhttp.addEventListener('error', () => {
            callback({
                success: false,
                text: `File download error: url=${request.url}`,
            });
        });
        xhttp.addEventListener('abort', () => {
            callback({
                success: false,
                text: `File download canceled: url=${request.url}`,
            });
        });

        xhttp.send();
        return true; // neccesary to avoid the error "The message port closed before a response was received."
    }
});
