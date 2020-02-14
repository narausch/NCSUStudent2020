// Used for Downloader.test.ts
global.chrome = {
    runtime: {
        onMessage: {},
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        sendMessage: (request, response) => {
            response(global.chrome.runtime.sendMessageResult);
        },
    },
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
global.chrome.runtime.onMessage.addListener = function(f) {
    // send several messages
    f({ action: 'invalid_action' }, {}, jest.fn());
    f({ action: 'progress', url: 'invalid_url' }, {}, jest.fn());
    f(
        {
            action: 'progress',
            url:
                'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/raw/master/abc/def/ghi.json',
        },
        {},
        jest.fn(),
    );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
global.setSendMessageResult = function(success, text) {
    global.chrome.runtime.sendMessageResult = { success: success, text: text };
};
