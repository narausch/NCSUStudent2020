import * as React from 'react';
import FileInfo from './io/FileInfo';
import Downloader from './io/Downloader';
import { Graph } from './graph/Graph';
import ProgressBar from './ProgressBar';
import Differencer from './differencer/Differencer';

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
    progressFailed: boolean;
    progress: number; // real number [0, 1]

    /** for refresh button */
    refreshEnabled: boolean;

    // for debugging
    baseStatus?: string;
    compareStatus?: string;
    baseFileLoaded?: number;
    baseFileTotal?: number;
    compareFileLoaded?: number;
    compareFileTotal?: number;
}

/**
 * Defines the component DiffView.
 */
class DiffView extends React.Component<DiffViewProps, DiffViewState> {
    /**
     * Constructs the DiffView.
     *
     * @param props props
     */
    constructor(props: DiffViewProps) {
        super(props);
        this.state = {
            progressFailed: false,
            progress: 0,
            refreshEnabled: false,
            debugMessages: [],
        };

        this.logDebugMessage = this.logDebugMessage.bind(this);
        this.computeDiff = this.computeDiff.bind(this);
        this.setStatusMessage = this.setStatusMessage.bind(this);
        this.handleUpdateProgress = this.handleUpdateProgress.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.computeDiff = this.computeDiff.bind(this);

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

                <div className="fdv-debug-msg">
                    <p>
                        Base [{bs} bytes]: {this.state.baseStatus}
                    </p>
                    <p>
                        Compare [{cs} bytes]: {this.state.compareStatus}
                    </p>
                </div>
                <div className="fdv-debug-msg">{listMessages}</div>
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
        this.setState({
            baseFileLoaded: bfl,
            baseFileTotal: bft,
            compareFileLoaded: cfl,
            compareFileTotal: cft,
            progress: ((bfl + cfl) * 0.9) / (bft + cft), // File download => 90% progress
        });
    }

    /**
     * Handles a refresh request for the diff view.
     */
    handleRefresh(): void {
        this.setState({
            progressFailed: false,
            progress: 0,
            refreshEnabled: false,
            baseStatus: 'Downloading...',
            compareStatus: 'Downloading...',
            baseFileLoaded: null,
            baseFileTotal: null,
            compareFileLoaded: null,
            compareFileTotal: null,
        }); // reset progress bar
        this.setState({ debugMessages: [] }); // reset debug messages

        setTimeout(this.computeDiff, 500); // prevent from repeated refresh requests
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

                this.setState({ progress: 0.92 }); // Parse complete => 92% progress
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

                const graphBaseNodeList: {
                    id: string;
                    info: string;
                }[] = [];
                const graphCompareNodeList: {
                    id: string;
                    info: string;
                }[] = [];
                graphBase.nodes.forEach(node => {
                    graphBaseNodeList.push({ id: node.id, info: JSON.stringify(node.data) });
                });
                graphCompare.nodes.forEach(node => {
                    graphCompareNodeList.push({ id: node.id, info: JSON.stringify(node.data) });
                });
                const differencer = new Differencer(graphBaseNodeList, graphCompareNodeList);

                // TODO: Consider outputting as a list of strings
                this.logDebugMessage('Added nodes:\n');
                differencer.getAddedNodes().forEach(node => {
                    this.logDebugMessage('--Added node id: ' + node.id);
                    this.logDebugMessage('--Added node info: ');
                    this.logDebugMessage(node.info);
                });
                this.logDebugMessage('Removed nodes:\n');
                differencer.getRemovedNodes().forEach(node => {
                    this.logDebugMessage('--Removed node id: ' + node.id);
                    this.logDebugMessage('--Removed node info: ');
                    this.logDebugMessage(node.info);
                });
                this.logDebugMessage('Changed nodes:\n');
                differencer.getChangedNodes().forEach(node => {
                    this.logDebugMessage('--Changed node id: ' + node.id);
                    this.logDebugMessage('--Changed node info: ');
                    this.logDebugMessage(node.info);
                });

                // TODO: set { progressShown: false } to hide the progress bar
                this.setState({ progress: 1 }); // Diff complete => 100% progress
            })
            .catch(err => {
                // TODO: handle errors
                console.log(err);
                this.setState({ progress: 1, progressFailed: true }); // update progress bar
                this.logDebugMessage('Failed to compare graphs.');
            });
    }
}

export default DiffView;
