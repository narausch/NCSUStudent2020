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
