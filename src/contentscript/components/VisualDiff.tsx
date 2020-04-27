import React from 'react';
import * as d3 from 'd3';
import { Graph } from '../graph/Graph';

import './VisualDiff.css';
import RootedTree from '../graph/RootedTree';
import { GraphNode } from '../graph/GraphNode';
import Octicon, { getIconByName } from '@primer/octicons-react';

// Define the width and height of the view
const WIDTH = 180;
const HEIGHT = 100;

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
            const [treeDepth, treeLevelWidth] = rootedTree.getLayoutSize();
            const viewWidth = Math.max(this.props.width, (treeDepth - 1) * WIDTH);
            const viewHeight = Math.max(this.props.height, treeLevelWidth * HEIGHT);

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

            link.append('rect').style(
                'fill',
                'url(data:image/png;base64,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)',
            );

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
                .attr('class', d => d.className);

            node.append('foreignObject')
                .attr('x', -65)
                .attr('y', -10)
                .attr('height', 20)
                .attr('width', 130)
                .append('xhtml:body')
                .append('div')
                .classed('fdv-node-text', true)
                .text((d: D3Node) => d.name);
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
        const noNodes =
            this.props.combinedGraph && this.props.combinedGraph.getNodes().length > 0 ? (
                ''
            ) : (
                <div
                    className="fdv-visual-no-nodes"
                    style={{ width: this.props.width, height: this.props.height }}
                >
                    No nodes to display
                </div>
            );

        return (
            <div className="fdv-visual-diff">
                <svg
                    className="fdv-visual-svg"
                    ref={(ref: SVGSVGElement): SVGSVGElement => (this.ref = ref)}
                    width={this.props.width}
                    height={this.props.height}
                    viewBox={`0 0 ${this.state.viewWidth} ${this.state.viewHeight}`}
                />
                {noNodes}
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
