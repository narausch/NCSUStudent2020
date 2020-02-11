import FileInfo from '../../contentscript/io/FileInfo';

describe('FileInfo#getUrl', () => {
    test('normal cases', async () => {
        const f0 = new FileInfo(
            'github.ncsu.edu',
            'engr-csc-sdc',
            '2020SpringTeam19',
            'master',
            'abc/def/ghi.json',
        );
        const f1 = new FileInfo('github.com', 'facebook', 'jest', 'h12345', 'x.json');

        expect(f0.getUrl()).toBe(
            'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/raw/master/abc/def/ghi.json',
        );
        expect(f1.getUrl()).toBe('https://github.com/facebook/jest/raw/h12345/x.json');
    });
});
