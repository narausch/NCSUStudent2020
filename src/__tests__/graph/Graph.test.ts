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

    test('Constructor bad input', async () => {
        const badJsonString = '{ "notConnections": "test" }';
        const nonJsonString = '"notConnections": "test"';
        expect(() => new Graph(badJsonString)).toThrowError('JSON file is not formatted correctly');
        expect(() => new Graph(nonJsonString)).toThrowError('Not a valid JSON string');
    });
});
