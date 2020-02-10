import * as React from 'react';

/**
 * Defines the props for the DiffButton.
 */
interface DiffButtonProps {
    /** Parent element. */
    parent: Element;

    /** View element. */
    view: Element;
}

/**
 * Defines the props for the DiffButton.
 */
interface DiffButtonState {
    isShown: boolean;
}

/**
 * Defines the component DiffButton.
 */
class DiffButton extends React.Component<DiffButtonProps, DiffButtonState> {
    constructor(props: DiffButtonProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = { isShown: false };
    }

    // TODO: create a constructor that takes file information
    render(): React.ReactNode {
        return (
            <button className="btn" onClick={this.handleClick}>
                {this.state.isShown ? 'Hide' : 'Show'} Flow Diff
            </button>
        );
    }

    handleClick(): void {
        const next = !this.state.isShown;
        this.setState({ isShown: next });

        // hide or show the view element
        // TODO: Use React states properly
        if (next) {
            this.props.view.className = this.props.view.className.replace(' fdv-hidden', '');

            // hide the text-diff
            this.props.parent.classList.remove('Details--on', 'open');
        } else {
            this.props.view.className += ' fdv-hidden';
        }
    }
}

export default DiffButton;
