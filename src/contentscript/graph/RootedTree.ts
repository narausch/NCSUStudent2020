import { GraphNode } from './GraphNode';

export default class RootedTree {
    constructor(public data: GraphNode, public children: RootedTree[]) {}

    /**
     * Performs DFS and returns the tree height plus one and the maximum level-width
     * (total number of nodes in a specific level).
     *
     * @return [tree height+1, max level-width]
     */
    getLayoutSize(): [number, number] {
        const ws: number[] = [1]; // add root: level 0 -> 1
        const stack: [number, RootedTree][] = [[0, this]];

        while (stack.length > 0) {
            const [level, tree] = stack.pop();
            if (tree.children.length == 0) continue;

            if (ws.length == level + 1) {
                ws.push(0);
            }
            ws[level + 1] += tree.children.length;
            for (const t of tree.children) {
                stack.push([level + 1, t]);
            }
        }

        return [ws.length, Math.max(...ws)];
    }
}
