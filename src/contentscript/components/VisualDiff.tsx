import React from 'react';
import * as d3 from 'd3';
import { Graph } from '../graph/Graph';

import './VisualDiff.css';

class D3Node implements d3.SimulationNodeDatum {
    public x: number;
    public y: number;
    constructor(public id: string, public name: string) {}
    // TODO: add color index
}

class D3Link implements d3.SimulationLinkDatum<D3Node> {
    constructor(public source: D3Node, public target: D3Node) {}
    // TODO: add color index
}

/**
 * Defines the props for the VisualDiff.
 */
interface VisualDiffProps {
    /** Combined graph that contains diff information. */
    combinedGraph: Graph | null;
    width: number;
    height: number;
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
        d3.select(this.ref)
            .append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('refX', 7)
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z');
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
            // construct D3Node and D3Link
            const nodes = [];
            const nodeMap = {}; // for looking up a node from the id
            for (const node of this.props.combinedGraph.nodes) {
                const n = new D3Node(node.id, node.data['name']);
                nodeMap[node.id] = n;
                nodes.push(n);
            }
            const links = [];
            for (const c of this.props.combinedGraph.connections) {
                links.push(new D3Link(nodeMap[c.sourcePort], nodeMap[c.targetPort]));
            }

            // start simulation
            // TODO: use a diffrent layout suitable for DAG
            const simulation: any = d3
                .forceSimulation()
                .force(
                    'link',
                    d3.forceLink().id((d: D3Node) => d.id),
                )
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(this.props.width / 2, this.props.height / 2));

            function dragstarted(d): void {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d): void {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d): void {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            // define links
            const link = context
                .append('g')
                .attr('class', 'fdv-links')
                .attr('marker-end', 'url(#arrowhead)')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('stroke', 'black')
                .attr('stroke-width', 2);

            // define nodes
            const node = context
                .append('g')
                .attr('class', 'fdv-nodes')
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
                );

            node.append('circle')
                .attr('r', 5)
                .attr('fill', (d: D3Node) => '#333333');

            node.append('text').text((d: D3Node) => d.name);
            node.append('title').text((d: D3Node) => d.name);

            /**
             * Defines tick actions.
             */
            function ticked(): void {
                node.attr('transform', (d: D3Node) => {
                    // constraint the nodes to be within a box
                    d.x = Math.max(10, Math.min(svgWidth - 10, d.x));
                    d.y = Math.max(10, Math.min(svgHeight - 10, d.y));

                    return 'translate(' + d.x + ',' + d.y + ')';
                });
                link.attr('x1', (d: D3Link) => d.source.x)
                    .attr('y1', (d: D3Link) => d.source.y)
                    .attr('x2', (d: D3Link) => d.target.x)
                    .attr('y2', (d: D3Link) => d.target.y);
            }

            simulation.nodes(nodes).on('tick', ticked);
            simulation.force('link').links(links);
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
