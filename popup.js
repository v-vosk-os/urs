// Popup JavaScript for URS Chrome Extension

let isSticky = false;
let selectedTool = null;
let selectedSkill = null;
let selectedMCPTool = null;
let apiEndpoint = 'http://localhost:8000';
let mcpEndpoint = 'http://localhost:8001';
let uploadedFile = null;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.txt', '.docx', '.pdf', '.md', '.pptx', '.csv', '.xlsx'];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    // Load saved settings
    loadSettings();
    
    // Check API status
    await checkApiStatus();
    
    // Load last results if any
    loadLastResults();
    
    // Load MCP tools
    await loadMCPTools();
    
    // Setup event listeners
    setupEventListeners();
    
    // Apply saved window size if resizable
    applySavedWindowSize();
});

// Setup all event listeners
function setupEventListeners() {
    // Sticky button
    document.getElementById('sticky-btn').addEventListener('click', toggleSticky);
    
    // Resize button
    document.getElementById('resize-btn').addEventListener('click', toggleResize);
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectTool(e.target));
    });
    
    // Skill buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectSkill(e.target));
    });
    
    // MCP Tools buttons (will be added dynamically)
    document.querySelectorAll('.mcp-tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectMCPTool(e.target));
    });
    
    // Execute button
    document.getElementById('execute-btn').addEventListener('click', executeAction);
    
    // Clear results
    document.getElementById('clear-results').addEventListener('click', clearResults);
    
    // Settings panel
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('cancel-settings').addEventListener('click', hideSettings);
    
    // Window size sliders
    document.getElementById('window-width').addEventListener('input', updateWidthDisplay);
    document.getElementById('window-height').addEventListener('input', updateHeightDisplay);
    
    // File upload event listeners
    setupFileUploadListeners();
}

// Toggle sticky mode
function toggleSticky() {
    isSticky = !isSticky;
    const btn = document.getElementById('sticky-btn');
    
    if (isSticky) {
        btn.classList.add('active');
        // Keep popup open
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
            focused: true,
            state: 'normal'
        });
    } else {
        btn.classList.remove('active');
    }
    
    // Save sticky preference
    chrome.storage.local.set({ stickyMode: isSticky });
}

// Toggle resize mode
function toggleResize() {
    const width = parseInt(document.getElementById('window-width').value);
    const height = parseInt(document.getElementById('window-height').value);
    
    // Update popup size
    document.body.style.width = width + 'px';
    document.body.style.minHeight = height + 'px';
    
    // Save preferences
    chrome.storage.local.set({ 
        popupWidth: width,
        popupHeight: height
    });
}

// Show settings panel
function showSettings() {
    document.getElementById('settings-panel').classList.remove('hidden');
}

// Hide settings panel
function hideSettings() {
    document.getElementById('settings-panel').classList.add('hidden');
}

// Save settings
function saveSettings() {
    apiEndpoint = document.getElementById('api-endpoint').value;
    mcpEndpoint = document.getElementById('mcp-endpoint').value;
    
    chrome.storage.local.set({
        apiEndpoint: apiEndpoint,
        mcpEndpoint: mcpEndpoint
    }, () => {
        hideSettings();
        checkApiStatus();
    });
}

// Load settings
async function loadSettings() {
    const settings = await chrome.storage.local.get([
        'stickyMode', 
        'apiEndpoint', 
        'mcpEndpoint',
        'popupWidth',
        'popupHeight'
    ]);
    
    if (settings.stickyMode) {
        isSticky = settings.stickyMode;
        if (isSticky) {
            document.getElementById('sticky-btn').classList.add('active');
        }
    }
    
    if (settings.apiEndpoint) {
        apiEndpoint = settings.apiEndpoint;
        document.getElementById('api-endpoint').value = apiEndpoint;
    }
    
    if (settings.mcpEndpoint) {
        mcpEndpoint = settings.mcpEndpoint;
        document.getElementById('mcp-endpoint').value = mcpEndpoint;
    }
    
    if (settings.popupWidth) {
        document.getElementById('window-width').value = settings.popupWidth;
        document.getElementById('width-value').textContent = settings.popupWidth + 'px';
    }
    
    if (settings.popupHeight) {
        document.getElementById('window-height').value = settings.popupHeight;
        document.getElementById('height-value').textContent = settings.popupHeight + 'px';
    }
}

