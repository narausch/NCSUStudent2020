/* eslint-disable @typescript-eslint/no-explicit-any */
import { Status } from './Status';

export class GraphNode {
    public id: string;
    public data: any;
    public oldData: any;
    public status: Status;

    /**
     * Constructs the GraphNode object
     * @param id The id of the graph node
     * @param data The data from the graph node
     */
    constructor(id: string, data: any, status?: Status, oldData?: any) {
        this.id = id;
        this.data = data;
        this.oldData = oldData;
        this.status = status;
    }
}
