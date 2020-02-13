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
     * @return Promise of the text content of the file.
     */
    download(): Promise<string> {
        if (!this.fileInfo) {
            return Promise.resolve(null); // null input
        }

        return new Promise<string>((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    action: 'xhttp',
                    url: this.fileInfo.getUrl(),
                },
                response => {
                    if (response.success) {
                        resolve(response.text);
                    } else {
                        reject(new Error(response.text));
                    }
                },
            );
        });
    }

    private fileInfo: FileInfo;
}
