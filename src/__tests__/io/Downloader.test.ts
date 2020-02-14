import FileInfo from '../../contentscript/io/FileInfo';
import Downloader from '../../contentscript/io/Downloader';
require('./DownloaderMock'); // rewrite global functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function setSendMessageResult(success: boolean, text: string): any;

// test data
const f0 = new FileInfo(
    'github.ncsu.edu',
    'engr-csc-sdc',
    '2020SpringTeam19',
    'master',
    'abc/def/ghi.json',
);

describe('Downloader#download', () => {
    test('null input', async () => {
        expect(new Downloader(null).download(jest.fn())).resolves.toBeNull();
    });

    test('normal case', async () => {
        setSendMessageResult(true, 'abcdefghi');
        expect(new Downloader(f0).download(jest.fn())).resolves.toBe('abcdefghi');
    });

    test('file not found', async () => {
        setSendMessageResult(true, null);
        expect(new Downloader(f0).download(jest.fn())).resolves.toBeNull();
    });

    test('error case', async () => {
        setSendMessageResult(false, `File download error: url=${f0.getUrl()}`);
        expect(new Downloader(f0).download(jest.fn())).rejects.toStrictEqual(
            new Error(`File download error: url=${f0.getUrl()}`),
        );
    });
});
