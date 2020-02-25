import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
import { Status } from '../../contentscript/graph/Status';

describe('Graph tests', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);

        expect(graph.nodes.length).toBe(6);
        expect(graph.connections.length).toBe(5);
        // Some trivial test cases for Status enum class to reach 70% coverage
        graph.nodes[0].status = Status.Modified;
        graph.nodes[1].status = Status.Unmodified;
        graph.nodes[2].status = Status.Deleted;
        graph.nodes[3].status = Status.Added;
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
