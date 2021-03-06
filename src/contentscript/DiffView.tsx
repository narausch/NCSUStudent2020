import * as React from 'react';
import FileInfo from './io/FileInfo';
import Downloader from './io/Downloader';
import { Graph } from './graph/Graph';
import ProgressBar from './ProgressBar';
import Differencer from './differencer/Differencer';
import VisualDiff from './components/VisualDiff';
import { GraphNode } from './graph/GraphNode';
import PropertiesPanel from './components/PropertiesPanel';
import './DiffView.css';
import { GraphConnection } from './graph/GraphConnection';
import Changelog from './components/Changelog';
import Octicon, { getIconByName } from '@primer/octicons-react';

/**
 * Defines the props for the DiffView.
 */
interface DiffViewProps {
    base: FileInfo;
    compare: FileInfo;
}

/**
 * Defines the state for the DiffView.
 */
interface DiffViewState {
    /** for progress bar */
    progress: number; // real number [0, 1]
    progressFailed: boolean;

    /** for refresh button */
    refreshEnabled: boolean;

    /** for visual diff */
    combinedGraph: Graph | null;

    /** for changelog */
    isChangelogShown: boolean | null; // null: not ready
    addedNodes: GraphNode[];
    removedNodes: GraphNode[];
    modifiedNodes: GraphNode[];
    addedConnections: GraphConnection[];
    removedConnections: GraphConnection[];

    // for debugging
    baseStatus?: string;
    compareStatus?: string;
    baseFileLoaded?: number;
    baseFileTotal?: number;
    compareFileLoaded?: number;
    compareFileTotal?: number;

    // for properties panel
    currentNode: GraphNode;
}

/**
 * Defines the component DiffView.
 */
class DiffView extends React.Component<DiffViewProps, DiffViewState> {
    // constants
    private PROGRESS_START = 0.05; // just started
    private PROGRESS_DOWNLOAD = 0.9; // downloaded
    private PROGRESS_PARSE = 0.92; // parsed
    private PROGRESS_COMPLETE = 1; // computed difference

    /**
     * Constructs the DiffView.
     *
     * @param props props
     */
    constructor(props: DiffViewProps) {
        super(props);
        this.state = {
            progress: 0,
            progressFailed: false,
            refreshEnabled: false,
            combinedGraph: null,
            currentNode: null,
            isChangelogShown: null,
            addedNodes: [],
            removedNodes: [],
            modifiedNodes: [],
            addedConnections: [],
            removedConnections: [],
        };

        this.computeDiff = this.computeDiff.bind(this);
        this.setStatusMessage = this.setStatusMessage.bind(this);
        this.handleUpdateProgress = this.handleUpdateProgress.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.computeDiff = this.computeDiff.bind(this);
        this.visualCallback = this.visualCallback.bind(this);
        this.handleOpenChangelog = this.handleOpenChangelog.bind(this);
        this.handleCloseChangelog = this.handleCloseChangelog.bind(this);

        // schedule the main logic
        setTimeout(this.handleRefresh, 0);
    }

    /**
     * Renders the React component.
     */
    render(): React.ReactNode {
        const bs = this.state.baseFileTotal ? this.state.baseFileTotal.toLocaleString() : '-';
        const cs = this.state.compareFileTotal ? this.state.compareFileTotal.toLocaleString() : '-';

        // TODO: avoid magic numbers for VisualDiff
        return (
            <div className="fdv-view">
                <div className="fdv-view-header">
                    <h4>Flow Diff</h4>
                    <span className="fdv-push">
                        <button
                            className="btn-sm"
                            onClick={this.handleOpenChangelog}
                            disabled={this.state.isChangelogShown !== false}
                            style={{ marginRight: 20 }}
                        >
                            View Changelog
                        </button>
                        <button
                            className="btn-sm"
                            onClick={this.handleRefresh}
                            disabled={!this.state.refreshEnabled}
                            title="Refresh"
                        >
                            <Octicon
                                icon={getIconByName('sync')}
                                ariaLabel="Refresh"
                                size="small"
                                verticalAlign="middle"
                            />
                        </button>
                    </span>
                </div>

                <ProgressBar progress={this.state.progress} failed={this.state.progressFailed} />

                <PropertiesPanel node={this.state.currentNode} callback={this.visualCallback} />

                <VisualDiff
                    combinedGraph={this.state.combinedGraph}
                    width={938}
                    height={500}
                    callback={this.visualCallback}
                />

                <Changelog
                    isShown={this.state.isChangelogShown}
                    combinedGraph={this.state.combinedGraph}
                    handleCloseChangelog={this.handleCloseChangelog}
                />

                <div className="fdv-debug-msg">
                    <p>
                        {this.state.combinedGraph && this.state.combinedGraph.getNodeStatsString()}
                    </p>
                    <p>
                        {this.state.combinedGraph && this.state.combinedGraph.getConnStatsString()}
                    </p>
                    <p>
                        Base [{bs} bytes]: {this.state.baseStatus}
                    </p>
                    <p>
                        Compare [{cs} bytes]: {this.state.compareStatus}
                    </p>
                </div>
            </div>
        );
    }

