import * as React from 'react';
import './main.css';

/**
 * Defines the props for the ExtensionHeader.
 */
interface ExtensionHeaderProps {
    /** Number of target files. */
    fileCount: number;
}

/**
 * Defines the component ExtensionHeader.
 */
class ExtensionHeader extends React.Component<ExtensionHeaderProps, {}> {
    render(): React.ReactNode {
        return (
            <div className="fdv-header">
                <span>Flow Diff Viewer is working!</span>
                <span className="fdv-header-info">
                    Detected {this.props.fileCount} JSON file(s)
                </span>
            </div>
        );
    }
}

export default ExtensionHeader;
