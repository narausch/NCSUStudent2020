import * as Flag from './Status';
export class GraphConnection {
    public sourcePort: string;
    public targetPort: string;
    public status: Flag.Status;

    /**
     * Constructs a GraphConnection object
     * @param jsonConnection the connection in json format
     */
    constructor(jsonConnection: any) {
        if (
            !(
                jsonConnection.hasOwnProperty('sourcePort') &&
                jsonConnection.hasOwnProperty('targetPort')
            )
        ) {
            throw new TypeError('JSON file is not formatted correctly');
        }

        this.sourcePort = jsonConnection.sourcePort.node;
        this.targetPort = jsonConnection.targetPort.node;
        this.status = Flag.Status.New;
    }
}