    /**
     * Handles download progress for a file.
     *
     * @param baseFileLoaded base file loaded bytes
     * @param baseFileTotal base file total bytes
     * @param compareFileLoaded compare file loaded bytes
     * @param compareFileTotal compare file total bytes
     */
    handleUpdateProgress(
        baseFileLoaded: number | null,
        baseFileTotal: number | null,
        compareFileLoaded: number | null,
        compareFileTotal: number | null,
    ): void {
        if (this.state.progressFailed) return;

        const bfl = baseFileLoaded || this.state.baseFileLoaded;
        const bft = baseFileTotal || this.state.baseFileTotal;
        const cfl = compareFileLoaded || this.state.compareFileLoaded;
        const cft = compareFileTotal || this.state.compareFileTotal;
        const p = ((bfl + cfl) * (this.PROGRESS_DOWNLOAD - this.PROGRESS_START)) / (bft + cft);
        this.setState({
            baseFileLoaded: bfl,
            baseFileTotal: bft,
            compareFileLoaded: cfl,
            compareFileTotal: cft,
            progress: this.PROGRESS_START + p,
        });
    }

    /**
     * Handles a refresh request for the diff view.
     */
    handleRefresh(): void {
        this.setState({
            progress: this.PROGRESS_START,
            progressFailed: false,
            refreshEnabled: false,
            combinedGraph: null,
            baseStatus: 'Downloading...',
            compareStatus: 'Downloading...',
            baseFileLoaded: null,
            baseFileTotal: null,
            compareFileLoaded: null,
            compareFileTotal: null,
            isChangelogShown: null,
            addedNodes: [],
            removedNodes: [],
            modifiedNodes: [],
            addedConnections: [],
            removedConnections: [],
            currentNode: null,
        }); // reset progress bar
        setTimeout(this.computeDiff, 200); // prevent from repeated refresh requests
    }

    handleOpenChangelog(): void {
        this.setState({ isChangelogShown: true });
    }

    handleCloseChangelog(): void {
        this.setState({ isChangelogShown: false });
    }

    /**
     * Sets a status message.
     *
     * @param isBase true is the message is for the base file
     * @param message message
     */
    setStatusMessage(isBase: boolean, message: string): void {
        if (isBase) {
            this.setState({ baseStatus: message });
        } else {
            this.setState({ compareStatus: message });
        }
    }

    /**
     * Downloads and parses one file.
     *
     * @param isBase true if the target is the base file
     */
    downloadAndParse(isBase: boolean): Promise<Graph> {
        return new Downloader(isBase ? this.props.base : this.props.compare)
            .download(
                isBase
                    ? (loaded, total): void => this.handleUpdateProgress(loaded, total, null, null)
                    : (loaded, total): void => this.handleUpdateProgress(null, null, loaded, total),
            )
            .then(content => {
                // update file size info
                if (isBase) {
                    this.setState({ baseFileTotal: content && content.length });
                } else {
                    this.setState({ compareFileTotal: content && content.length });
                }
                this.setStatusMessage(isBase, 'Parsing...');
                const g = content ? new Graph(content) : null;
                this.setStatusMessage(isBase, g ? 'OK' : 'None');

                if (!this.state.progressFailed) {
                    this.setState({ progress: this.PROGRESS_PARSE }); // Parse complete
                }
                return g;
            })
            .catch(err => {
                this.setStatusMessage(isBase, `${err}`);
                throw err;
            });
    }

    /**
     * Computes the difference.
     */
    computeDiff(): void {
        this.setState({ refreshEnabled: true });
        Promise.all([this.downloadAndParse(true), this.downloadAndParse(false)])
            .then(([graphBase, graphCompare]) => {
                const differencer = new Differencer(graphBase, graphCompare);
                this.setState({
                    combinedGraph: differencer.getDifferencerGraph(),
                    isChangelogShown: false, // now the button is enabled
                });

                this.setState({ progress: this.PROGRESS_COMPLETE }); // update progress bar
            })
            .catch(err => {
                // TODO: handle errors
                console.log(err);
                this.setState({ progress: 1, progressFailed: true }); // update progress bar
            });
    }

    visualCallback(node: GraphNode): void {
        this.setState({ currentNode: node });
    }
}

export default DiffView;
