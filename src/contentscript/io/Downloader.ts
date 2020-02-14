import FileInfo from './FileInfo';

/**
 * File downloader.
 */
export default class Downloader {
    /**
     * Constructs a Downloader.
     *
     * @param fileInfo file information
     */
    constructor(fileInfo: FileInfo) {
        this.fileInfo = fileInfo;
    }

    /**
     * Downloads a file.
     *
     * @param handleUpdateProgress function for updating progress
     * @return Promise of the text content of the file.
     */
    download(handleUpdateProgress: (loaded: number, total: number) => void): Promise<string> {
        const fileInfo = this.fileInfo;
        if (!fileInfo) {
            return Promise.resolve(null); // null input
        }

        return new Promise<string>((resolve, reject) => {
            // receive messages from the background script
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (request.action == 'progress' && request.url == fileInfo.getUrl()) {
                    handleUpdateProgress(request.loaded, request.total);
                }
            });

            chrome.runtime.sendMessage({ action: 'xhttp', url: fileInfo.getUrl() }, response => {
                if (response.success) {
                    resolve(response.text);
                } else {
                    reject(new Error(response.text));
                }
            });
        });
    }

    private fileInfo: FileInfo;
}
