export class GraphNode {
    public id: string; // Might not need if the node is saved in a map in Graph
    public name: string;
    public description: string;
    public parameters: Map<string, any>;
}