// Apply saved window size
function applySavedWindowSize() {
    chrome.storage.local.get(['popupWidth', 'popupHeight'], (settings) => {
        if (settings.popupWidth) {
            document.body.style.width = settings.popupWidth + 'px';
        }
        if (settings.popupHeight) {
            document.body.style.minHeight = settings.popupHeight + 'px';
        }
    });
}

// Update width display
function updateWidthDisplay(e) {
    document.getElementById('width-value').textContent = e.target.value + 'px';
}

// Update height display
function updateHeightDisplay(e) {
    document.getElementById('height-value').textContent = e.target.value + 'px';
}

// Select tool
function selectTool(btn) {
    // Clear previous selection
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mcp-tool-btn').forEach(b => b.classList.remove('active'));
    
    // Set new selection
    btn.classList.add('active');
    selectedTool = btn.dataset.tool;
    selectedSkill = null;
    selectedMCPTool = null;
}

// Select skill
function selectSkill(btn) {
    // Clear previous selection
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mcp-tool-btn').forEach(b => b.classList.remove('active'));
    
    // Set new selection
    btn.classList.add('active');
    selectedSkill = btn.dataset.skill;
    selectedTool = null;
    selectedMCPTool = null;
}

// Select MCP tool
function selectMCPTool(btn) {
    // Clear previous selection
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mcp-tool-btn').forEach(b => b.classList.remove('active'));
    
    // Set new selection
    btn.classList.add('active');
    selectedMCPTool = btn.dataset.tool;
    selectedTool = null;
    selectedSkill = null;
}

// Execute selected action
async function executeAction() {
    const inputText = document.getElementById('input-text').value.trim();
    
    if (!inputText && !uploadedFile && !selectedTool && !selectedSkill && !selectedMCPTool) {
        showError('Please enter text or upload a file, and select a tool or skill');
        return;
    }
    
    if (!selectedTool && !selectedSkill && !selectedMCPTool) {
        showError('Please select a tool, skill, or MCP tool');
        return;
    }
    
    showLoading();
    
    try {
        let result;
        let contentToProcess = inputText;
        
        // If there's an uploaded file, upload it first and get the extracted text
        if (uploadedFile) {
            const uploadResult = await uploadFileToBackend(uploadedFile);
            contentToProcess = uploadResult.extracted_text || inputText;
            
            // Combine file content with manual input if both exist
            if (inputText && uploadResult.extracted_text) {
                contentToProcess = `${inputText}\n\n--- File Content ---\n${uploadResult.extracted_text}`;
            }
        }
        
        if (selectedTool) {
            result = await executeTool(selectedTool, contentToProcess);
        } else if (selectedSkill) {
            result = await executeSkill(selectedSkill, contentToProcess);
        } else if (selectedMCPTool) {
            result = await executeMCPTool(selectedMCPTool, contentToProcess);
        }
        
        hideLoading();
        displayResults(result);
        
        // Clear the uploaded file after successful execution
        if (uploadedFile) {
            clearUploadedFile();
        }
        
    } catch (error) {
        hideLoading();
        showError('Error: ' + error.message);
    }
}

// Execute Tavily tool
async function executeTool(tool, input) {
    const endpoints = {
        'search': '/api/tavily/search',
        'extract': '/api/tavily/extract',
        'map': '/api/tavily/map',
        'crawl': '/api/tavily/crawl'
    };
    
    let body = {};
    if (tool === 'search') {
        body = { query: input };
    } else if (tool === 'extract') {
        body = { url: input };
    } else {
        body = { input: input, tool: tool };
    }
    
    const response = await fetch(apiEndpoint + endpoints[tool], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'API request failed with status ' + response.status;
        throw new Error(errorMessage);
    }
    
    return await response.json();
}

