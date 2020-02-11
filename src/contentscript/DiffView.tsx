import * as React from 'react';

/**
 * Defines the props for the DiffView.
 */
interface DiffViewProps {
    shaBase: string;
    shaCompare: string;
    path: string;
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
        this.logDebugMessage('Base SHA-1: ' + this.props.shaBase);
        this.logDebugMessage('Compare SHA-1: ' + this.props.shaCompare);
        this.logDebugMessage('Path: ' + this.props.path);
    }
}

export default DiffView;
