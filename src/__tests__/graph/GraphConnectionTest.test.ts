import { Graph } from '../../contentscript/graph/Graph';
import fs from 'fs';
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
});
