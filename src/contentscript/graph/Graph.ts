/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphConnection } from './GraphConnection';
import { GraphNode } from './GraphNode';
import RootedTree from './RootedTree';

export class Graph {
    public nodes: Array<GraphNode>;
    public connections: Array<GraphConnection>;
    public stats: any;

    /**
     * Constructs a graph object either from a json string or with a list of Nodes and a list of Connections
     * @param jsonStringOrNodes The json string for the graph to construct or the list of Nodes
     * @param connections The list of Connections
     */
    constructor(jsonString: string);
    constructor(nodes: GraphNode[], connections: GraphConnection[]);
    constructor(jsonStringOrNodes: string | GraphNode[], connections?: GraphConnection[]) {
        if (typeof jsonStringOrNodes === 'string') this.stringConstructor(jsonStringOrNodes);
        else this.listsConstructor(jsonStringOrNodes, connections);
    }

    private stringConstructor(jsonString: string): void {
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
            for (let x = 0; x < this.nodes.length; x++) {
                if (this.nodes[x].id == element.sourcePort.node) {
                    sourcePort = true;
                }
                if (this.nodes[x].id == element.targetPort.node) {
                    targetPort = true;
                }
                // If they are both true, done
                if (sourcePort && targetPort) {
                    break;
                }
            }

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

    private listsConstructor(nodes: GraphNode[], connections: GraphConnection[]): void {
        this.nodes = nodes;
        this.connections = connections;
    }

    public getNodes(): Array<GraphNode> {
        return this.nodes;
    }

    public getConnections(): Array<GraphConnection> {
        return this.connections;
    }

    /**
     * Converts this graph into a set of rooted trees.
     *
     * @return array of RootedTrees
     */
    public stratify(): Array<RootedTree> {
        const nodeTable: { [id: string]: GraphNode } = {}; // lookup table for nodes
        const inDegrees: { [id: string]: number } = {};
        const children: { [id: string]: string[] } = {};

        // (1) Create a lookup table for all nodes.
        for (const node of this.nodes) {
            nodeTable[node.id] = node;
            // initialize other information
            inDegrees[node.id] = 0;
            children[node.id] = [];
        }

        // (2) Count the number of incoming edges and collect children information.
        for (const conn of this.connections) {
            ++inDegrees[conn.targetPort];
            children[conn.sourcePort].push(conn.targetPort);
        }

        // (3) Sort the children for each node.
        for (const id in children) children[id].sort();

        // (4) Sort all vertices by in-degree (increasing) and ID (lexicographically increasing).
        const vertices: Array<[number, string]> = [];
        for (const id in inDegrees) vertices.push([inDegrees[id], id]);
        vertices.sort();

        // (5) Traverse the sorted list and perform DFS.
        const ret: Array<RootedTree> = [];
        const visited = new Set<string>();
        for (const v of vertices) {
            const id: string = v[1];
            if (visited.has(id)) continue; // already visited

            const root = new RootedTree(nodeTable[id], []); // set a new root
            const stack: Array<RootedTree> = [root]; // stack for DFS
            visited.add(id);

            while (stack.length > 0) {
                const u = stack.pop();
                // traverse all children in reverse order
                for (let i = children[u.data.id].length - 1; i >= 0; --i) {
                    const w = children[u.data.id][i];

                    if (!visited.has(w)) {
                        visited.add(w);
                        const subTree = new RootedTree(nodeTable[w], []);
                        u.children.push(subTree);
                        stack.push(subTree);
                    }
                }
                u.children.reverse(); // reverse the order of the children
            }

            ret.push(root); // add the tree to the result
        }

        return ret;
    }

    public getNodeStatsString(): string {
        return (
            'Nodes: Base: ' +
            this.stats.nodesBase +
            ', Compare: ' +
            this.stats.nodesCompare +
            ', Added: ' +
            this.stats.nodesAdded +
            ', Removed: ' +
            this.stats.nodesRemoved +
            ', Modified: ' +
            this.stats.nodesModified +
            ', Unmodified: ' +
            this.stats.nodesUnmodified
        );
    }

    public getConnStatsString(): string {
        return (
            'Connections: Base: ' +
            this.stats.connsBase +
            ', Compare: ' +
            this.stats.connsCompare +
            ', Added: ' +
            this.stats.connsAdded +
            ', Removed: ' +
            this.stats.connsRemoved +
            ', Unmodified: ' +
            this.stats.connsUnmodified
        );
    }
}
