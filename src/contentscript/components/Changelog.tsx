import React from 'react';
import { GraphNode } from '../graph/GraphNode';
import { GraphConnection } from '../graph/GraphConnection';

import '../main.css';
import './Changelog.css';

/**
 * Defines the props for the Changelog.
 */
interface ChangelogProps {
    addedNodes: GraphNode[];
    removedNodes: GraphNode[];
    modifiedNodes: GraphNode[];
    addedConnections: GraphConnection[];
    removedConnections: GraphConnection[];
    handleCloseChangelog: () => void;
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

    handleCloseChangelog(): void {
        this.props.handleCloseChangelog();
    }

    /**
     * Renders the Changelog component.
     */
    render(): React.ReactNode {
        // TODO: consider the case when the node name is undefined.
        // TODO: (refactor) create private functions to create table elements.
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
                        <table>
                            <tbody>
                                {this.props.addedNodes.map(node => (
                                    <tr key={node.id} className="fdv-changelog-added">
                                        <td>Added</td>
                                        <td>Node</td>
                                        <td>{node.data['name']}</td>
                                    </tr>
                                ))}
                                {this.props.removedNodes.map(node => (
                                    <tr key={node.id} className="fdv-changelog-removed">
                                        <td>Removed</td>
                                        <td>Node</td>
                                        <td>{node.data['name']}</td>
                                    </tr>
                                ))}
                                {this.props.modifiedNodes.map(node => (
                                    <tr key={node.id}>
                                        <td>Modified</td>
                                        <td>Node</td>
                                        <td>{node.data['name']}</td>
                                    </tr>
                                ))}
                                {this.props.addedConnections.map(conn => (
                                    <tr
                                        key={conn.sourcePort + ',' + conn.targetPort}
                                        className="fdv-changelog-added"
                                    >
                                        <td>Added</td>
                                        <td>Connection</td>
                                        <td>{conn.sourcePort + ' → ' + conn.targetPort}</td>
                                    </tr>
                                ))}
                                {this.props.removedConnections.map(conn => (
                                    <tr
                                        key={conn.sourcePort + ',' + conn.targetPort}
                                        className="fdv-changelog-removed"
                                    >
                                        <td>Removed</td>
                                        <td>Connection</td>
                                        <td>{conn.sourcePort + ' → ' + conn.targetPort}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
