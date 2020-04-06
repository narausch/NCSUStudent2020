import { GraphNode } from '../graph/GraphNode';
import { Graph } from '../graph/Graph';
import { GraphConnection } from '../graph/GraphConnection';
import { Status } from '../graph/Status';

export default class Differencer {
    private n1: GraphNode[];
    private n2: GraphNode[];
    private c1: GraphConnection[];
    private c2: GraphConnection[];

    private addedNodes: GraphNode[] = [];
    private removedNodes: GraphNode[] = [];
    private modifiedNodes: GraphNode[] = [];
    private unmodifiedNodes: GraphNode[] = [];

    private addedConns: GraphConnection[] = [];
    private removedConns: GraphConnection[] = [];
    private unmodifiedConns: GraphConnection[] = [];

    private differencerGraph: Graph;

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

        //go through each list, set node flags, and add to master list
        const nodes: GraphNode[] = [];
        const conns: GraphConnection[] = [];

        this.addedNodes.forEach(element => {
            element.status = Status.Added;
            nodes.push(element);
        });
        this.removedNodes.forEach(element => {
            element.status = Status.Removed;
            nodes.push(element);
        });
        this.modifiedNodes.forEach(element => {
            element.status = Status.Modified;
            nodes.push(element);
        });
        this.unmodifiedNodes.forEach(element => {
            element.status = Status.Unmodified;
            nodes.push(element);
        });

        this.addedConns.forEach(element => {
            element.status = Status.Added;
            conns.push(element);
        });
        this.removedConns.forEach(element => {
            element.status = Status.Removed;
            conns.push(element);
        });
        this.unmodifiedConns.forEach(element => {
            element.status = Status.Unmodified;
            conns.push(element);
        });

        //sets flags
        this.addedNodes = nodes.filter(value => value.status == Status.Added);
        this.removedNodes = nodes.filter(value => value.status == Status.Removed);
        this.modifiedNodes = nodes.filter(value => value.status == Status.Modified);
        this.unmodifiedNodes = nodes.filter(value => value.status == Status.Unmodified);

        this.addedConns = conns.filter(value => value.status == Status.Added);
        this.removedConns = conns.filter(value => value.status == Status.Removed);
        this.unmodifiedConns = conns.filter(value => value.status == Status.Unmodified);

        this.differencerGraph = new Graph(nodes, conns);
    }

    private computeDifference(): void {
        //copy of n2 minus anything in n1
        this.addedNodes = this.n2.filter(item => !this.n1.some(v => item.id === v.id));

        //copy of n1 minus anything in n2
        this.removedNodes = this.n1.filter(item => !this.n2.some(v => item.id === v.id));

        //intersection of n1 and n2
        const sameIdNodes = this.n2.filter(item => this.n1.some(v => item.id === v.id));
        for (const entry of sameIdNodes) {
            const itemx = this.n1.find(v => v.id == entry.id);
            if (JSON.stringify(entry.data) != JSON.stringify(itemx.data)) {
                entry.oldData = itemx.data;
                this.modifiedNodes.push(entry);
            }
        }
        //unmodified nodes are those that have the same id and are not modified
        this.unmodifiedNodes = sameIdNodes.filter(
            item => !this.modifiedNodes.some(v => item.id === v.id),
        );

        //copy of c2 minus anything in c1
        this.addedConns = this.c2.filter(
            item =>
                !this.c1.some(
                    v => item.sourcePort === v.sourcePort && item.targetPort === v.targetPort,
                ),
        );
        //copy of c1 minus anything in c2
        this.removedConns = this.c1.filter(
            item =>
                !this.c2.some(
                    v => item.sourcePort === v.sourcePort && item.targetPort === v.targetPort,
                ),
        );
        //copy of a2 with non-intersection of a1 removed
        this.unmodifiedConns = this.c2.filter(item =>
            this.c1.some(v => item.sourcePort === v.sourcePort && item.targetPort === v.targetPort),
        );
    }

    private fullyDifferent(baseGraph: Graph | null, compareGraph: Graph | null): void {
        if (baseGraph == null && compareGraph == null) throw new Error('No graphs to compare');
        //graph has been created
        if (baseGraph == null) {
            this.addedNodes = compareGraph.nodes;
            this.addedConns = compareGraph.connections;
        }
        //graph has been deleted
        if (compareGraph == null) {
            this.removedNodes = baseGraph.nodes;
            this.removedConns = baseGraph.connections;
        }
    }

    getDifferencerGraph(): Graph {
        return this.differencerGraph;
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
    getUnmodifiedNodes(): GraphNode[] {
        return this.unmodifiedNodes;
    }

    getAddedConns(): GraphConnection[] {
        return this.addedConns;
    }
    getRemovedConns(): GraphConnection[] {
        return this.removedConns;
    }
    getUnmodifiedConns(): GraphConnection[] {
        return this.unmodifiedConns;
    }
}
