const element = document.getElementById('diff-0');
const button = document.createElement('button');
button.innerText = 'test';
element
    .getElementsByClassName('file-header')[0]
    .getElementsByClassName('file-actions')[0]
    .prepend(button);
