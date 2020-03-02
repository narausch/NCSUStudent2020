import { GraphNode } from './GraphNode';

export default class RootedTree {
    constructor(public data: GraphNode, public children: RootedTree[]) {}
}
