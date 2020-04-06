import * as React from 'react';
import { GraphNode } from '../graph/GraphNode';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
    node: GraphNode;
}

interface PropertiesPanelState {
    currentNode: GraphNode;
}

export default class PropertiesPanel extends React.Component<
    PropertiesPanelProps,
    PropertiesPanelState
> {
    constructor(props: PropertiesPanelProps) {
        super(props);
        this.state = {
            currentNode: props.node,
        };
    }

    componentDidUpdate(prevProps: PropertiesPanelProps): void {
        if (prevProps.node != this.props.node) {
            this.setState({ currentNode: this.props.node });
        }
    }

    render(): React.ReactNode {
        return this.state.currentNode ? (
            <div className="fdv-panel">
                <div className="fdv-panel-name">{this.state.currentNode.data.name} </div>
                <div className="fdv-panel-name">{this.state.currentNode.data.name} </div>
            </div>
        ) : null;
    }
}
