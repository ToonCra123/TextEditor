const { ipcRenderer } = require('electron');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {

    let el = {
        docDisplayName: document.querySelector('.document-name'),
        createDocBtn: document.getElementById('createDocBtn'),
        openDocBtn: document.getElementById('openDocBtn'),
        fileTextArea: document.getElementById('fileTextArea')
    }

    const handleDocumentChange = (filePath, data = "") => {
        el.docDisplayName.innerHTML = path.parse(filePath).base;
        el.fileTextArea.removeAttribute('disabled');
        el.fileTextArea.value = data;
        el.fileTextArea.focus();
    }

    el.createDocBtn.addEventListener('click', () => {
        ipcRenderer.send("create-document-triggered");
    });

    el.openDocBtn.addEventListener('click', () => {
        ipcRenderer.send("open-document-triggered");
    });

    el.fileTextArea.addEventListener('input', (e) => {
        ipcRenderer.send("file-changed", e.target.value);
    });

    ipcRenderer.on("document-opened", (_, { filePath, data }) => {
        handleDocumentChange(filePath, data);
    });

    ipcRenderer.on("document-created", (_, filePath) => {
        handleDocumentChange(filePath);
    });
});