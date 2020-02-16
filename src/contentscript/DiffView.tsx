import * as React from 'react';
import FileInfo from './io/FileInfo';
import Downloader from './io/Downloader';
import { Graph } from './graph/Graph';
import ProgressBar from './ProgressBar';

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
            progressFailed: false,
            progress: 0,
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
        this.setStatusMessage = this.setStatusMessage.bind(this);
        this.handleUpdateProgress = this.handleUpdateProgress.bind(this);

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
        const bs = this.state.baseFileTotal ? this.state.baseFileTotal.toLocaleString() : '-';
        const cs = this.state.compareFileTotal ? this.state.compareFileTotal.toLocaleString() : '-';

        return (
            <div className="fdv-view">
                <h4>Flow Diff</h4>

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
     * Handles download progress for the file to compare.
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
                this.setStatusMessage(isBase, 'Parsing...');
                const g = content ? new Graph(content) : null;
                this.setStatusMessage(isBase, g ? 'OK' : 'None');
                this.setState({ progress: 0.9 }); // Parse complete => 90% progress
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
        this.setState({ progress: 0 }); // reset progress bar
        Promise.all([this.downloadAndParse(true), this.downloadAndParse(false)])
            .then(([graphBase, graphCompare]) => {
                // TODO: compare two graphs
                this.logDebugMessage('Comparing...');

                // TODO: set { progressShown: false } to hide the progress bar
                this.setState({ progress: 1 }); // Diff complete => 100% progress
            })
            .catch(err => {
                // TODO: handle errors
                this.setState({ progress: 1, progressFailed: true }); // update progress bar
                this.logDebugMessage('Failed to compare graphs.');
            });
    }
}

export default DiffView;
