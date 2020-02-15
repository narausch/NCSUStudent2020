import { GraphNode } from './GraphNode';
import { GraphConnection } from './GraphConnection';

export class Graph {
    public nodes: Array<GraphNode>;
    public connections: Array<GraphConnection>;

    /**
     * Constructs a graph object from a json string.
     * @param jsonString The json string for the graph to construct.
     */
    constructor(jsonString: string) {
        // Error case when the file is not a json string
        let json: any;
        try {
            json = JSON.parse(jsonString);
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
        // If the source port node or the dest port node is not in Node array
        // It would be invalid
        json.connections.forEach(element => {
            let sourcePort = false;
            let targetPort = false;
            // Compare current port id with all node ids
            //TODO: Break the for loop if there is a match
            this.nodes.forEach(nodeElement => {
                if (nodeElement.id == element.sourcePort.node) {
                    sourcePort = true;
                }
                if (nodeElement.id == element.targetPort.node) {
                    targetPort = true;
                }
            });

            if (!sourcePort) {
                throw new Error('Not valid source port');
            }
            if (!targetPort) {
                throw new Error('Not valid target port');
            }
            const connection = new GraphConnection(element);

            this.connections.push(connection);
        });
    }
}
