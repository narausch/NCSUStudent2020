export class Graph {
    /* Currently only uses the json nodes and connections
    when we want to add the parameters we will want to use GraphNode
    and GraphConnection
    */

    public nodes: any; // TODO: Switch to GraphNode type
    public connections: Array<any>; // TODO: Switch to GraphConnection type

    constructor(jsonString: string) {
        const json = JSON.parse(jsonString);
        if (
            !(
                json.hasOwnProperty('nodes') &&
                json.hasOwnProperty('connections') &&
                json.hasOwnProperty('parameters')
            )
        ) {
            throw new TypeError('JSON file is not formatted correctly');
        }

        const map = new Map<string, any>();
        Object.keys(json.nodes).forEach(key => {
            map[key] = json.nodes[key];
        });

        this.nodes = map;
        this.connections = json.connections;
    }
}
