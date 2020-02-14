import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';

describe('Create Graph', () => {
    test('Constructor', async () => {
        const jsonString = fs.readFileSync('src/__tests__/resources/jsonFile1.json', 'utf8');

        const graph = new Graph(jsonString);
        console.log(graph.nodes);
    });
});
