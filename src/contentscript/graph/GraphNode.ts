/* eslint-disable @typescript-eslint/no-explicit-any */

export class GraphNode {
    public id: string;
    public data: any;

    /**
     * Constructs the GraphNode object
     * @param id The id of the graph node
     * @param data The data from the graph node
     */
    constructor(id: string, data: any) {
        this.id = id;
        this.data = data;
    }
}
