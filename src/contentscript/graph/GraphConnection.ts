/* eslint-disable @typescript-eslint/no-explicit-any */
export class GraphConnection {
    public sourcePort: string;
    public targetPort: string;

    /**
     * Constructs a GraphConnection object
     * @param jsonConnection the connection in json format
     */
    constructor(jsonConnection: any);
    constructor(sourcePort: string, targetPort: string);
    constructor(jsonConnectionOrsourcePort: string | any, targetPort?: string) {
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
    }
}
