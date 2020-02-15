import * as React from 'react';
import FileInfo from './io/FileInfo';
import Downloader from './io/Downloader';
import { Graph } from './graph/Graph';
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

    // for debugging
    baseStatus: string;
    compareStatus: string;
    baseFileLoaded: number;
    baseFileTotal: number;
    compareFileLoaded: number;
    compareFileTotal: number;
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
            debugMessages: [],
            baseStatus: 'Downloading...',
            compareStatus: 'Downloading...',
            baseFileLoaded: null,
            baseFileTotal: null,
            compareFileLoaded: null,
            compareFileTotal: null,
        };

        this.logDebugMessage = this.logDebugMessage.bind(this);
        this.computeDiff = this.computeDiff.bind(this);
        this.handleBaseUpdateProgress = this.handleBaseUpdateProgress.bind(this);
        this.handleCompareUpdateProgress = this.handleCompareUpdateProgress.bind(this);
        this.setStatusMessage = this.setStatusMessage.bind(this);

        // schedule the main logic
        setTimeout(this.computeDiff, 0);
    }

    /**
     * Renders the React component.
     */
    render(): React.ReactNode {
        const listMessages = this.state.debugMessages.map((line, index) => (
            <p key={index}>{line}</p>
        ));

        // TODO: replace with ProgressBar
        return (
            <div className="fdv-view">
                <h3>Flow Diff</h3>

                <div className="fdv-debug-msg">
                    <p>
                        Base [{this.state.baseFileLoaded || 0}/{this.state.baseFileTotal || 0}{' '}
                        bytes]: {this.state.baseStatus}
                    </p>
                    <p>
                        Compare [{this.state.compareFileLoaded || 0}/
                        {this.state.compareFileTotal || 0} bytes]: {this.state.compareStatus}
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
     * Handles download progress for the base file.
     *
     * @param loaded loaded bytes
     * @param total total bytes
     */
    handleBaseUpdateProgress(loaded: number, total: number): void {
        this.setState({ baseFileLoaded: loaded, baseFileTotal: total });
    }

    /**
     * Handles download progress for the file to compare.
     *
     * @param loaded loaded bytes
     * @param total total bytes
     */
    handleCompareUpdateProgress(loaded: number, total: number): void {
        this.setState({ compareFileLoaded: loaded, compareFileTotal: total });
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
            .download(isBase ? this.handleBaseUpdateProgress : this.handleCompareUpdateProgress)
            .then(content => {
                this.setStatusMessage(isBase, 'Parsing...');
                const g = content ? new Graph(content) : null;
                this.setStatusMessage(isBase, g ? 'OK' : 'None');
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
        // TODO: refactor common code
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
                    this.logDebugMessage('Changed node id: ' + node.id);
                    this.logDebugMessage('Changed node info: ');
                    this.logDebugMessage(node.info);
                });
            })
            .catch(err => {
                // TODO: handle errors
                console.log(err);
                this.logDebugMessage('Failed to compare graphs.');
            });
    }
}

export default DiffView;
