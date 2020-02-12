import * as React from 'react';
import FileInfo from './io/FileInfo';
import Downloader from './io/Downloader';

/**
 * Defines the props for the DiffView.
 */
interface DiffViewProps {
    base: FileInfo;
    compare: FileInfo;
}

/**
 * Defines the props for the DiffView.
 */
interface DiffViewState {
    /** Debug information. */
    debugMessages: string[];
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
            debugMessages: ['Initializing...'],
        };

        this.logDebugMessage = this.logDebugMessage.bind(this);
        this.computeDiff = this.computeDiff.bind(this);

        // schedule the main logic
        setTimeout(this.computeDiff, 500);
    }

    /**
     * Renders the React component.
     */
    render(): React.ReactNode {
        const listMessages = this.state.debugMessages.map((line, index) => (
            <p key={index}>{line}</p>
        ));
        return (
            <div className="fdv-view">
                <h3>Flow Diff</h3>
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
     * Computes the difference.
     */
    computeDiff(): void {
        this.logDebugMessage('Downloading files...');

        // download and parse the base file
        new Downloader(this.props.base)
            .download()
            .then(content => {
                if (content) {
                    this.logDebugMessage('Base (first 1000 chars): ' + content.slice(0, 1000));
                }
            })
            .catch(err => {
                this.logDebugMessage(`Base File Download Error: ${err}`);
            });

        // download and parse the file to compare
        new Downloader(this.props.compare)
            .download()
            .then(content => {
                if (content) {
                    this.logDebugMessage('Compare (first 1000 chars): ' + content.slice(0, 1000));
                }
            })
            .catch(err => {
                this.logDebugMessage(`Compare File Download Error: ${err}`);
            });
    }
}

export default DiffView;
