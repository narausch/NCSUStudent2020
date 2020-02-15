import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';

describe('Graph tests', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);

        expect(graph.nodes.length).toBe(6);
        expect(graph.connections.length).toBe(5);
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
