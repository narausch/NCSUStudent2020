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
 * Defines the state for the ProgressBar.
 */
interface ProgressBarState {
    /** Timer ID */
    timerId: number | null;

    /** Currently displaying progress between 0 and 1, inclusive. */
    currentProgress: number;
}

/**
 * Defines the component ProgressBar.
 */
export default class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState> {
    // constant
    private ANIMATION_DELTA = 15; // milliseconds per one frame
    private ANIMATION_EASE_OUT_RATIO = 10; // used for animation timing
    private ANIMATION_EPSILON = 0.001; // 0.1%: close enough so stop the timer

    /**
     * Constructs the ProgressBar.
     *
     * @param props props
     */
    constructor(props: ProgressBarProps) {
        super(props);
        this.animateProgress = this.animateProgress.bind(this);
        this.state = { timerId: null, currentProgress: 0 };
    }

    /**
     * Performs animation of the progress bar.
     */
    animateProgress(): void {
        if (this.props.failed) {
            // failure: immediately update the progress
            if (this.state.timerId) window.clearInterval(this.state.timerId);
            this.setState({ currentProgress: this.props.progress, timerId: null });
        } else {
            if (this.state.currentProgress < this.props.progress - this.ANIMATION_EPSILON) {
                // slightly increase the width (ease out)
                const remain = this.props.progress - this.state.currentProgress;
                const diff = Math.max(0, remain / this.ANIMATION_EASE_OUT_RATIO);
                this.setState({ currentProgress: this.state.currentProgress + diff });
            } else if (this.state.currentProgress < this.props.progress) {
                // reached the final state
                if (this.state.timerId) window.clearInterval(this.state.timerId);
                this.setState({ currentProgress: this.props.progress, timerId: null });
            } else if (this.state.timerId) {
                window.clearInterval(this.state.timerId);
                this.setState({ timerId: null });
            }
        }
    }

    /**
     * Performs tasks after updating the component.
     *
     * @param prevProps previous props
     */
    componentDidUpdate(prevProps: ProgressBarProps): void {
        if (this.state.timerId) return; // timer is already running
        if (prevProps.progress != this.props.progress) {
            // set timer
            const timerId = window.setInterval(this.animateProgress, this.ANIMATION_DELTA);
            if (prevProps.progress > this.props.progress) {
                this.setState({ timerId: timerId, currentProgress: 0 }); // reset progress
            } else {
                this.setState({ timerId: timerId });
            }
        }
    }

    /**
     * Performs tasks before unmounting.
     */
    componentWillUnmount(): void {
        if (this.state.timerId) window.clearInterval(this.state.timerId);
    }

    /**
     * Renders the ProgressBar component.
     */
    render(): React.ReactNode {
        return (
            <div className="fdv-progress-bar fdv-progress-bar-container">
                <div
                    className={
                        'fdv-progress-bar fdv-progress-bar-inner' +
                        (this.props.failed ? ' fdv-progress-bar-failed' : '')
                    }
                    style={{ width: (this.state.currentProgress * 100).toFixed(2) + '%' }}
                ></div>
            </div>
        );
    }
}
