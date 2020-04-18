import React from 'react';
import * as d3 from 'd3';
import { Graph } from '../graph/Graph';

import './VisualDiff.css';
import RootedTree from '../graph/RootedTree';
import { GraphNode } from '../graph/GraphNode';
import Octicon, { getIconByName } from '@primer/octicons-react';

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
interface VisualDiffState {
    zoomScale: number;
    viewWidth: number;
    viewHeight: number;
    viewScales: number[]; // options for the scale
}

/**
 * Defines the component VisualDiff.
 */
export default class VisualDiff extends React.Component<VisualDiffProps, VisualDiffState> {
    DEFAULT_VIEW_SCALES = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0];
    EPSILON = 1e-8; // small number to resolve floating point errors

    /** Ref to the D3 container. */
    private ref: SVGSVGElement;

    /** Ref to the D3 zoom object. */
    private zoomObj: d3.ZoomBehavior<Element, unknown>;

    /**
     * Constructs the VisualDiff.
     *
     * @param props props
     */
    constructor(props: VisualDiffProps) {
        super(props);
        this.state = {
            zoomScale: 1,
            viewWidth: props.width,
            viewHeight: props.height,
            viewScales: this.DEFAULT_VIEW_SCALES,
        };
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
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
            .attr('fill', 'rgb(44, 190, 78)');

        defs.append('marker')
            .attr('id', 'arrowheadr')
            .attr('refX', 7)
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z')
            .attr('fill', 'rgb(203, 36, 49)');
    }

    /**
     * Performs tasks after updating the component.
     *
     * @param prevProps previous props
     */
    componentDidUpdate(prevProps: VisualDiffProps): void {
        // TODO: consider moving this logic to a controller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context: any = d3.select(this.ref);
        if (prevProps.combinedGraph == null && this.props.combinedGraph != null) {
            const roots = this.props.combinedGraph.stratify();
            if (roots.length == 0) return; // null graph

            // add a dummy node to ensure there is only one rooted tree
            const rootedTree = new RootedTree(new GraphNode('dummy', {}), roots);
            const root = d3.hierarchy(rootedTree);

            // compute the layout size
            // TODO: avoid magic numbers
            const [treeDepth, treeLevelWidth] = rootedTree.getLayoutSize();
            const viewWidth = Math.max(this.props.width, (treeDepth - 1) * 180);
            const viewHeight = Math.max(this.props.height, treeLevelWidth * 100);

            // fit to the SVG element's aspect ratio
            const viewWidthAdjusted = Math.max(
                viewWidth,
                Math.round((viewHeight * this.props.width) / this.props.height),
            );
            const viewHeightAdjusted = Math.max(
                viewHeight,
                Math.round((viewWidth * this.props.height) / this.props.width),
            );
            const tree = d3.tree<RootedTree>().size([viewHeightAdjusted, viewWidthAdjusted]);
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
                node.x -= minX - (viewWidthAdjusted - (maxX - minX)) / 2;
                node.y -= minY - (viewHeightAdjusted - (maxY - minY)) / 2;
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
                props.callback(node.graphNode);
            }

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const that = this;

            // Add panning/zoom behavior
            const mainGroup = context.append('g');

            const zoomObj = d3.zoom().on('zoom', function() {
                mainGroup.attr('transform', d3.event.transform);
                that.setState({ zoomScale: d3.event.transform['k'] });
            });
            context.call(zoomObj);
            this.zoomObj = zoomObj;

            // define links
            const link = mainGroup
                .append('g')
                .classed('fdv-links', true)
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('class', d => d.className);

            // define nodes
            const node = mainGroup
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
                //.style('stoke', 'black')
                //.style('stroke-dasharray', 20)
                .attr('class', d => d.className);

            node.append('text')
                .text((d: D3Node) => d.name)
                .attr('x', -65)
                .attr('y', 3);
            node.append('title').text((d: D3Node) => d.name);

            // Define visual cues
            node.append('rect')
                .attr('class', function(d) {
                    if (d.className == 'fdv-added') {
                        return 'fdv-cue-added';
                    } else if (d.className == 'fdv-removed') {
                        return 'fdv-cue-removed';
                    } else if (d.className == 'fdv-modified') {
                        return 'fdv-cue-modified';
                    } else {
                        return 'fdv-cue-unmodified';
                    }
                })
                .attr('x', -77)
                .attr('y', -27)
                .attr('height', 55)
                .attr('width', 155)
                .style('stroke-width', function(d) {
                    if (d.className == 'fdv-added') {
                        return 7;
                    } else if (d.className == 'fdv-removed') {
                        return 10;
                    } else if (d.className == 'fdv-modified') {
                        return 3;
                    } else {
                        return 'fdv-cue-unmodified';
                    }
                })
                .style('fill', 'none')
                .style('stroke-dasharray', function(d) {
                    if (d.className == 'fdv-added') {
                        return 10;
                    } else if (d.className == 'fdv-removed') {
                        return 5;
                    } else if (d.className == 'fdv-modified') {
                        return 5;
                    } else {
                        return 1; //unmodified case
                    }
                });
            /* Defines tick actions.
             */
            function ticked(): void {
                node.attr('transform', (d: D3Node) => {
                    return `translate(${d.x},${d.y})`;
                });
                link.attr('x1', (d: D3Link) => d.source.x)
                    .attr('y1', (d: D3Link) => d.source.y)
                    .attr('x2', (d: D3Link) => d.target.x - 75)
                    .attr('y2', (d: D3Link) => d.target.y);
            }

            // compute view scales
            const minScale = this.props.width / viewWidthAdjusted;
            const scales = this.DEFAULT_VIEW_SCALES.filter(x => x > minScale);
            scales.unshift(minScale);

            this.setState({
                viewWidth: viewWidthAdjusted,
                viewHeight: viewHeightAdjusted,
                viewScales: scales,
            });

            ticked();
        } else if (prevProps.combinedGraph != null && this.props.combinedGraph == null) {
            // reset nodes and links
            context.call(d3.zoom().transform, d3.zoomIdentity.scale(1));
            context.selectAll('g').remove();

            this.setState({
                viewWidth: this.props.width,
                viewHeight: this.props.height,
                viewScales: this.DEFAULT_VIEW_SCALES,
            });
        }
    }

    handleZoomIn(): void {
        const scale =
            (this.props.width / this.state.viewWidth) * this.state.zoomScale + this.EPSILON;
        let index = this.state.viewScales.length - 1;
        // Note: binary search may improve performance (same for handleZoomOut())
        while (index >= 0 && scale < this.state.viewScales[index]) {
            --index;
        }
        ++index;

        if (index < this.state.viewScales.length) {
            this.zoomObj.scaleTo(
                d3
                    .select(this.ref)
                    .transition()
                    .duration(250),
                (this.state.viewScales[index] * this.state.viewWidth) / this.props.width,
            );
        }
    }

    handleZoomOut(): void {
        const scale =
            (this.props.width / this.state.viewWidth) * this.state.zoomScale - this.EPSILON;
        let index = 0;
        while (index < this.state.viewScales.length && scale > this.state.viewScales[index]) {
            ++index;
        }
        --index;

        if (index < this.state.viewScales.length) {
            this.zoomObj.scaleTo(
                d3
                    .select(this.ref)
                    .transition()
                    .duration(250),
                (this.state.viewScales[index] * this.state.viewWidth) / this.props.width,
            );
        }
    }

    /**
     * Renders the VisualDiff component.
     */
    render(): React.ReactNode {
        const scale = (this.props.width / this.state.viewWidth) * this.state.zoomScale;
        const scalePercent = Math.round(scale * 100);

        return (
            <div className="fdv-visual-diff">
                <svg
                    className="fdv-visual-svg"
                    ref={(ref: SVGSVGElement): SVGSVGElement => (this.ref = ref)}
                    width={this.props.width}
                    height={this.props.height}
                    viewBox={`0 0 ${this.state.viewWidth} ${this.state.viewHeight}`}
                />
                <span className="fdv-visual-zoom-container">
                    <button
                        className="btn-sm fdv-visual-zoom-btn"
                        onClick={this.handleZoomOut}
                        disabled={scale - this.EPSILON <= this.state.viewScales[0]}
                        title="Zoom Out"
                    >
                        <Octicon
                            className="fdv-visual-zoom-search"
                            icon={getIconByName('search')}
                            ariaLabel="Zoom Out"
                            size="medium"
                            verticalAlign="middle"
                        />
                        <Octicon
                            className="fdv-visual-zoom-out"
                            icon={getIconByName('dash')}
                            ariaLabel="Zoom Out"
                            size="small"
                            verticalAlign="middle"
                        />
                    </button>
                    <span className="fdv-visual-zoom-label">
                        {scalePercent > 999 ? '999+' : scalePercent}%
                    </span>
                    <button
                        className="btn-sm fdv-visual-zoom-btn"
                        onClick={this.handleZoomIn}
                        disabled={
                            scale + this.EPSILON >=
                            this.state.viewScales[this.state.viewScales.length - 1]
                        }
                        title="Zoom In"
                    >
                        <Octicon
                            className="fdv-visual-zoom-search"
                            icon={getIconByName('search')}
                            ariaLabel="Zoom In"
                            size="medium"
                            verticalAlign="middle"
                        />
                        <Octicon
                            className="fdv-visual-zoom-in"
                            icon={getIconByName('plus')}
                            ariaLabel="Zoom In"
                            size="small"
                            verticalAlign="middle"
                        />
                    </button>
                </span>
            </div>
        );
    }
}
