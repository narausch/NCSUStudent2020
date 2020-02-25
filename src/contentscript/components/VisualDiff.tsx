import React from 'react';

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { Graph } from '../graph/Graph';

import './VisualDiff.css';

/**
 * Defines the props for the VisualDiff.
 */
interface VisualDiffProps {
    /** Combined graph that contains diff information. */
    combinedGraph: Graph | null;
}

/**
 * Defines the state for the VisualDiff.
 */
interface VisualDiffState {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
}

/**
 * Defines the component VisualDiff.
 */
export default class VisualDiff extends React.Component<VisualDiffProps, VisualDiffState> {
    /** Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram(). */
    private diagramRef: React.RefObject<ReactDiagram>;

    /**
     * Constructs the VisualDiff.
     *
     * @param props props
     */
    constructor(props: VisualDiffProps) {
        super(props);
        this.diagramRef = React.createRef();
        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
        };
    }

    /**
     * Performs tasks after updating the component.
     *
     * @param prevProps previous props
     */
    componentDidUpdate(prevProps: VisualDiffProps): void {
        // TODO: consider moving this logic to a controller
        if (prevProps.combinedGraph == null && this.props.combinedGraph != null) {
            const nodes = [];
            for (const node of this.props.combinedGraph.nodes) {
                nodes.push({ key: node.id, text: node.data['name'] });
            }
            const links = [];
            for (const c of this.props.combinedGraph.connections) {
                links.push({ from: c.sourcePort, to: c.targetPort });
            }
            this.setState({ nodeDataArray: nodes, linkDataArray: links });
        } else if (prevProps.combinedGraph != null && this.props.combinedGraph == null) {
            // reset diagram
            this.diagramRef.current.getDiagram().clear();
            this.setState({ nodeDataArray: [], linkDataArray: [] });
        }
    }

    /**
     * Renders the VisualDiff component.
     */
    render(): React.ReactNode {
        return (
            <div>
                <ReactDiagram
                    ref={this.diagramRef}
                    divClassName="fdv-visual-diff"
                    initDiagram={this.initDiagram}
                    nodeDataArray={this.state.nodeDataArray}
                    linkDataArray={this.state.linkDataArray}
                    onModelChange={this.handleModelChange}
                    skipsDiagramUpdate={false}
                />
            </div>
        );
    }

    /**
     * Initializes the GoJS diagram.
     *
     * Partly taken from the official website.
     * @see https://gojs.net/latest/intro/react.html
     */
    private initDiagram(): go.Diagram {
        const $ = go.GraphObject.make;
        const diagram = $(go.Diagram, {
            isReadOnly: true,
            layout: $(go.LayeredDigraphLayout),
            initialContentAlignment: go.Spot.Center,
            allowZoom: true,
            allowSelect: true,
            autoScale: go.Diagram.Uniform,
            contentAlignment: go.Spot.Center,
        });

        // define a simple Node template
        diagram.nodeTemplate = $(
            go.Node,
            'Auto', // the Shape will go around the TextBlock
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(
                go.Shape,
                'RoundedRectangle',
                { name: 'SHAPE', fill: 'white', strokeWidth: 1 },
                // Shape.fill is bound to Node.data.color
                new go.Binding('fill', 'color'),
            ),
            $(
                go.TextBlock,
                { margin: 8, editable: true }, // some room around the text
                new go.Binding('text').makeTwoWay(),
            ),
        );
        // TODO: define tooltips

        diagram.linkTemplate = $(
            go.Link,
            { routing: go.Link.Normal, corner: 0 },
            $(go.Shape, { strokeWidth: 2, stroke: 'black' }), // the link shape
            $(go.Shape, { toArrow: 'Standard', stroke: null }), // arrow head
        );

        return diagram;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handleModelChange(changes: go.IncrementalData): void {
        // do nothing
    }
}
