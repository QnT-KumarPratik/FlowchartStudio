// Initialize Mermaid
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        themeVariables: {
            background: '#0f172a',
            mainBkg: '#1e293b',
            nodeBorder: '#334155',
            primaryColor: '#1e293b',
            nodeTextColor: '#e2e8f0',
            primaryTextColor: '#e2e8f0',
            lineColor: '#38bdf8',
            textColor: '#38bdf8',
            edgeLabelBackground: '#0f172a'
        }
    });
}

// 1. File Upload Processing
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const mermaidRegex = /```mermaid([\s\S]*?)```/;
        const match = text.match(mermaidRegex);

        const textarea = document.getElementById('mermaid-input');
        if (match && match[1]) {
            textarea.value = match[1].trim();
        } else {
            textarea.value = text.trim();
        }
        renderDiagram();
    };
    reader.readAsText(file);
}

// 2. High-Res PNG Export
function downloadImage() {
    const svgElement = document.querySelector('#preview svg');
    if (!svgElement) return alert("No valid diagram to save!");

    // Clone the SVG so we don't accidentally mutate the live preview element
    const clonedSvg = svgElement.cloneNode(true);
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = function () {
        const canvas = document.getElementById('canvas-holder');
        const rect = svgElement.getBoundingClientRect();
        
        // Ensure accurate scaling base
        canvas.width = (rect.width || 800) * 2;
        canvas.height = (rect.height || 600) * 2;

        const context = canvas.getContext('2d');
        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const pngURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'mermaid-flowchart.png';
        downloadLink.href = pngURL;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
}

// 3. Live Diagram Rendering Engine
async function renderDiagram() {
    const input = document.getElementById('mermaid-input').value;
    const preview = document.getElementById('preview');

    if (!input.trim()) {
        preview.innerHTML = '';
        return;
    }

    if (typeof mermaid === 'undefined') {
        preview.innerHTML = '<div style="color: #38bdf8;">Loading environment...</div>';
        return;
    }

    try {
        const uniqueId = 'mermaid-' + Math.floor(Math.random() * 10000);
        
        // Modern async/await rendering behavior for Mermaid v9+ 
        // This prevents syntax typos from freezing the DOM wrapper loop.
        const { svg } = await mermaid.render(uniqueId, input);
        preview.innerHTML = svg;
    } catch (error) {
        // While user is actively typing an incomplete block, gracefully keep old visual or log quietly
        console.log("Typing syntax adjustment...");
        
        // Clear out internal mermaid error elements left in DOM core
        const badElement = document.getElementById(uniqueId);
        if (badElement) badElement.remove();
    }
}

// 4. Safe Event Binding (Goodbye, inline HTML errors!)
window.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners explicitly to UI DOM elements
    document.getElementById('mermaid-input').addEventListener('input', renderDiagram);
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);
    
    const actionButtons = document.querySelectorAll('.actions button');
    if (actionButtons.length > 0) {
        // The Save PNG button is the last button in actions panel
        actionButtons[actionButtons.length - 1].addEventListener('click', downloadImage);
    }

    // Initial load layout render
    setTimeout(renderDiagram, 300);
});
