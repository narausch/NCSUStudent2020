/* eslint-disable @typescript-eslint/no-explicit-any */
import { Status } from './Status';
export class GraphConnection {
    public sourcePort: string;
    public targetPort: string;
    public status: Status;

    /**
     * Constructs a GraphConnection object
     * @param jsonConnection the connection in json format
     */
    constructor(jsonConnection: any);
    constructor(sourcePort: string, targetPort: string, status?: Status);
    constructor(jsonConnectionOrsourcePort: string | any, targetPort?: string, status?: Status) {
        let jsonConnection: any;
        if (!targetPort) {
            jsonConnection = jsonConnectionOrsourcePort;
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
        } else {
            this.sourcePort = jsonConnectionOrsourcePort;
            this.targetPort = targetPort;
        }
        this.status = status;
    }
}
