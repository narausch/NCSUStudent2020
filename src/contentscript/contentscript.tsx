import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './main.css';
import DiffButton from './DiffButton';

// Inject the extension header.
const extensionHeader = document.createElement('div');
document.body.prepend(extensionHeader);
ReactDOM.render(<div className="fdv-header">Flow Diff Viewer is working!</div>, extensionHeader);

// Inject buttons for JSON files.
// TODO: create a function for this logic
// TODO: listen to the changes on the page and refresh buttons
const fileHeaders = document.getElementsByClassName('file-header');
for (const elem of fileHeaders) {
    if (elem.getAttribute('data-file-type') == '.json') {
        const reactElem = document.createElement('div');
        elem.append(reactElem);
        ReactDOM.render(<DiffButton />, reactElem);
    }
}
