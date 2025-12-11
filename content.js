// Content script for URS Chrome Extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        // Get the full page content
        const pageContent = {
            title: document.title,
            url: window.location.href,
            text: document.body.innerText,
            html: document.documentElement.outerHTML,
            selection: window.getSelection().toString()
        };
        sendResponse(pageContent);
    }
    
    if (request.action === 'highlightText') {
        // Highlight specific text on the page
        highlightText(request.text);
        sendResponse({ success: true });
    }
    
    if (request.action === 'extractLinks') {
        // Extract all links from the page
        const links = Array.from(document.querySelectorAll('a')).map(link => ({
            text: link.innerText,
            href: link.href
        }));
        sendResponse({ links });
    }
    
    if (request.action === 'extractImages') {
        // Extract all images from the page
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            title: img.title
        }));
        sendResponse({ images });
    }
    
    if (request.action === 'extractMetadata') {
        // Extract page metadata
        const metadata = {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content,
            author: document.querySelector('meta[name="author"]')?.content,
            ogTitle: document.querySelector('meta[property="og:title"]')?.content,
            ogDescription: document.querySelector('meta[property="og:description"]')?.content,
            ogImage: document.querySelector('meta[property="og:image"]')?.content
        };
        sendResponse({ metadata });
    }
});

// Function to highlight text on the page
function highlightText(text) {
    if (!text) return;
    
    // Remove previous highlights
    removeHighlights();
    
    // Create a tree walker to find text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.nodeValue.includes(text)) {
            textNodes.push(node);
        }
    }
    
    // Highlight found text
    textNodes.forEach(node => {
        const span = document.createElement('span');
        span.className = 'urs-highlight';
        span.style.cssText = 'background-color: yellow; color: black; font-weight: bold;';
        
        const parent = node.parentNode;
        const textContent = node.nodeValue;
        const index = textContent.indexOf(text);
        
        if (index !== -1) {
            const before = document.createTextNode(textContent.substring(0, index));
            const highlighted = document.createTextNode(text);
            const after = document.createTextNode(textContent.substring(index + text.length));
            
            span.appendChild(highlighted);
            
            parent.insertBefore(before, node);
            parent.insertBefore(span, node);
            parent.insertBefore(after, node);
            parent.removeChild(node);
        }
    });
}

// Function to remove highlights
function removeHighlights() {
    const highlights = document.querySelectorAll('.urs-highlight');
    highlights.forEach(highlight => {
        const text = highlight.innerText;
        const textNode = document.createTextNode(text);
        highlight.parentNode.replaceChild(textNode, highlight);
    });
}

// Inject floating widget (optional, for sticky mode)
function injectFloatingWidget() {
    // Check if widget already exists
    if (document.getElementById('urs-floating-widget')) return;
    
    const widget = document.createElement('div');
    widget.id = 'urs-floating-widget';
    widget.innerHTML = `
        <div class="urs-widget-header">
            <span>URS</span>
            <button class="urs-widget-close">×</button>
        </div>
        <div class="urs-widget-content">
            <button class="urs-action-btn" data-action="search">Search</button>
            <button class="urs-action-btn" data-action="summarize">Summarize</button>
            <button class="urs-action-btn" data-action="extract">Extract</button>
        </div>
    `;
    
    document.body.appendChild(widget);
    
    // Add event listeners
    widget.querySelector('.urs-widget-close').addEventListener('click', () => {
        widget.remove();
    });
    
    widget.querySelectorAll('.urs-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            chrome.runtime.sendMessage({ 
                action: 'performAction',
                type: action,
                text: window.getSelection().toString()
            });
        });
    });
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+U to open URS popup
    if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }
    
    // Ctrl+Shift+S to search selected text
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            chrome.runtime.sendMessage({ 
                action: 'performSearch',
                text: selectedText
            });
        }
    }
});

// Initialize content script
console.log('URS Content Script loaded');
