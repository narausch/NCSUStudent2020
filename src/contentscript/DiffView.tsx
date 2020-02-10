import * as React from 'react';

/**
 * Defines the props for the DiffView.
 */
interface DiffViewProps {
    // TBI
}

/**
 * Defines the props for the DiffView.
 */
interface DiffViewState {
    /** True if the flow diff has already been computed. */
    hasComputed: boolean;
}

class DiffView extends React.Component<DiffViewProps, DiffViewState> {
    constructor(props: DiffViewProps) {
        super(props);
        this.state = { hasComputed: false };
    }

    // TODO: create a constructor that takes file information
    render(): React.ReactNode {
        return (
            <div className="fdv-view fdv-hidden">
                <h3>Flow Diff</h3>
                <p>text text text</p>
            </div>
        );
    }
}

export default DiffView;
