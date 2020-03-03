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

        expect(diff.getAddedConns()).toStrictEqual([
            new GraphConnection('a', 'c', Status.Added),
            new GraphConnection('d', 'e', Status.Added),
        ]);
        expect(diff.getRemovedConns()).toStrictEqual([
            new GraphConnection('a', 'b', Status.Removed),
            new GraphConnection('b', 'c', Status.Removed),
        ]);
        expect(diff.getUnmodifiedConns()).toStrictEqual([
            new GraphConnection('c', 'd', Status.Unmodified),
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

    test('no graphs to compare', async () => {
        try {
            const diff: Differencer = new Differencer(null, null);
            fail();
        } catch(e) {
            expect(e.message).toBe('No graphs to compare');
        }
    });
});

describe('Differencer#mediumInputChanges', () => {
    test('added nodes and connections', async () => {
        const n1 = [
            new GraphNode('a', 'Adam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'Earl'),
            new GraphNode('f', 'Faith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'Jess'),
        ];
        const n2 = [
            new GraphNode('k', 'Kyle'),
            new GraphNode('a', 'Adam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('l', 'Lisa'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'Earl'),
            new GraphNode('m', 'Moe'),
            new GraphNode('n', 'Nellie'),
            new GraphNode('f', 'Faith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'Jess'),
            new GraphNode('o', 'Oswald'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
        ];
        const c2 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
            new GraphConnection('j', 'k'),
            new GraphConnection('k', 'l'),
            new GraphConnection('l', 'm'),
            new GraphConnection('m', 'n'),
            new GraphConnection('n', 'o'),
        ];

        const added = [
            new GraphNode('k', 'Kyle', Status.Added),
            new GraphNode('l', 'Lisa', Status.Added),
            new GraphNode('m', 'Moe', Status.Added),
            new GraphNode('n', 'Nellie', Status.Added),
            new GraphNode('o', 'Oswald', Status.Added),
        ];

        const unmodified = [
            new GraphNode('a', 'Adam', Status.Unmodified),
            new GraphNode('b', 'Bailey', Status.Unmodified),
            new GraphNode('c', 'Carl', Status.Unmodified),
            new GraphNode('d', 'Destiny', Status.Unmodified),
            new GraphNode('e', 'Earl', Status.Unmodified),
            new GraphNode('f', 'Faith', Status.Unmodified),
            new GraphNode('g', 'George', Status.Unmodified),
            new GraphNode('h', 'Hillary', Status.Unmodified),
            new GraphNode('i', 'Ike', Status.Unmodified),
            new GraphNode('j', 'Jess', Status.Unmodified),
        ];

        const addedConns = [
            new GraphConnection('j', 'k', Status.Added),
            new GraphConnection('k', 'l', Status.Added),
            new GraphConnection('l', 'm', Status.Added),
            new GraphConnection('m', 'n', Status.Added),
            new GraphConnection('n', 'o', Status.Added),
        ];

        const unmodifiedConns = [
            new GraphConnection('a', 'b', Status.Unmodified),
            new GraphConnection('b', 'c', Status.Unmodified),
            new GraphConnection('c', 'd', Status.Unmodified),
            new GraphConnection('d', 'e', Status.Unmodified),
            new GraphConnection('e', 'f', Status.Unmodified),
            new GraphConnection('f', 'g', Status.Unmodified),
            new GraphConnection('g', 'h', Status.Unmodified),
            new GraphConnection('h', 'i', Status.Unmodified),
            new GraphConnection('i', 'j', Status.Unmodified),
        ];

        const diff: Differencer = new Differencer(new Graph(n1, c1), new Graph(n2, c2));

        expect(diff.getAddedNodes()).toStrictEqual(added);
        expect(diff.getRemovedNodes()).toStrictEqual([]);
        expect(diff.getModifiedNodes()).toStrictEqual([]);
        expect(diff.getUnmodifiedNodes()).toStrictEqual(unmodified);

        expect(diff.getAddedConns()).toStrictEqual(addedConns);
        expect(diff.getRemovedConns()).toStrictEqual([]);
        expect(diff.getUnmodifiedConns()).toStrictEqual(unmodifiedConns);
    });

    test('removed nodes and connections', async () => {
        const n1 = [
            new GraphNode('a', 'Adam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'Earl'),
            new GraphNode('f', 'Faith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'Jess'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
        ];
        const n2 = [
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('f', 'Faith'),
            new GraphNode('i', 'Ike'),
        ];
        const c2 = [
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'f'),
            new GraphConnection('f', 'i'),
        ];

        const removed = [
            new GraphNode('a', 'Adam', Status.Removed),
            new GraphNode('e', 'Earl', Status.Removed),
            new GraphNode('g', 'George', Status.Removed),
            new GraphNode('h', 'Hillary', Status.Removed),
            new GraphNode('j', 'Jess', Status.Removed),
        ];

        const unmodified = [
            new GraphNode('b', 'Bailey', Status.Unmodified),
            new GraphNode('c', 'Carl', Status.Unmodified),
            new GraphNode('d', 'Destiny', Status.Unmodified),
            new GraphNode('f', 'Faith', Status.Unmodified),
            new GraphNode('i', 'Ike', Status.Unmodified),
        ];

        const addedConns = [
            new GraphConnection('d', 'f', Status.Added),
            new GraphConnection('f', 'i', Status.Added),
        ];
        const removedConns = [
            new GraphConnection('a', 'b', Status.Removed),
            new GraphConnection('d', 'e', Status.Removed),
            new GraphConnection('e', 'f', Status.Removed),
            new GraphConnection('f', 'g', Status.Removed),
            new GraphConnection('g', 'h', Status.Removed),
            new GraphConnection('h', 'i', Status.Removed),
            new GraphConnection('i', 'j', Status.Removed),
        ];
        const unmodifiedConns = [
            new GraphConnection('b', 'c', Status.Unmodified),
            new GraphConnection('c', 'd', Status.Unmodified),
        ];

        const diff: Differencer = new Differencer(new Graph(n1, c1), new Graph(n2, c2));

        expect(diff.getAddedNodes()).toStrictEqual([]);
        expect(diff.getRemovedNodes()).toStrictEqual(removed);
        expect(diff.getModifiedNodes()).toStrictEqual([]);
        expect(diff.getUnmodifiedNodes()).toStrictEqual(unmodified);

        expect(diff.getAddedConns()).toStrictEqual(addedConns);
        expect(diff.getRemovedConns()).toStrictEqual(removedConns);
        expect(diff.getUnmodifiedConns()).toStrictEqual(unmodifiedConns);
    });

    test('modified nodes', async () => {
        const n1 = [
            new GraphNode('a', 'Adam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'Earl'),
            new GraphNode('f', 'Faith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'Jess'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
        ];
        const n2 = [
            new GraphNode('a', 'DeltaAdam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'DeltaCarl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'DeltaEarl'),
            new GraphNode('f', 'DeltaFaith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'DeltaJess'),
        ];
        const c2 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
        ];

        const modified = [
            new GraphNode('a', 'DeltaAdam', Status.Modified),
            new GraphNode('c', 'DeltaCarl', Status.Modified),
            new GraphNode('e', 'DeltaEarl', Status.Modified),
            new GraphNode('f', 'DeltaFaith', Status.Modified),
            new GraphNode('j', 'DeltaJess', Status.Modified),
        ];

        const unmodified = [
            new GraphNode('b', 'Bailey', Status.Unmodified),
            new GraphNode('d', 'Destiny', Status.Unmodified),
            new GraphNode('g', 'George', Status.Unmodified),
            new GraphNode('h', 'Hillary', Status.Unmodified),
            new GraphNode('i', 'Ike', Status.Unmodified),
        ];

        const unmodifiedConns = [
            new GraphConnection('a', 'b', Status.Unmodified),
            new GraphConnection('b', 'c', Status.Unmodified),
            new GraphConnection('c', 'd', Status.Unmodified),
            new GraphConnection('d', 'e', Status.Unmodified),
            new GraphConnection('e', 'f', Status.Unmodified),
            new GraphConnection('f', 'g', Status.Unmodified),
            new GraphConnection('g', 'h', Status.Unmodified),
            new GraphConnection('h', 'i', Status.Unmodified),
            new GraphConnection('i', 'j', Status.Unmodified),
        ];

        const diff: Differencer = new Differencer(new Graph(n1, c1), new Graph(n2, c2));

        expect(diff.getAddedNodes()).toStrictEqual([]);
        expect(diff.getRemovedNodes()).toStrictEqual([]);
        expect(diff.getModifiedNodes()).toStrictEqual(modified);
        expect(diff.getUnmodifiedNodes()).toStrictEqual(unmodified);

        expect(diff.getAddedConns()).toStrictEqual([]);
        expect(diff.getRemovedConns()).toStrictEqual([]);
        expect(diff.getUnmodifiedConns()).toStrictEqual(unmodifiedConns);

    });

    test('added, removed, and modified nodes and connections', async () => {
        const n1 = [
            new GraphNode('a', 'Adam'),
            new GraphNode('b', 'Bailey'),
            new GraphNode('c', 'Carl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'Earl'),
            new GraphNode('f', 'Faith'),
            new GraphNode('g', 'George'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('j', 'Jess'),
        ];
        const c1 = [
            new GraphConnection('a', 'b'),
            new GraphConnection('b', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'f'),
            new GraphConnection('f', 'g'),
            new GraphConnection('g', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'j'),
        ];
        const n2 = [
            new GraphNode('b', 'Bailey'),
            new GraphNode('k', 'Kyle'),
            new GraphNode('c', 'DeltaCarl'),
            new GraphNode('d', 'Destiny'),
            new GraphNode('e', 'DeltaEarl'),
            new GraphNode('m', 'Moe'),
            new GraphNode('f', 'DeltaFaith'),
            new GraphNode('h', 'Hillary'),
            new GraphNode('i', 'Ike'),
            new GraphNode('l', 'Lisa'),
        ];
        const c2 = [
            new GraphConnection('b', 'k'),
            new GraphConnection('k', 'c'),
            new GraphConnection('c', 'd'),
            new GraphConnection('d', 'e'),
            new GraphConnection('e', 'm'),
            new GraphConnection('m', 'f'),
            new GraphConnection('f', 'h'),
            new GraphConnection('h', 'i'),
            new GraphConnection('i', 'l'),
        ];

        const added = [
            new GraphNode('k', 'Kyle', Status.Added),
            new GraphNode('m', 'Moe', Status.Added),
            new GraphNode('l', 'Lisa', Status.Added),
        ];
        const removed = [
            new GraphNode('a', 'Adam', Status.Removed),
            new GraphNode('g', 'George', Status.Removed),
            new GraphNode('j', 'Jess', Status.Removed),
        ];
        const modified = [
            new GraphNode('c', 'DeltaCarl', Status.Modified),
            new GraphNode('e', 'DeltaEarl', Status.Modified),
            new GraphNode('f', 'DeltaFaith', Status.Modified),
        ];
        const unmodified = [
            new GraphNode('b', 'Bailey', Status.Unmodified),
            new GraphNode('d', 'Destiny', Status.Unmodified),
            new GraphNode('h', 'Hillary', Status.Unmodified),
            new GraphNode('i', 'Ike', Status.Unmodified),
        ];

        const addedConns = [
            new GraphConnection('b', 'k', Status.Added),
            new GraphConnection('k', 'c', Status.Added),
            new GraphConnection('e', 'm', Status.Added),
            new GraphConnection('m', 'f', Status.Added),
            new GraphConnection('f', 'h', Status.Added),
            new GraphConnection('i', 'l', Status.Added),
        ];
        const removedConns = [
            new GraphConnection('a', 'b', Status.Removed),
            new GraphConnection('b', 'c', Status.Removed),
            new GraphConnection('e', 'f', Status.Removed),
            new GraphConnection('f', 'g', Status.Removed),
            new GraphConnection('g', 'h', Status.Removed),
            new GraphConnection('i', 'j', Status.Removed),
        ];
        const unmodifiedConns = [
            new GraphConnection('c', 'd', Status.Unmodified),
            new GraphConnection('d', 'e', Status.Unmodified),
            new GraphConnection('h', 'i', Status.Unmodified),
        ];

        const combinedNodes = [
            new GraphNode('k', 'Kyle', Status.Added),
            new GraphNode('m', 'Moe', Status.Added),
            new GraphNode('l', 'Lisa', Status.Added),
            new GraphNode('a', 'Adam', Status.Removed),
            new GraphNode('g', 'George', Status.Removed),
            new GraphNode('j', 'Jess', Status.Removed),
            new GraphNode('c', 'DeltaCarl', Status.Modified),
            new GraphNode('e', 'DeltaEarl', Status.Modified),
            new GraphNode('f', 'DeltaFaith', Status.Modified),
            new GraphNode('b', 'Bailey', Status.Unmodified),
            new GraphNode('d', 'Destiny', Status.Unmodified),
            new GraphNode('h', 'Hillary', Status.Unmodified),
            new GraphNode('i', 'Ike', Status.Unmodified),
        ];
        const combinedConns = [
            new GraphConnection('b', 'k', Status.Added),
            new GraphConnection('k', 'c', Status.Added),
            new GraphConnection('e', 'm', Status.Added),
            new GraphConnection('m', 'f', Status.Added),
            new GraphConnection('f', 'h', Status.Added),
            new GraphConnection('i', 'l', Status.Added),
            new GraphConnection('a', 'b', Status.Removed),
            new GraphConnection('b', 'c', Status.Removed),
            new GraphConnection('e', 'f', Status.Removed),
            new GraphConnection('f', 'g', Status.Removed),
            new GraphConnection('g', 'h', Status.Removed),
            new GraphConnection('i', 'j', Status.Removed),
            new GraphConnection('c', 'd', Status.Unmodified),
            new GraphConnection('d', 'e', Status.Unmodified),
            new GraphConnection('h', 'i', Status.Unmodified),
        ];
        const differencedGraph = new Graph(combinedNodes, combinedConns);

        const diff: Differencer = new Differencer(new Graph(n1, c1), new Graph(n2, c2));

        expect(diff.getAddedNodes()).toStrictEqual(added);
        expect(diff.getRemovedNodes()).toStrictEqual(removed);
        expect(diff.getModifiedNodes()).toStrictEqual(modified);
        expect(diff.getUnmodifiedNodes()).toStrictEqual(unmodified);

        expect(diff.getAddedConns()).toStrictEqual(addedConns);
        expect(diff.getRemovedConns()).toStrictEqual(removedConns);
        expect(diff.getUnmodifiedConns()).toStrictEqual(unmodifiedConns);

        expect(diff.getDifferencerGraph()).toStrictEqual(differencedGraph);
    });
});