import { GraphNode } from './GraphNode';
import { GraphConnection } from './GraphConnection';
import fs from 'fs';

export class Graph {
    public nodes: Array<GraphNode>;
    public connections: Array<GraphConnection>;

    /**
     * Constructs a graph object from a json string.
     * @param jsonString The json string for the graph to construct.
     */
    constructor(jsonString: string) {
        // Error case when the file is not a json string
        // TODO: The test cases fail
        var json: any;
        try {
            const json = JSON.parse(jsonString, function(key, value) {
                if (key == null || value == null) {
                    throw new TypeError('Not a valid JSON string');
                }
            });
        } catch (e) {
            throw new TypeError('Not a valid JSON string');
        }

        if (
            !(
                json.hasOwnProperty('nodes') &&
                json.hasOwnProperty('connections') &&
                json.hasOwnProperty('parameters')
            )
        ) {
            throw new TypeError('JSON file is not formatted correctly');
        }

        this.nodes = new Array<GraphNode>();

        Object.keys(json.nodes).forEach(key => {
            this.nodes.push(new GraphNode(key, json.nodes[key]));
        });

        this.connections = new Array<GraphConnection>();
        json.connections.forEach(element => {
            const connection = new GraphConnection(element);
            this.connections.push(connection);
        });
    }
}
