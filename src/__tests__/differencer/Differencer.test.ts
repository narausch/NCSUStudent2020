import Differencer from '../../contentscript/differencer/Differencer';

describe('Differencer#smallInputChanges', () => {
    test('normal cases', async () => {
        const a1 = [
            { id: 'a', info: 'FARM' },
            { id: 'b', info: 'BOY' },
            { id: 'c', info: 'CAT' },
        ];
        const a2 = [
            { id: 'a', info: 'FOREST' },
            { id: 'c', info: 'CAT' },
            { id: 'd', info: 'DOG' },
        ];

        const diff: Differencer = new Differencer(a1, a2);

        expect(diff.getAddedNodes()).toStrictEqual([{ id: 'd', info: 'DOG' }]);
        expect(diff.getRemovedNodes()).toStrictEqual([{ id: 'b', info: 'BOY' }]);
        expect(diff.getChangedNodes()).toStrictEqual([{ id: 'a', info: 'FOREST' }]);
    });
});

describe('Differencer#mediumInputChanges', () => {
    test('normal cases', async () => {

        // A base list of names 
        const a1 = [
            { id: '1', info: 'JAMES' },
            { id: '2', info: 'VAL' },
            { id: '3', info: 'JOSEPH' },
            { id: '4', info: 'SALLY' },
            { id: '5', info: 'GERRIT' },
            { id: '6', info: 'MARGE' },
            { id: '7', info: 'TIM' },
            { id: '8', info: 'KAT' },
            { id: '9', info: 'STEVE' },
            { id: '0', info: 'EMILY' }
        ];

        // The base list of names with added names
        const a2 = [
            { id: '-1', info: 'LEO' },
            { id: '1', info: 'JAMES' },
            { id: '2', info: 'VAL' },
            { id: '2.5', info: 'RILEY' },
            { id: '3', info: 'JOSEPH' },
            { id: '4', info: 'SALLY' },
            { id: '4.5', info: 'TEX' },
            { id: '4.6', info: 'CASSIE' },
            { id: '5', info: 'GERRIT' },
            { id: '6', info: 'MARGE' },
            { id: '7', info: 'TIM' },
            { id: '8', info: 'KAT' },
            { id: '9', info: 'STEVE' },
            { id: '0', info: 'EMILY' },
            { id: '11', info: 'BILL' },
            { id: '12', info: 'ARIEL' }
        ];

        // The base list of names with 4 names removed
        const a3 = [
            { id: '2', info: 'VAL' },
            { id: '3', info: 'JOSEPH' },
            { id: '6', info: 'MARGE' },
            { id: '7', info: 'TIM' },
            { id: '8', info: 'KAT' },
            { id: '9', info: 'STEVE' },
        ];

        // The base list of  names with 6 of the names changed by
        // adding 'THONY' to the end of them
        const a4 = [
            { id: '1', info: 'JAMESTHONY' },
            { id: '2', info: 'VAL' },
            { id: '3', info: 'JOSEPH' },
            { id: '4', info: 'SALLYTHONY' },
            { id: '5', info: 'GERRITTHONY' },
            { id: '6', info: 'MARGE' },
            { id: '7', info: 'TIMTHONY' },
            { id: '8', info: 'KAT' },
            { id: '9', info: 'STEVETHONY' },
            { id: '0', info: 'EMILYTHONY' }
        ];

        // The base list of names but with some added names, some 
        // deleted names, and some modified names
        const a5 = [
            { id: '1', info: 'JAMES' },
            { id: '1.5', info: 'RYANTHONY' },
            { id: '2', info: '' },
            { id: '3', info: 'JOSEPH' },
            { id: '5', info: 'GERRITHONY' },
            { id: '6', info: 'MARGE' },
            { id: '7', info: 'TIMTHONY' },
            { id: '9', info: 'STEVE' },
            { id: '0', info: 'EMILY' },
            { id: '11', info: 'JESSICA' }
        ];

        const diff2: Differencer = new Differencer(a1, a2);

        // Strictly test the added nodes functionality
        expect(diff2.getAddedNodes()).toStrictEqual([{ id: '-1', info: 'LEO' }, 
            { id: '2.5', info: 'RILEY' }, { id: '4.5', info: 'TEX' }, 
            { id: '4.6', info: 'CASSIE' }, { id: '11', info: 'BILL' },
            { id: '12', info: 'ARIEL' }]);
        expect(diff2.getRemovedNodes()).toStrictEqual([]);
        expect(diff2.getChangedNodes()).toStrictEqual([]);
        
        const diff3: Differencer = new Differencer(a1, a3);

        // Strictly test the removed nodes functionality
        expect(diff3.getAddedNodes()).toStrictEqual([]);
        expect(diff3.getRemovedNodes()).toStrictEqual([{ id: '1', info: 'JAMES'}, 
            { id: '4', info: 'SALLY' }, { id: '5', info: 'GERRIT' }, 
            { id: '0', info: 'EMILY' }]);
        expect(diff3.getChangedNodes()).toStrictEqual([]);

        const diff4: Differencer = new Differencer(a1, a4);

        // Strictly test the changed nodes functionality
        expect(diff4.getAddedNodes()).toStrictEqual([]);
        expect(diff4.getRemovedNodes()).toStrictEqual([]);
        expect(diff4.getChangedNodes()).toStrictEqual([{ id: '1', info: 'JAMESTHONY' },
            { id: '4', info: 'SALLYTHONY' }, { id: '5', info: 'GERRITTHONY' },
            { id: '7', info: 'TIMTHONY' }, { id: '9', info: 'STEVETHONY' },
            { id: '0', info: 'EMILYTHONY' }]);

        const diff5: Differencer = new Differencer(a1, a5);

        // Test all node differences at once
        expect(diff5.getAddedNodes()).toStrictEqual([{ id: '1.5', info: 'RYANTHONY' }, 
            { id: '11', info: 'JESSICA' }]);
        expect(diff5.getRemovedNodes()).toStrictEqual([{ id: '4', info: 'SALLY' },
            { id: '8', info: 'KAT' }]);
        expect(diff5.getChangedNodes()).toStrictEqual([{ id: '2', info: '' }, 
            { id: '5', info: 'GERRITHONY' }, { id: '7', info: 'TIMTHONY' }]);
    });
});
