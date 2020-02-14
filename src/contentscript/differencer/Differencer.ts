/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Graph } from '../graph/Graph';
// import { GraphNode } from '../graph/GraphNode';
// import { GraphConnection } from '../graph/GraphConnection';

export default class Differencer {
    private a1: Map<string, any>;
    private a2: Map<string, any>;
    private addedNodes: Set<string>;
    private removedNodes: Set<string>;
    private changedNodes: Set<string> = new Set();

    /**
     * Constructs a Differencer.
     *
     * @param
     */
    constructor(a1: Map<string, any>, a2: Map<string, any>) {
        this.a1 = a1;
        this.a2 = a2;
        this.computeDifference();
    }

    computeDifference(): void {
        this.addedNodes = new Set([...this.a2.keys()].filter(x => !this.a1.has(x)));
        this.removedNodes = new Set([...this.a1.keys()].filter(x => !this.a2.has(x)));
        for (const [key, val] of this.a1) {
            const testVal = this.a2.get(key);
            //change this line to find differences in all fields
            if (testVal !== val || (testVal === undefined && !this.a2.has(key))) {
                this.changedNodes.add(val);
            }
        }
    }

    getAddedNodes(): Set<string> {
        return this.addedNodes;
    }

    getRemovedNodes(): Set<string> {
        return this.removedNodes;
    }

    getChangedNodes(): Set<string> {
        return this.changedNodes;
    }
}
