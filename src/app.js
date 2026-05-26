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

            // Fallback default arrow color if not specified by linkStyle
            lineColor: '#38bdf8',
            textColor: '#38bdf8',
            edgeLabelBackground: '#0f172a'
        }
    });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const mermaidRegex = /```mermaid([\s\S]*?)```/;
        const match = text.match(mermaidRegex);

        if (match && match[1]) {
            document.getElementById('mermaid-input').value = match[1].trim();
        } else {
            document.getElementById('mermaid-input').value = text.trim();
        }
        renderDiagram();
    };
    reader.readAsText(file);
}

function renderDiagram() {
    let input = document.getElementById('mermaid-input').value;
    const preview = document.getElementById('preview');

    if (!input.trim()) {
        preview.innerHTML = '';
        return;
    }

    if (typeof mermaid === 'undefined') {
        preview.innerHTML = '<div style="color: #38bdf8;">Loading environment...</div>';
        return;
    }

    if (!input.includes('\n')) {
        input = input.replace(/([\]\}\)])\s+([A-Za-z0-9])/g, '$1\n$2')
            .replace(/(flowchart\s+[A-Z]{2})\s+([A-Za-z0-9])/g, '$1\n$2');
    }

    try {
        const uniqueId = 'mermaid-' + Math.floor(Math.random() * 10000);

        mermaid.render(uniqueId, input, function (svgCode) {
            preview.innerHTML = svgCode;
        });

    } catch (error) {
        console.log("Typing layout adjustment...");
    }
}

function downloadImage() {
    const svgElement = document.querySelector('#preview svg');
    if (!svgElement) return alert("No valid diagram to save!");

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = function () {
        const canvas = document.getElementById('canvas-holder');
        canvas.width = svgElement.getBoundingClientRect().width * 2;
        canvas.height = svgElement.getBoundingClientRect().height * 2;

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
    };
    image.src = blobURL;
}

window.renderDiagram = renderDiagram;
window.downloadImage = downloadImage;
window.handleFileUpload = handleFileUpload;

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderDiagram, 300);
});
