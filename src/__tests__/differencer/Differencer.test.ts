import Differencer from '../../contentscript/differencer/Differencer';
// import { Graph } from '../../contentscript/graph/Graph';
// import fs from 'fs';
// import { Graph } from '../../contentscript/graph/Graph';

describe('Differencer#getAddedNodes', () => {
    test('normal cases', async () => {
        const a1 = new Map([
            ['a', { id: 'a', info: 'FARM' }],
            ['b', { id: 'b', info: 'BOY' }],
            ['c', { id: 'c', info: 'CAT' }],
        ]);
        const a2 = new Map([
            ['a', { id: 'a', info: 'FOREST' }],
            ['c', { id: 'c', info: 'CAT' }],
            ['d', { id: 'd', info: 'DOG' }],
        ]);

        const diff: Differencer = new Differencer(a1, a2);

        console.log(diff.getAddedNodes());
        console.log(diff.getRemovedNodes());
        console.log(diff.getChangedNodes());

        // const flow1 = fs.readFileSync('src/__tests__/resources/flow1json.json', 'utf8');
        // const flow2 = fs.readFileSync('src/__tests__/resources/flow2json.json', 'utf8');

        // const flow1Graph = new Graph(flow1);
        // const flow2Graph = new Graph(flow2);
        // const sameDiff = new Differencer(flow1Graph, flow1Graph);
        // const diffDiff = new Differencer(flow1Graph, flow2Graph);

        // console.log(sameDiff.getAddedNodes());
        // console.log(diffDiff.getAddedNodes());

        // expect(sameDiff.getAddedNodes()).toStrictEqual([]);

        // const a1 = new Map([
        //     ['a', { id: 'a', info: 'FARM', nodes: '', connections: '' }],
        //     ['b', { id: 'b', info: 'BOY', nodes: '', connections: '' }],
        //     ['c', { id: 'c', info: 'CAT', nodes: '', connections: '' }],
        // ]);
        // const a2 = new Map([
        //     ['a', { id: 'a', info: 'FOREST' }],
        //     ['c', { id: 'c', info: 'CAT' }],
        //     ['d', { id: 'd', info: 'DOG' }],
        // ]);

        // const diff = new Differencer(a1, a2);
    });
});
