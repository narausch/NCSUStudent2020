import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './main.css';
import DiffButton from './DiffButton';

/**
 * Checks if the current URL is a target page.
 *
 * @return true if the current URL is a target.
 */
function isTargetPage(): boolean {
    const url = window.location.href;
    const regexp = /^https:[/][/][^\/]+[/][^/]+[/][^/]+[/]compare[/]?.*$/;
    return regexp.test(url);
}

/**
 * Injects the extension header.
 */
function injectExtensionHeader(): void {
    const elem = document.createElement('div');
    const parent = document.getElementById('js-flash-container');
    if (parent) {
        parent.append(elem);
        ReactDOM.render(<div className="fdv-header">Flow Diff Viewer is working!</div>, elem);
    }
}

/**
 * Injects buttons for JSON files.
 */
function injectDiffButtons(): void {
    // TODO: listen to the changes on the page and refresh buttons
    const fileHeaders = document.getElementsByClassName('file-header');
    for (const fileHeader of fileHeaders) {
        if (fileHeader.getAttribute('data-file-type') === '.json') {
            const elem = document.createElement('div');
            fileHeader.append(elem);
            ReactDOM.render(<DiffButton />, elem);
        }
    }
}

/**
 * Main logic
 */
function main(): void {
    if (isTargetPage()) {
        injectExtensionHeader();
        injectDiffButtons();
    }
}

main();
