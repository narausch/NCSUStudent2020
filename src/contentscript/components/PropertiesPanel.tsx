import * as React from 'react';
import { GraphNode } from '../graph/GraphNode';
import './PropertiesPanel.css';
import * as jsonDiff from 'jsondiffpatch';
import { Status } from '../graph/Status';

interface PropertiesPanelProps {
    node: GraphNode;
    callback: (node: GraphNode) => void;
}

interface PropertiesPanelState {
    currentNode: GraphNode;
    showUnmodified: boolean;
}

export default class PropertiesPanel extends React.Component<
    PropertiesPanelProps,
    PropertiesPanelState
> {
    constructor(props: PropertiesPanelProps) {
        super(props);
        this.closePanel = this.closePanel.bind(this);
        this.createJsonDiff = this.createJsonDiff.bind(this);
        this.handleShowButton = this.handleShowButton.bind(this);
        this.state = {
            currentNode: props.node,
            showUnmodified: true,
        };
    }

    /**
     * When the panel recieves a new node update current node
     * @param prevProps Props before update
     */
    componentDidUpdate(prevProps: PropertiesPanelProps): void {
        if (prevProps.node != this.props.node) {
            this.setState({ currentNode: this.props.node });
        }
    }

    /**
     * Creates the JSON diff element using the jsondiffpatch library
     * TODO: Currently this is kind of messy because jsondiffpatch returns
     * innerHtml, it might be able to improve this a bit
     */
    createJsonDiff(): any {
        if (this.state.currentNode != null && this.props.node != null) {
            let diffElement = null;
            let changes = null;
            if (this.props.node.status == Status.Removed) {
                changes = jsonDiff.diff(this.props.node.data, this.props.node.oldData);
                diffElement = jsonDiff.formatters.html.format(changes, this.props.node.data);
            } else {
                changes = jsonDiff.diff(this.props.node.oldData, this.props.node.data);
                diffElement = jsonDiff.formatters.html.format(changes, this.props.node.oldData);
            }
            if (this.props.node.status == Status.Unmodified) {
                const domElement = new DOMParser().parseFromString(diffElement, 'text/html');
                domElement.body.firstElementChild.className =
                    'jsondiffpatch-delta jsondiffpatch-unchanged';
                diffElement = domElement.documentElement.innerHTML;
            }
            return { __html: diffElement };
        }
        return { __html: '' };
    }

    /**
     * Handles closing the properties panel
     */
    closePanel(): void {
        this.setState({ showUnmodified: true });
        jsonDiff.formatters.html.showUnchanged(true);
        this.props.callback(null);
    }

    /**
     * Handles clicking the show unmodified fields button.
     */
    handleShowButton(): void {
        if (this.state.showUnmodified) {
            jsonDiff.formatters.html.hideUnchanged();
        } else {
            jsonDiff.formatters.html.showUnchanged(true);
        }
        this.setState({ showUnmodified: !this.state.showUnmodified });
    }

    /**
     * Renders the react component.
     */
    render(): React.ReactNode {
        return this.state.currentNode ? (
            <div className={'fdv-panel'}>
                <div className="fdv-panel-header">
                    <span className="fdv-close" onClick={this.closePanel}>
                        &times;
                    </span>
                    <div className="fdv-header-title">
                        {this.state.currentNode ? this.state.currentNode.data.name : ''}
                    </div>
                </div>
                <div className="fdv-diff-switcher">
                    <div>Display unmodified fields:</div>
                    <button onClick={this.handleShowButton}>
                        {this.state.showUnmodified ? 'Hide' : 'Show'} Fields
                    </button>
                </div>
                <div id="fdv-visual" dangerouslySetInnerHTML={this.createJsonDiff()}></div>
            </div>
        ) : null;
    }
}
