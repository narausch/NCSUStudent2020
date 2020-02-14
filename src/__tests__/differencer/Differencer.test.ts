import Differencer from '../../contentscript/differencer/Differencer';

describe('Differencer#getAddedNodes', () => {
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
