import { GraphNode } from '../../contentscript/graph/GraphNode';
import RootedTree from '../../contentscript/graph/RootedTree';

describe('RootedTree#getLayoutSize', () => {
    test('trivial graph', async () => {
        const t1 = new RootedTree(new GraphNode('a', {}), []);
        expect(t1.getLayoutSize()).toStrictEqual([1, 1]);
    });

    test('path', async () => {
        const t3 = new RootedTree(new GraphNode('c', {}), []);
        const t2 = new RootedTree(new GraphNode('b', {}), [t3]);
        const t1 = new RootedTree(new GraphNode('a', {}), [t2]);
        expect(t1.getLayoutSize()).toStrictEqual([3, 1]);
    });

    test('binary tree', async () => {
        const t4 = new RootedTree(new GraphNode('d', {}), []);
        const t5 = new RootedTree(new GraphNode('e', {}), []);
        const t6 = new RootedTree(new GraphNode('f', {}), []);
        const t7 = new RootedTree(new GraphNode('g', {}), []);
        const t2 = new RootedTree(new GraphNode('b', {}), [t4, t5]);
        const t3 = new RootedTree(new GraphNode('c', {}), [t6, t7]);
        const t1 = new RootedTree(new GraphNode('a', {}), [t2, t3]);
        expect(t1.getLayoutSize()).toStrictEqual([3, 4]);
    });

    test('other graphs', async () => {
        const t6 = new RootedTree(new GraphNode('f', {}), []);
        const t7 = new RootedTree(new GraphNode('g', {}), []);
        const t2 = new RootedTree(new GraphNode('b', {}), []);
        const t3 = new RootedTree(new GraphNode('c', {}), [t6, t7]);
        const t4 = new RootedTree(new GraphNode('d', {}), []);
        const t5 = new RootedTree(new GraphNode('e', {}), []);
        const t1 = new RootedTree(new GraphNode('a', {}), [t2, t3, t4, t5]);
        expect(t1.getLayoutSize()).toStrictEqual([3, 4]);
    });
});
