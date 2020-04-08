import React from 'react';

import '../main.css';
import './Changelog.css';
import { Graph } from '../graph/Graph';
import { Status } from '../graph/Status';

/**
 * Defines the props for the Changelog.
 */
interface ChangelogProps {
    /** needs the whole graph to look up node names */
    combinedGraph: Graph | null;

    /** propagate changes to DiffView */
    handleCloseChangelog: () => void;

    /** true if the modal panel is open */
    isShown: boolean;
}

/**
 * Defines the state for the Changelog.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ChangelogState {}

/**
 * Defines the component Changelog.
 */
export default class Changelog extends React.Component<ChangelogProps, ChangelogState> {
    private addedNodes: string[] = [];
    private removedNodes: string[] = [];
    private modifiedNodes: string[] = [];
    private addedConns: string[] = [];
    private removedConns: string[] = [];

    /**
     * Constructs the Changelog.
     *
     * @param props props
     */
    constructor(props: ChangelogProps) {
        super(props);
        this.handleCloseChangelog = this.handleCloseChangelog.bind(this);
        this.state = { isShown: false };
    }

    /**
     * Performs tasks after updating the component.
     *
     * @param prevProps previous props
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    componentDidUpdate(prevProps: ChangelogProps): void {
        if (prevProps.combinedGraph === this.props.combinedGraph) {
            // no change
            return;
        }

        this.addedNodes = [];
        this.removedNodes = [];
        this.modifiedNodes = [];
        this.addedConns = [];
        this.removedConns = [];
        if (this.props.combinedGraph != null) {
            // create a look-up table: node id => node name
            const dict = {};
            this.props.combinedGraph.nodes.forEach(node => {
                dict[node.id] = node.data['name'] || '(No name)';
            });

            // find updated nodes
            this.props.combinedGraph.nodes.forEach(node => {
                switch (node.status) {
                    case Status.Added:
                        this.addedNodes.push(dict[node.id]);
                        break;
                    case Status.Removed:
                        this.removedNodes.push(dict[node.id]);
                        break;
                    case Status.Modified:
                        this.modifiedNodes.push(dict[node.id]);
                        break;
                    default:
                        break;
                }
            });

            // find updated connections
            this.props.combinedGraph.connections.forEach(conn => {
                switch (conn.status) {
                    case Status.Added:
                        this.addedConns.push(dict[conn.sourcePort] + ' → ' + dict[conn.targetPort]);
                        break;
                    case Status.Removed:
                        this.removedConns.push(
                            dict[conn.sourcePort] + ' → ' + dict[conn.targetPort],
                        );
                        break;
                    default:
                        break;
                }
            });
        }
    }
    /**
     * Handles the modal close.
     */
    handleCloseChangelog(): void {
        this.props.handleCloseChangelog();
    }

    /**
     * Renders the Changelog component.
     */
    render(): React.ReactNode {
        // TODO: add "No change." if there is no change
        return (
            <div
                className={'fdv-modal' + (this.props.isShown ? ' fdv-display' : ' fdv-hidden')}
                onClick={(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
                    if ((ev.target as Element).classList.contains('fdv-modal')) {
                        this.handleCloseChangelog();
                    }
                }}
            >
                <div className="fdv-modal-content">
                    <div className="fdv-modal-header">
                        <span className="fdv-close" onClick={this.handleCloseChangelog}>
                            &times;
                        </span>
                        <h2 className="gh-header-title">Changelog</h2>
                    </div>
                    <div className="fdv-modal-body">
                        <div className="fdv-changelog-container">
                            <div className="fdv-changelog-column">
                                <h4>Nodes</h4>
                                <table>
                                    <tbody>
                                        {this.addedNodes.map((element, index) => (
                                            <tr key={index} className="fdv-changelog-added">
                                                <td>Added</td>
                                                <td>{element}</td>
                                            </tr>
                                        ))}
                                        {this.removedNodes.map((element, index) => (
                                            <tr key={index} className="fdv-changelog-removed">
                                                <td>Removed</td>
                                                <td>{element}</td>
                                            </tr>
                                        ))}
                                        {this.modifiedNodes.map((element, index) => (
                                            <tr key={index} className="fdv-changelog-modified">
                                                <td>Modified</td>
                                                <td>{element}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="fdv-changelog-column">
                                <h4>Connections</h4>
                                <table>
                                    <tbody>
                                        {this.addedConns.map((element, index) => (
                                            <tr key={index} className="fdv-changelog-added">
                                                <td>Added</td>
                                                <td>{element}</td>
                                            </tr>
                                        ))}
                                        {this.removedConns.map((element, index) => (
                                            <tr key={index} className="fdv-changelog-removed">
                                                <td>Removed</td>
                                                <td>{element}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
