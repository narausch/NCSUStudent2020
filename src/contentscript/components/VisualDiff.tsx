import React from 'react';
import * as d3 from 'd3';
import { Graph } from '../graph/Graph';

import './VisualDiff.css';
import RootedTree from '../graph/RootedTree';
import { GraphNode } from '../graph/GraphNode';

/**
 * id: the id of the node
 * name: name of the node
 * x: the x coordinate of the node
 * y: the y coordinate of the node
 * className: class name of the node
 */
class D3Node implements d3.SimulationNodeDatum {
    constructor(
        public id: string,
        public name: string,
        public x: number,
        public y: number,
        public className: string,
        public graphNode: GraphNode,
    ) {}
}

/**
 * source and target are the source port and target port of the connection
 * className: class name of the connection
 */
class D3Link implements d3.SimulationLinkDatum<D3Node> {
    constructor(public source: D3Node, public target: D3Node, public className: string) {}
}

/**
 * Defines the props for the VisualDiff.
 */
interface VisualDiffProps {
    /** Combined graph that contains diff information. */
    combinedGraph: Graph | null;
    width: number;
    height: number;
    callback: (node: GraphNode) => void;
}

/**
 * Defines the state for the VisualDiff.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VisualDiffState {}

/**
 * Defines the component VisualDiff.
 */
export default class VisualDiff extends React.Component<VisualDiffProps, VisualDiffState> {
    /** Ref to the D3 container. */
    private ref: SVGSVGElement;

    /**
     * Constructs the VisualDiff.
     *
     * @param props props
     */
    constructor(props: VisualDiffProps) {
        super(props);
        this.state = {};
    }

    /**
     * Performs tasks after mounting the component.
     *
     * @param prevProps previous props
     */
    componentDidMount(): void {
        // define an arrowhead
        const defs = d3.select(this.ref).append('defs');

        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('refX', 7)
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z');

        defs.append('marker')
            .attr('id', 'arrowheadg')
            .attr('refX', 7)
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z')
            .attr('fill', 'rgb(1, 245, 1)');

        defs.append('marker')
            .attr('id', 'arrowheadr')
            .attr('refX', 7)
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z')
            .attr('fill', 'rgb(255, 43, 43)');
    }

    /**
     * Performs tasks after updating the component.
     *
     * @param prevProps previous props
     */
    componentDidUpdate(prevProps: VisualDiffProps): void {
        const svgWidth = this.props.width;
        const svgHeight = this.props.height;

        // TODO: consider moving this logic to a controller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context: any = d3.select(this.ref);
        if (prevProps.combinedGraph == null && this.props.combinedGraph != null) {
            const roots = this.props.combinedGraph.stratify();
            if (roots.length == 0) return; // null graph

            // add a dummy node to ensure there is only one rooted tree
            const rootedTree = new RootedTree(new GraphNode('dummy', {}), roots);
            const root = d3.hierarchy(rootedTree);
            const tree = d3.tree<RootedTree>().size([this.props.height, this.props.width]);
            const treeData = tree(root);

            // construct D3Node and D3Link
            const nodes = [];
            const nodeMap = {}; // for looking up a node from the id
            for (const node of treeData.descendants()) {
                // ignore the dummy node
                if (node.parent != null) {
                    const n = new D3Node(
                        node.data.data.id,
                        node.data.data.data['name'],
                        node.y, // swap x and y
                        node.x,
                        `fdv-${node.data.data.status}`,
                        node.data.data,
                    );
                    nodeMap[node.data.data.id] = n;
                    nodes.push(n);
                }
            }

            // center all nodes
            // TODO: create a utility function
            const minX = Math.min(...nodes.map((node: D3Node) => node.x));
            const maxX = Math.max(...nodes.map((node: D3Node) => node.x));
            const minY = Math.min(...nodes.map((node: D3Node) => node.y));
            const maxY = Math.max(...nodes.map((node: D3Node) => node.y));

            for (const node of nodes) {
                node.x -= minX - (this.props.width - (maxX - minX)) / 2;
                node.y -= minY - (this.props.height - (maxY - minY)) / 2;
            }

            const links = [];
            for (const c of this.props.combinedGraph.connections) {
                links.push(
                    new D3Link(
                        nodeMap[c.sourcePort],
                        nodeMap[c.targetPort],
                        `fdv-${c.status}-link`,
                    ),
                );
            }

            // set viewbox size for the SVG element
            context.attr('viewBox', `0 0 ${this.props.width} ${this.props.height}`);

            function dragstarted(d): void {
                // if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d): void {
                // immediately update the position
                d.x = d3.event.x;
                d.y = d3.event.y;
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                ticked();
            }

            function dragended(d): void {
                // if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            function clicked(node: D3Node, props: VisualDiffProps): void {
                console.log(node);
                props.callback(node.graphNode);
            }

            // define links
            const link = context
                .append('g')
                .classed('fdv-links', true)
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('class', d => d.className);

            // define nodes
            const node = context
                .append('g')
                .classed('fdv-nodes', true)
                .selectAll('g')
                .data(nodes)
                .enter()
                .append('g')
                .call(
                    d3
                        .drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended),
                )
                .on('click', (node: D3Node) => {
                    clicked(node, this.props);
                });

            node.append('rect')
                .attr('x', -75)
                .attr('y', -25)
                .attr('rx', 20)
                .attr('ry', 20)
                .attr('width', 150)
                .attr('height', 50)
                .attr('class', d => d.className);

            node.append('text')
                .text((d: D3Node) => d.name)
                .attr('x', -65)
                .attr('y', 3);
            node.append('title').text((d: D3Node) => d.name);

            /**
             * Defines tick actions.
             */
            function ticked(): void {
                node.attr('transform', (d: D3Node) => {
                    // constraint the nodes to be within a box
                    d.x = Math.max(10, Math.min(svgWidth - 10, d.x));
                    d.y = Math.max(10, Math.min(svgHeight - 10, d.y));

                    return `translate(${d.x},${d.y})`;
                });
                link.attr('x1', (d: D3Link) => d.source.x)
                    .attr('y1', (d: D3Link) => d.source.y)
                    .attr('x2', (d: D3Link) => d.target.x - 75)
                    .attr('y2', (d: D3Link) => d.target.y);
            }

            ticked();
        } else if (prevProps.combinedGraph != null && this.props.combinedGraph == null) {
            // reset nodes and links
            context.selectAll('.fdv-nodes').remove();
            context.selectAll('.fdv-links').remove();
        }
    }

    /**
     * Renders the VisualDiff component.
     */
    render(): React.ReactNode {
        return (
            <div className="fdv-visual-diff">
                <svg
                    className=""
                    ref={(ref: SVGSVGElement): SVGSVGElement => (this.ref = ref)}
                    width={this.props.width}
                    height={this.props.height}
                />
            </div>
        );
    }
}
