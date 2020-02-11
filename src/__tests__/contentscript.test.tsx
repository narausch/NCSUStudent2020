import {
    isTargetPage,
    extractRepoFromUrl,
    extractSHAFromUrl,
} from '../contentscript/contentscript';

describe('isTargetPage', () => {
    test('true cases', async () => {
        const url0 =
            'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/master...development?expand=1';
        const url1 =
            'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/master...development';

        expect(isTargetPage(url0)).toBeTruthy();
        expect(isTargetPage(url1)).toBeTruthy();
    });

    test('false cases', async () => {
        const url0 =
            'http://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/master...development?expand=1'; // http
        const url1 = 'http://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/';

        expect(isTargetPage(url0)).toBeFalsy();
        expect(isTargetPage(url1)).toBeFalsy();
    });
});

describe('extractRepoFromUrl', () => {
    test('normal cases', async () => {
        const url0 = 'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19';
        const url1 = 'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/';
        const url2 =
            'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/master...development?expand=1';
        const expected = ['github.ncsu.edu', 'engr-csc-sdc', '2020SpringTeam19'];

        expect(extractRepoFromUrl(url0)).toStrictEqual(expected);
        expect(extractRepoFromUrl(url1)).toStrictEqual(expected);
        expect(extractRepoFromUrl(url2)).toStrictEqual(expected);

        expect(extractRepoFromUrl('https://github.com/facebook/jest')).toStrictEqual([
            'github.com',
            'facebook',
            'jest',
        ]);
    });

    test('error cases', async () => {
        const url0 = 'http://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19'; // http instead of https
        const url1 = 'https://github.ncsu.edu/engr-csc-sdc/'; // missing repo

        expect(extractRepoFromUrl(null)).toBeNull();
        expect(extractRepoFromUrl('')).toBeNull();
        expect(extractRepoFromUrl(url0)).toBeNull();
        expect(extractRepoFromUrl(url1)).toBeNull();
    });
});

describe('extractSHAFromUrl', () => {
    test('normal cases', async () => {
        const url0 =
            'https://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/engr-csc-sdc:03f3788...engr-csc-sdc:4d056ca';

        expect(extractSHAFromUrl(url0)).toStrictEqual(['03f3788', '4d056ca']);
    });

    test('error cases', async () => {
        const url0 =
            'http://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/compare/engr-csc-sdc:03f3788...engr-csc-sdc:4d056ca'; // http instead of https
        const url1 = 'http://github.ncsu.edu/engr-csc-sdc/2020SpringTeam19/';

        expect(extractSHAFromUrl(null)).toBeNull();
        expect(extractSHAFromUrl('')).toBeNull();
        expect(extractSHAFromUrl(url0)).toBeNull();
        expect(extractSHAFromUrl(url1)).toBeNull();
    });
});
