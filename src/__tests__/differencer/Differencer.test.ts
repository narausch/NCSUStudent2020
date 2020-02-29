import Differencer from '../../contentscript/differencer/Differencer';
import { GraphNode } from '../../contentscript/graph/GraphNode';
import { Graph } from '../../contentscript/graph/Graph';
import { GraphConnection } from '../../contentscript/graph/GraphConnection';
import { Status } from '../../contentscript/graph/Status';

describe('Differencer#smallInputChanges', () => {
    test('normal cases', async () => {
        const n1 = [
            new GraphNode('a', 'FARM'),
            new GraphNode('b', 'BOY'),
            new GraphNode('c', 'CAT'),
            new GraphNode('d', 'DOG'),
        ];
        const n2 = [
            new GraphNode('a', 'FOREST'),
            new GraphNode('c', 'CAT'),
            new GraphNode('d', 'DOG'),
            new GraphNode('e', 'EMU'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
        ];
        const c2 = [
            new GraphConnection('a', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
        ];

        const diff: Differencer = new Differencer(new Graph(n1, c1), new Graph(n2, c2));

        expect(diff.getAddedNodes()).toStrictEqual([new GraphNode('e', 'EMU', Status.Added)]);
        expect(diff.getRemovedNodes()).toStrictEqual([new GraphNode('b', 'BOY', Status.Removed)]);
        expect(diff.getModifiedNodes()).toStrictEqual([
            new GraphNode('a', 'FOREST', Status.Modified),
        ]);
        expect(diff.getUnmodifiedNodes()).toStrictEqual([
            new GraphNode('c', 'CAT', Status.Unmodified),
            new GraphNode('d', 'DOG', Status.Unmodified),
        ]);
    });
});

describe('Differencer#nullGraphs', () => {
    test('null base graph', async () => {
        const n1 = [
            new GraphNode('a', 'FARM'),
            new GraphNode('b', 'BOY'),
            new GraphNode('c', 'CAT'),
            new GraphNode('d', 'DOG'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
        ];

        const diff: Differencer = new Differencer(null, new Graph(n1, c1));
        expect(diff.getAddedNodes()).toStrictEqual(n1);
        expect(diff.getAddedConns()).toStrictEqual(c1);
    });

    test('null compare graph', async () => {
        const n1 = [
            new GraphNode('a', 'FARM'),
            new GraphNode('b', 'BOY'),
            new GraphNode('c', 'CAT'),
            new GraphNode('d', 'DOG'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
        ];

        const diff: Differencer = new Differencer(new Graph(n1, c1), null);
        expect(diff.getRemovedNodes()).toStrictEqual(n1);
        expect(diff.getRemovedConns()).toStrictEqual(c1);
    });
});
// describe('Differencer#mediumInputChanges', () => {
//     test('normal cases', async () => {
//         // A base list of names
//         const a1 = [
//             new GraphNode('1', 'JAMES'),
//             new GraphNode('2', 'VAL'),
//             new GraphNode('3', 'JOSEPH'),
//             new GraphNode('4', 'SALLY'),
//             new GraphNode('5', 'GERRIT'),
//             new GraphNode('6', 'MARGE'),
//             new GraphNode('7', 'TIM'),
//             new GraphNode('8', 'KAT'),
//             new GraphNode('9', 'STEVE'),
//             new GraphNode('0', 'EMILY'),
//         ];

//         // The base list of names with added names
//         const a2 = [
//             new GraphNode('-1', 'LEO'),
//             new GraphNode('1', 'JAMES'),
//             new GraphNode('2', 'VAL'),
//             new GraphNode('2.5', 'RILEY'),
//             new GraphNode('3', 'JOSEPH'),
//             new GraphNode('4', 'SALLY'),
//             new GraphNode('4.5', 'TEX'),
//             new GraphNode('4.6', 'CASSIE'),
//             new GraphNode('5', 'GERRIT'),
//             new GraphNode('6', 'MARGE'),
//             new GraphNode('7', 'TIM'),
//             new GraphNode('8', 'KAT'),
//             new GraphNode('9', 'STEVE'),
//             new GraphNode('0', 'EMILY'),
//             new GraphNode('11', 'BILL'),
//             new GraphNode('12', 'ARIEL'),
//         ];

//         // The base list of names with 4 names removed
//         const a3 = [
//             new GraphNode('2', 'VAL'),
//             new GraphNode('3', 'JOSEPH'),
//             new GraphNode('6', 'MARGE'),
//             new GraphNode('7', 'TIM'),
//             new GraphNode('8', 'KAT'),
//             new GraphNode('9', 'STEVE'),
//         ];

//         // The base list of  names with 6 of the names changed by
//         // adding 'THONY' to the end of them
//         const a4 = [
//             new GraphNode('1', 'JAMESTHONY'),
//             new GraphNode('2', 'VAL'),
//             new GraphNode('3', 'JOSEPH'),
//             new GraphNode('4', 'SALLYTHONY'),
//             new GraphNode('5', 'GERRITTHONY'),
//             new GraphNode('6', 'MARGE'),
//             new GraphNode('7', 'TIMTHONY'),
//             new GraphNode('8', 'KAT'),
//             new GraphNode('9', 'STEVETHONY'),
//             new GraphNode('0', 'EMILYTHONY'),
//         ];

//         // The base list of names but with some added names, some
//         // deleted names, and some modified names
//         const a5 = [
//             new GraphNode('1', 'JAMES'),
//             new GraphNode('1.5', 'RYANTHONY'),
//             new GraphNode('2', ''),
//             new GraphNode('3', 'JOSEPH'),
//             new GraphNode('5', 'GERRITHONY'),
//             new GraphNode('6', 'MARGE'),
//             new GraphNode('7', 'TIMTHONY'),
//             new GraphNode('9', 'STEVE'),
//             new GraphNode('0', 'EMILY'),
//             new GraphNode('11', 'JESSICA'),
//         ];

//         const diff2: Differencer = new Differencer(a1, a2);

//         // Strictly test the added nodes functionality
//         expect(diff2.getAddedNodes()).toStrictEqual([
//             new GraphNode('-1', 'LEO'),
//             new GraphNode('2.5', 'RILEY'),
//             new GraphNode('4.5', 'TEX'),
//             new GraphNode('4.6', 'CASSIE'),
//             new GraphNode('11', 'BILL'),
//             new GraphNode('12', 'ARIEL'),
//         ]);
//         expect(diff2.getRemovedNodes()).toStrictEqual([]);
//         expect(diff2.getModifiedNodes()).toStrictEqual([]);

//         const diff3: Differencer = new Differencer(a1, a3);

//         // Strictly test the removed nodes functionality
//         expect(diff3.getAddedNodes()).toStrictEqual([]);
//         expect(diff3.getRemovedNodes()).toStrictEqual([
//             new GraphNode('1', 'JAMES'),
//             new GraphNode('4', 'SALLY'),
//             new GraphNode('5', 'GERRIT'),
//             new GraphNode('0', 'EMILY'),
//         ]);
//         expect(diff3.getModifiedNodes()).toStrictEqual([]);

//         const diff4: Differencer = new Differencer(a1, a4);

//         // Strictly test the changed nodes functionality
//         expect(diff4.getAddedNodes()).toStrictEqual([]);
//         expect(diff4.getRemovedNodes()).toStrictEqual([]);
//         expect(diff4.getModifiedNodes()).toStrictEqual([
//             new GraphNode('1', 'JAMESTHONY'),
//             new GraphNode('4', 'SALLYTHONY'),
//             new GraphNode('5', 'GERRITTHONY'),
//             new GraphNode('7', 'TIMTHONY'),
//             new GraphNode('9', 'STEVETHONY'),
//             new GraphNode('0', 'EMILYTHONY'),
//         ]);

//         const diff5: Differencer = new Differencer(a1, a5);

//         // Test all node differences at once
//         expect(diff5.getAddedNodes()).toStrictEqual([
//             new GraphNode('1.5', 'RYANTHONY'),
//             new GraphNode('11', 'JESSICA'),
//         ]);
//         expect(diff5.getRemovedNodes()).toStrictEqual([
//             new GraphNode('4', 'SALLY'),
//             new GraphNode('8', 'KAT'),
//         ]);
//         expect(diff5.getModifiedNodes()).toStrictEqual([
//             new GraphNode('2', ''),
//             new GraphNode('5', 'GERRITHONY'),
//             new GraphNode('7', 'TIMTHONY'),
//         ]);
//     });
// });