// Execute AI skill
async function executeSkill(skill, input) {
    const endpoints = {
        'summarize': '/api/skills/summarize',
        'fact-check': '/api/skills/fact_check',
        'report': '/api/skills/create_report',
        'analyze': '/api/skills/analyze'
    };
    
    let body = {};
    if (skill === 'summarize') {
        body = { content: input };
    } else if (skill === 'fact-check') {
        body = { statement: input };
    } else if (skill === 'report') {
        body = { content: input };
    } else if (skill === 'analyze') {
        body = { input: input, skill: skill };
    } else {
        body = { input: input, skill: skill };
    }
    
    const response = await fetch(apiEndpoint + endpoints[skill], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'API request failed with status ' + response.status;
        throw new Error(errorMessage);
    }
    
    return await response.json();
}

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    
    resultsSection.classList.remove('hidden');
    
    // Format and display results
    if (typeof results === 'object') {
        resultsContent.innerHTML = formatResultsHtml(results);
    } else {
        resultsContent.textContent = results;
    }
    
    // Save results
    chrome.storage.local.set({ 
        lastResults: results,
        lastResultsTime: Date.now()
    });
}

// Format results as HTML
function formatResultsHtml(results) {
    let html = '';
    
    // MCP result handling
    if (results.result) {
        const mcpResult = results.result;
        
        // Check for Tavily search results
        if (mcpResult.results && Array.isArray(mcpResult.results)) {
            html += '<div class="result-items"><strong>MCP Results:</strong><ul>';
            mcpResult.results.forEach(item => {
                if (item.url) {
                    html += `<li><a href="${item.url}" target="_blank">${item.title || item.url}</a><br>
                             <small>${item.content || item.snippet || ''}</small></li>`;
                } else {
                    html += `<li>${item.title || item.content || JSON.stringify(item)}</li>`;
                }
            });
            html += '</ul></div>';
        }
        
        if (mcpResult.answer) {
            html += `<div class="result-answer"><strong>Answer:</strong><br>${mcpResult.answer}</div>`;
        }
        
        if (mcpResult.images && Array.isArray(mcpResult.images)) {
            html += '<div class="result-images"><strong>Images:</strong><br>';
            mcpResult.images.slice(0, 3).forEach(img => {
                html += `<img src="${img}" style="max-width: 200px; margin: 5px;">`;
            });
            html += '</div>';
        }
    }
    
    if (results.answer) {
        html += `<div class="result-answer"><strong>Answer:</strong><br>${results.answer}</div>`;
    }
    
    if (results.summary) {
        html += `<div class="result-summary"><strong>Summary:</strong><br>${results.summary}</div>`;
    }
    
    if (results.results && Array.isArray(results.results)) {
        html += '<div class="result-items"><strong>Results:</strong><ul>';
        results.results.forEach(item => {
            html += `<li>${item.title || item.content || item}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (results.fact_check) {
        html += `<div class="fact-check-result">
            <strong>Fact Check:</strong><br>
            Verdict: ${results.fact_check.verdict}<br>
            ${results.fact_check.explanation}
        </div>`;
    }
    
    if (results.report) {
        html += `<div class="report-result"><strong>Report:</strong><br>${results.report}</div>`;
    }
    
    if (results.analysis) {
        html += `<div class="analysis-result"><strong>Analysis:</strong><br>${results.analysis.result || results.analysis}</div>`;
    }
    
    return html || `<pre>${JSON.stringify(results, null, 2)}</pre>`;
}

// Clear results
function clearResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('results-content').innerHTML = '';
    chrome.storage.local.remove(['lastResults', 'lastResultsTime']);
}

// Load last results
async function loadLastResults() {
    const data = await chrome.storage.local.get(['lastResults', 'lastResultsTime']);
    
    if (data.lastResults) {
        // Only show if results are less than 5 minutes old
        const age = Date.now() - data.lastResultsTime;
        if (age < 5 * 60 * 1000) {
            displayResults(data.lastResults);
        }
    }
}

// Check API status
async function checkApiStatus() {
    const statusIndicator = document.getElementById('api-status');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    try {
        const response = await fetch(apiEndpoint + '/health', {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Connected';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Server Error';
        }
    } catch (error) {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Server Offline';
    }
}

// Show loading overlay
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Show error message
function showError(message) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    
    resultsSection.classList.remove('hidden');
    resultsContent.innerHTML = `<div style="color: #dc3545; font-weight: 500;">${message}</div>`;
}

// ========== MCP TOOLS FUNCTIONS ==========

// Load available MCP tools
async function loadMCPTools() {
    try {
        const response = await fetch(apiEndpoint + '/api/mcp/tools', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.tools && data.tools.length > 0) {
                displayMCPTools(data.tools);
            }
        }
    } catch (error) {
        console.log('MCP tools not available:', error.message);
        // Hide MCP section if not available
        const mcpSection = document.getElementById('mcp-tools-section');
        if (mcpSection) {
            mcpSection.classList.add('hidden');
        }
    }
}

// Display MCP tools dynamically
function displayMCPTools(tools) {
    const mcpToolsSection = document.getElementById('mcp-tools-section');
    if (!mcpToolsSection) return;
    
    // Get the tool buttons container
    const toolsContainer = mcpToolsSection.querySelector('.mcp-tool-buttons');
    if (!toolsContainer) return;
    
    // Clear existing buttons
    toolsContainer.innerHTML = '';
    
    tools.forEach(tool => {
        const btn = document.createElement('button');
        btn.className = 'mcp-tool-btn';
        btn.dataset.tool = tool.name;
        
        // Format tool name for display
        let displayName = tool.name.replace(/_/g, ' ').replace(/tool/gi, '').trim();
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        btn.textContent = displayName;
        btn.title = tool.description || tool.name;
        btn.addEventListener('click', (e) => selectMCPTool(e.target));
        toolsContainer.appendChild(btn);
    });
    
    // Show the section
    mcpToolsSection.classList.remove('hidden');
}

// Execute MCP Tool
async function executeMCPTool(toolName, input) {
    const response = await fetch(apiEndpoint + '/api/mcp/call', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tool_name: toolName,
            parameters: {
                what_is_your_intent: "Using URS Chrome Extension to access Tavily Expert MCP",
                query: input,
                input: input
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'MCP tool call failed');
    }
    
    return await response.json();
}

// ========== FILE UPLOAD FUNCTIONS ==========

function setupFileUploadListeners() {
    const addFileBtn = document.getElementById('add-file-btn');
    const fileUploadSection = document.getElementById('file-upload-section');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const removeFileBtn = document.getElementById('remove-file');
    
    // Toggle file upload section
    addFileBtn.addEventListener('click', () => {
        fileUploadSection.classList.toggle('hidden');
        addFileBtn.classList.toggle('active');
    });
    
    // Click to open file dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    // Remove file
    removeFileBtn.addEventListener('click', () => {
        clearUploadedFile();
    });
}

function handleFile(file) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showError(`File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
    }
    
    // Validate file extension
    const fileName = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
        showError(`File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        return;
    }
    
    // Store the file
    uploadedFile = file;
    
    // Show file preview
    showFilePreview(file);
}

function showFilePreview(file) {
    const dropZone = document.getElementById('drop-zone');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileDetails = document.getElementById('file-details');
    
    // Hide drop zone, show preview
    dropZone.classList.add('hidden');
    filePreview.classList.remove('hidden');
    
    // Update file info
    fileName.textContent = file.name;
    
    const fileSize = (file.size / 1024).toFixed(2);
    const fileType = file.name.split('.').pop().toUpperCase();
    
    fileDetails.innerHTML = `
        <span>📄 Type: ${fileType}</span>
        <span>💾 Size: ${fileSize} KB</span>
    `;
}

function clearUploadedFile() {
    uploadedFile = null;
    
    const dropZone = document.getElementById('drop-zone');
    const filePreview = document.getElementById('file-preview');
    const fileInput = document.getElementById('file-input');
    
    // Reset file input
    fileInput.value = '';
    
    // Show drop zone, hide preview
    dropZone.classList.remove('hidden');
    filePreview.classList.add('hidden');
}

async function uploadFileToBackend(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(apiEndpoint + '/api/upload/file', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 'File upload failed';
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        // Show info about the uploaded file
        console.log('File uploaded successfully:', {
            filename: result.filename,
            file_size: `${result.file_size_mb} MB`,
            content_length: `${result.content_length} characters`,
            max_allowed: `${result.max_content_length} characters`
        });
        
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}
