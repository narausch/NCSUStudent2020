import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ExtensionHeader from './ExtensionHeader';
import DiffButton from './DiffButton';

/**
 * Checks if the given URL is a target page.
 *
 * @param url URL to check
 * @return true if the current URL is a target.
 */
function isTargetPage(url: string): boolean {
    const regexp = /^https:[/][/][^\/]+[/][^/]+[/][^/]+[/]compare[/]?.*$/;
    return regexp.test(url);
}

/**
 * Extracts SHA information from a permanent-link URL.
 *
 * @param url Permanent-link URL
 * @return pair of the SHA-1 for the base commit and the SHA-1 for the commit to compare
 */
function extractSHAFromUrl(url: string): [string, string] {
    const result = /\/[^:./]+:([^:./]+)[.][.][.][^:./]+:([^:./]+)$/.exec(url);
    return result && result.length == 3 ? [result[1], result[2]] : null;
}

/**
 * Finds the first element with the specific class name inside the given parent element.
 * If the element does not exist, appends a new element to the parent element.
 *
 * @param parent parent element to check
 * @param className class name to find or create
 *
 * @return element with the specific class name
 */
function getOrCreateElementWithClassName(parent: Element, className: string): Element {
    const elem = parent.querySelector('.' + className);
    if (elem) return elem;

    const newElem = document.createElement('div');
    newElem.setAttribute('class', className);
    parent.append(newElem);
    return newElem;
}

/**
 * Renders the extension header.
 *
 * @param fileCount number of target files
 */
function renderExtensionHeader(fileCount: number): void {
    const elem = document.getElementById('js-flash-container');
    if (!elem) return;

    ReactDOM.render(
        <ExtensionHeader fileCount={fileCount} />,
        getOrCreateElementWithClassName(elem, 'fdv-header-container'),
    );
}

/**
 * Renders DiffButtons for JSON files.
 */
function renderDiffButtons(): void {
    // extract SHA-1 information
    const permLink = document.querySelector<HTMLAnchorElement>('.js-permalink-shortcut');
    if (!permLink) return; // unexpected HTML

    const sha = extractSHAFromUrl(permLink.href);
    if (!sha) return; // unexpected HTML

    const fileHeaders = document.getElementsByClassName('file-header');
    let cnt = 0;
    for (const fileHeader of fileHeaders) {
        // check the file type
        if (fileHeader.getAttribute('data-file-type') === '.json') {
            const path = fileHeader.getAttribute('data-path');
            if (!path) continue; // unexpected HTML

            // render the button
            ReactDOM.render(
                <DiffButton parent={fileHeader.parentElement} shaBase={sha[0]} shaCompare={sha[1]} path={path} />,
                getOrCreateElementWithClassName(fileHeader, 'fdv-diff-btn-container'),
            );

            ++cnt;
        }
    }
    if (cnt > 0) renderExtensionHeader(cnt);
}

/**
 * Refreshes the DiffButtons if the current URL has changed.
 */
function refreshDiffButtons(): void {
    if (isTargetPage(window.location.href)) renderDiffButtons();
}

// TODO: listen to the URL changes
setInterval(refreshDiffButtons, 1000);
