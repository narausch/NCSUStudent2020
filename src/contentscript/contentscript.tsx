import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ExtensionHeader from './ExtensionHeader';
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
 * Finds the first element with the specific class name inside the given parent element.
 * If the element does not exist, append a new element to the parent element.
 *
 * @param parent parent element to check
 * @param className class name to find or create
 *
 * @return element with the specific class name
 */
function getOrCreateElementByClassName(parent: Element, className: string): Element {
    const elems = parent.getElementsByClassName(className);
    if (elems.length > 0) return elems[0];

    const newElem = document.createElement('div');
    newElem.setAttribute('class', className);
    parent.append(newElem);
    return newElem;
}

/**
 * Renders the extension header.
 */
function renderExtensionHeader(fileCount: number): void {
    const elem = document.getElementById('js-flash-container');
    if (!elem) return;

    ReactDOM.render(
        <ExtensionHeader fileCount={fileCount} />,
        getOrCreateElementByClassName(elem, 'fdv-header-container'),
    );
}

/**
 * Renders DiffButtons for JSON files.
 */
function renderDiffButtons(): void {
    const fileHeaders = document.getElementsByClassName('file-header');
    let cnt = 0;
    for (const fileHeader of fileHeaders) {
        if (fileHeader.getAttribute('data-file-type') === '.json') {
            ++cnt;
            ReactDOM.render(<DiffButton />, getOrCreateElementByClassName(fileHeader, 'fdv-diff-btn-container'));
        }
    }
    if (cnt > 0) renderExtensionHeader(cnt);
}

/**
 * Refreshes the DiffButtons.
 */
function refreshDiffButtons(): void {
    if (isTargetPage()) renderDiffButtons();
}

// TODO: listen to the URL changes
setInterval(refreshDiffButtons, 1000);
