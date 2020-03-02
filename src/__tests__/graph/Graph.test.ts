import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
import { Status } from '../../contentscript/graph/Status';
import { GraphNode } from '../../contentscript/graph/GraphNode';
import { GraphConnection } from '../../contentscript/graph/GraphConnection';
import RootedTree from '../../contentscript/graph/RootedTree';

describe('Graph tests', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);

        expect(graph.nodes.length).toBe(6);
        expect(graph.connections.length).toBe(5);
        // Some trivial test cases for Status enum class to reach 70% coverage
        graph.getNodes()[0].status = Status.Modified;
        graph.getNodes()[1].status = Status.Unmodified;
        graph.getNodes()[2].status = Status.Removed;
        graph.getNodes()[3].status = Status.Added;

        graph.getConnections()[0].status = Status.Added;
        graph.getConnections()[1].status = Status.Removed;
        graph.getConnections()[2].status = Status.Unmodified;
    });

    test('Constructor bad input', async () => {
        const badJsonString = '{ "notConnections": "test" }';
        const nonJsonString = '"notConnections": "test"';
        expect(() => new Graph(badJsonString)).toThrowError('JSON file is not formatted correctly');
        expect(() => new Graph(nonJsonString)).toThrowError('Not a valid JSON string');
    });
});

describe('Graph#stratify', () => {
    test('trivial graphs', async () => {
        const nullGraph = new Graph([], []);
        expect(nullGraph.stratify()).toStrictEqual([]);

        const k1 = new Graph([new GraphNode('a', {})], []);
        expect(k1.stratify()).toStrictEqual([new RootedTree(k1.nodes[0], [])]);
    });

    test('paths', async () => {
        const p2 = new Graph(
            [new GraphNode('a', {}), new GraphNode('b', {})],
            [new GraphConnection('a', 'b')],
        );

        expect(p2.stratify()).toStrictEqual([
            new RootedTree(p2.nodes[0], [new RootedTree(p2.nodes[1], [])]),
        ]);

        const p3 = new Graph(
            [new GraphNode('c', {}), new GraphNode('b', {}), new GraphNode('a', {})],
            [new GraphConnection('a', 'b'), new GraphConnection('b', 'c')],
        );

        expect(p3.stratify()).toStrictEqual([
            new RootedTree(p3.nodes[2], [
                new RootedTree(p3.nodes[1], [new RootedTree(p3.nodes[0], [])]),
            ]),
        ]);
    });

    test('multiple components', async () => {
        const twoTriangles = new Graph(
            [
                new GraphNode('a', {}),
                new GraphNode('b', {}),
                new GraphNode('c', {}),
                new GraphNode('d', {}),
                new GraphNode('e', {}),
                new GraphNode('f', {}),
            ],
            [
                new GraphConnection('a', 'b'),
                new GraphConnection('b', 'c'),
                new GraphConnection('c', 'a'),
                new GraphConnection('d', 'e'),
                new GraphConnection('e', 'f'),
                new GraphConnection('f', 'd'),
            ],
        );

        expect(twoTriangles.stratify()).toStrictEqual([
            new RootedTree(twoTriangles.nodes[0], [
                new RootedTree(twoTriangles.nodes[1], [new RootedTree(twoTriangles.nodes[2], [])]),
            ]),
            new RootedTree(twoTriangles.nodes[3], [
                new RootedTree(twoTriangles.nodes[4], [new RootedTree(twoTriangles.nodes[5], [])]),
            ]),
        ]);
    });
});
