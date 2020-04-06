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
    /** Debug information. */
    debugMessages: string[];

    /** for progress bar */
    progress: number; // real number [0, 1]
    progressFailed: boolean;

    /** for refresh button */
    refreshEnabled: boolean;

    /** for visual diff */
    combinedGraph: Graph | null;

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
            debugMessages: [],
            currentNode: null,
        };

        this.logDebugMessage = this.logDebugMessage.bind(this);
        this.computeDiff = this.computeDiff.bind(this);
        this.setStatusMessage = this.setStatusMessage.bind(this);
        this.handleUpdateProgress = this.handleUpdateProgress.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.computeDiff = this.computeDiff.bind(this);
        this.visualCallback = this.visualCallback.bind(this);

        // schedule the main logic
        setTimeout(this.handleRefresh, 0);
    }

    /**
     * Renders the React component.
     */
    render(): React.ReactNode {
        const listMessages = this.state.debugMessages.map((line, index) => (
            <p key={index}>{line}</p>
        ));
        const bs = this.state.baseFileTotal ? this.state.baseFileTotal.toLocaleString() : '-';
        const cs = this.state.compareFileTotal ? this.state.compareFileTotal.toLocaleString() : '-';

        // TODO: use icon for the Refresh button
        // TODO: avoid magic numbers for VisualDiff
        return (
            <div className="fdv-view">
                <div className="fdv-view-header">
                    <h4>Flow Diff</h4>
                    <span className="fdv-push">
                        <button
                            className="btn-sm"
                            onClick={this.handleRefresh}
                            disabled={!this.state.refreshEnabled}
                        >
                            Refresh
                        </button>{' '}
                    </span>
                </div>

                <ProgressBar progress={this.state.progress} failed={this.state.progressFailed} />

                <PropertiesPanel node={this.state.currentNode} />

                <VisualDiff
                    combinedGraph={this.state.combinedGraph}
                    width={938}
                    height={300}
                    callback={this.visualCallback}
                />
            </div>
        );
    }

    /**
     * Logs a debug message.
     *
     * @param message message
     */
    logDebugMessage(message: string): void {
        const arr = this.state.debugMessages;
        arr.push(message);
        this.setState({ debugMessages: arr });
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
        }); // reset progress bar
        this.setState({ debugMessages: [] }); // reset debug messages

        setTimeout(this.computeDiff, 200); // prevent from repeated refresh requests
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

                this.setState({ progress: this.PROGRESS_PARSE }); // Parse complete
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
                this.logDebugMessage('Comparing...');

                const differencer = new Differencer(graphBase, graphCompare);

                this.logDebugMessage('Added nodes:\n');
                differencer.getAddedNodes().forEach(node => {
                    this.logDebugMessage(`--Added node id: ${node.id} (${node.data['name']})`);
                    this.logDebugMessage('--Added node info: ');
                    this.logDebugMessage(JSON.stringify(node.data));
                });
                this.logDebugMessage('Removed nodes:\n');
                differencer.getRemovedNodes().forEach(node => {
                    this.logDebugMessage(`--Removed node id: ${node.id} (${node.data['name']})`);
                    this.logDebugMessage('--Removed node info: ');
                    this.logDebugMessage(JSON.stringify(node.data));
                });
                this.logDebugMessage('Modified nodes:\n');
                differencer.getModifiedNodes().forEach(node => {
                    this.logDebugMessage(`--Modified node id: ${node.id} (${node.data['name']})`);
                    this.logDebugMessage('--Modified node info: ');
                    this.logDebugMessage(JSON.stringify(node.data));
                });

                this.setState({ combinedGraph: differencer.getDifferencerGraph() });
                this.setState({ progress: this.PROGRESS_COMPLETE }); // update progress bar
            })
            .catch(err => {
                // TODO: handle errors
                console.log(err);
                this.setState({ progress: 1, progressFailed: true }); // update progress bar
                this.logDebugMessage('Failed to compare graphs.');
            });
    }

    visualCallback(node: GraphNode): void {
        this.setState({ currentNode: node });
    }
}

export default DiffView;
