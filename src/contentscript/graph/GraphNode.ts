/* eslint-disable @typescript-eslint/no-explicit-any */
enum Flag {
    CREATED,
    REMOVED,
    MODIFIED,
    UNMODIFIED,
}

export class GraphNode {
    public id: string;
    public data: any;
    public flag: Flag;

    /**
     * Constructs the GraphNode object
     * @param id The id of the graph node
     * @param data The data from the graph node
     */
    constructor(id: string, data: any, flag?: Flag) {
        this.id = id;
        this.data = data;
        this.flag = flag;
    }
}
