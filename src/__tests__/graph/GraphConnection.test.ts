import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
import { GraphConnection } from '../../contentscript/graph/GraphConnection';
describe('Connection tests', () => {
    test('Invalid source port', async () => {
        const jsonString = fs.readFileSync(
            'src/__tests__/resources/invalidSourcePort.json',
            'utf8',
        );
        let result = '';
        try {
            new Graph(jsonString);
            fail;
        } catch (err) {
            result = (err as Error).message;
        }
        expect(result).toBe('Not valid source port');
    });

    test('Invalid target port', async () => {
        const jsonString = fs.readFileSync(
            'src/__tests__/resources/invalidTargetPort.json',
            'utf8',
        );
        let result = '';
        try {
            new Graph(jsonString);
            fail;
        } catch (err) {
            result = (err as Error).message;
        }
        expect(result).toBe('Not valid target port');
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
