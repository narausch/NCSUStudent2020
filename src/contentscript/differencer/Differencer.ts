import { GraphNode } from '../graph/GraphNode';
import { Graph } from '../graph/Graph';
import { GraphConnection } from '../graph/GraphConnection';

export default class Differencer {
    private n1: GraphNode[];
    private n2: GraphNode[];
    private c1: GraphConnection[];
    private c2: GraphConnection[];

    private addedNodes: GraphNode[];
    private removedNodes: GraphNode[];
    private modifiedNodes: GraphNode[] = [];
    private addedConns: GraphConnection[];
    private removedConns: GraphConnection[];

    /**
     * Constructs a Differencer.
     *
     * @param
     */
    constructor(baseGraph: Graph | null, compareGraph: Graph | null) {
        if (baseGraph == null || compareGraph == null) {
            this.fullyDifferent(baseGraph, compareGraph);
        } else {
            this.n1 = baseGraph.nodes;
            this.n2 = compareGraph.nodes;
            this.c1 = baseGraph.connections;
            this.c2 = compareGraph.connections;
            this.computeDifference();
        }
    }

    computeDifference(): void {
        //copy of n2 with intersection of n1 removed
        this.addedNodes = this.n2.filter(item => !this.n1.some(v => item.id === v.id));

        //copy of n1 with intersection of n2 removed
        this.removedNodes = this.n1.filter(item => !this.n2.some(v => item.id === v.id));

        //copy of a2 with non-intersection of a1 removed
        const same = this.n2.filter(item => this.n1.some(v => item.id === v.id));
        for (const entry of same) {
            const itemx = this.n1.find(v => v.id == entry.id);
            if (JSON.stringify(entry) != JSON.stringify(itemx)) this.modifiedNodes.push(entry);
        }

        //copy of c2 with intersection of c1 removed
        this.addedConns = this.c2.filter(item => !this.c1.some(v => item === v));
        //copy of c1 with intersection of c2 removed
        this.removedConns = this.c1.filter(item => !this.c2.some(v => item === v));
    }

    fullyDifferent(baseGraph: Graph | null, compareGraph: Graph | null): void {
        if (baseGraph == null && compareGraph == null) throw new Error('No graphs to compare');
        //graph has been created
        if (baseGraph == null) {
            this.addedNodes = baseGraph.nodes;
            this.addedConns = baseGraph.connections;
        }
        //graph has been deleted
        if (compareGraph == null) {
            this.removedNodes = compareGraph.nodes;
            this.removedConns = compareGraph.connections;
        }
    }

    getAddedNodes(): GraphNode[] {
        return this.addedNodes;
    }

    getRemovedNodes(): GraphNode[] {
        return this.removedNodes;
    }

    getModifiedNodes(): GraphNode[] {
        return this.modifiedNodes;
    }
}
