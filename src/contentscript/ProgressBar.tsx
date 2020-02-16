import * as React from 'react';
import './main.css';

/**
 * Defines the props for the ProgressBar.
 */
interface ProgressBarProps {
    /** Progress between 0 and 1, inclusive. */
    progress: number;

    /** True if the progress bar indicates failure. */
    failed: boolean;
}

/**
 * Defines the component ProgressBar.
 */
export default class ProgressBar extends React.Component<ProgressBarProps, {}> {
    render(): React.ReactNode {
        return (
            <div className="fdv-progress-bar fdv-progress-bar-container">
                <div
                    className={
                        'fdv-progress-bar fdv-progress-bar-inner' +
                        (this.props.failed ? ' fdv-progress-bar-failed' : '')
                    }
                    style={{ width: (this.props.progress * 100).toFixed(2) + '%' }}
                ></div>
            </div>
        );
    }
}
