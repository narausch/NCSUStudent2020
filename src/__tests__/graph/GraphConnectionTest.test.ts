import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
import { GraphConnection } from '../../contentscript/graph/GraphConnection';

describe('Graph Connection tests', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);

        expect(graph.nodes.length).toBe(6);
        expect(graph.connections.length).toBe(5);
    });
    test('Invalid JSON string', async () => {
        let result = '';
        try {
            const jsonString = '{ "This is not a valid JSON string" }';
            const graph = new Graph(jsonString);
            fail;
        } catch (err) {
            result = (err as Error).message;
        }

        expect(result).toBe('Not a valid JSON string');
    });

    test('Constructor broken object', async () => {
        const jsonString = '{ "notConnections": "test" }';

        let graph: Graph = null;
        let result = '';
        try {
            graph = new Graph(jsonString);
        } catch (err) {
            result = (err as Error).message;
        }

        expect(result).toBe('JSON file is not formatted correctly');
        expect(graph).toBe(null);
    });
});

describe('Connection tests', () => {
    test('Constructor', async () => {
        const jsonString = '{"sourcePort": {"node": "test-id"}, "targetPort": {"node":"test-id2"}}';
        const connection = new GraphConnection(JSON.parse(jsonString));

        expect(connection.sourcePort).toBe('test-id');
        expect(connection.targetPort).toBe('test-id2');
    });

    test('Constructor broken', async () => {
        const jsonString = '{"sourcePort": {"node": "test-id"}, "taetPort": {"node":"test-id2"}}';

        let connection: GraphConnection = null;
        let result = '';
        try {
            connection = new GraphConnection(JSON.parse(jsonString));
        } catch (err) {
            result = (err as Error).message;
        }

        expect(result).toBe('JSON file is not formatted correctly');
        expect(connection).toBe(null);
    });
});
