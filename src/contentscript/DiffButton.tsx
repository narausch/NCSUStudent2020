import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DiffView from './DiffView';
import FileInfo from './io/FileInfo';

/**
 * Defines the props for the DiffButton.
 */
interface DiffButtonProps {
    /** Parent element. */
    parent: Element;

    /** Base file. */
    base: FileInfo;

    /** File to compare. */
    compare: FileInfo;
}

/**
 * Defines the state for the DiffButton.
 */
interface DiffButtonState {
    /** True if the diff view is shown. */
    isShown: boolean;
}

/**
 * Defines the component DiffButton.
 */
class DiffButton extends React.Component<DiffButtonProps, DiffButtonState> {
    /**
     * Constructs the DiffButton.
     *
     * @param props props
     */
    constructor(props: DiffButtonProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = { isShown: false };
    }

    /**
     * Renders the React component.
     */
    render(): React.ReactNode {
        return (
            <button className="btn" onClick={this.handleClick}>
                {this.state.isShown ? 'Hide' : 'Show'} Flow Diff
            </button>
        );
    }

    /**
     * Handles the click event.
     */
    handleClick(): void {
        const next = !this.state.isShown;
        this.setState({ isShown: next });

        // get the DiffView container
        const view = this.props.parent.querySelector('.fdv-view-container');

        if (next) {
            if (!view) {
                // create a DiffView
                const newElem = document.createElement('div');
                newElem.setAttribute('class', 'fdv-view-container');
                this.props.parent.append(newElem);
                ReactDOM.render(
                    <DiffView base={this.props.base} compare={this.props.compare} />,
                    newElem,
                );
            } else {
                // show the DiffView
                view.className = view.className.replace(' fdv-hidden', '');
            }

            // hide the text-diff
            this.props.parent.classList.remove('Details--on', 'open');
        } else {
            if (view) {
                // hide the DiffView
                view.className += ' fdv-hidden';
            }
        }
    }
}

export default DiffButton;
