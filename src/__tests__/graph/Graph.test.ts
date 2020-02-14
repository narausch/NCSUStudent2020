import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
import { GraphConnection } from '../../contentscript/graph/GraphConnection';

describe('Create Graph', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);

        expect(graph.nodes.length).toBe(6);
        expect(graph.connections.length).toBe(5);
    });
});

describe('Create Connection', () => {
    test('Constructor', async () => {
        const jsonString = '{"sourcePort": {"node": "test-id"}, "targetPort": {"node":"test-id2"}}';
        const connection = new GraphConnection(JSON.parse(jsonString));

        expect(connection.sourcePort).toBe('test-id');
        expect(connection.targetPort).toBe('test-id2');
    });
});
