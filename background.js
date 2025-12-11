// Background service worker for URS Chrome Extension

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const MCP_SERVER_URL = 'http://localhost:8001';

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'urs-search',
    title: 'URS: Search with Tavily',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'urs-extract',
    title: 'URS: Extract Information',
    contexts: ['page', 'link']
  });

  chrome.contextMenus.create({
    id: 'urs-summarize',
    title: 'URS: Summarize',
    contexts: ['selection', 'page']
  });

  chrome.contextMenus.create({
    id: 'urs-fact-check',
    title: 'URS: Fact Check',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'urs-report',
    title: 'URS: Create Report',
    contexts: ['selection', 'page']
  });

  console.log('URS Extension installed successfully');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuActions = {
    'urs-search': handleSearch,
    'urs-extract': handleExtract,
    'urs-summarize': handleSummarize,
    'urs-fact-check': handleFactCheck,
    'urs-report': handleCreateReport
  };

  const handler = menuActions[info.menuItemId];
  if (handler) {
    await handler(info, tab);
  }
});

// Handle search action
async function handleSearch(info, tab) {
  const selectedText = info.selectionText || '';
  
  try {
    // Send to Python backend
    const response = await fetch(`${API_BASE_URL}/api/tavily/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: selectedText,
        context_url: tab.url,
        search_depth: 'advanced'
      })
    });

    const result = await response.json();
    
    // Send results to popup or create notification
    await chrome.storage.local.set({ 
      lastSearchResult: result,
      timestamp: Date.now()
    });

    // Open popup with results
    chrome.action.openPopup();
    
  } catch (error) {
    console.error('Search error:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'URS Search Error',
      message: 'Failed to perform search. Please check if the backend server is running.'
    });
  }
}

// Handle extract action
async function handleExtract(info, tab) {
  const targetUrl = info.linkUrl || info.pageUrl || tab.url;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/tavily/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        extract_depth: 'advanced'
      })
    });

    const result = await response.json();
    
    await chrome.storage.local.set({ 
      lastExtractResult: result,
      timestamp: Date.now()
    });

    chrome.action.openPopup();
    
  } catch (error) {
    console.error('Extract error:', error);
  }
}

// Handle summarize action
async function handleSummarize(info, tab) {
  const content = info.selectionText || '';
  const pageUrl = tab.url;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        url: pageUrl,
        use_page_content: !content
      })
    });

    const result = await response.json();
    
    await chrome.storage.local.set({ 
      lastSummaryResult: result,
      timestamp: Date.now()
    });

    chrome.action.openPopup();
    
  } catch (error) {
    console.error('Summarize error:', error);
  }
}

// Handle fact check action
async function handleFactCheck(info, tab) {
  const statement = info.selectionText || '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/fact_check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statement: statement,
        context_url: tab.url
      })
    });

    const result = await response.json();
    
    await chrome.storage.local.set({ 
      lastFactCheckResult: result,
      timestamp: Date.now()
    });

    chrome.action.openPopup();
    
  } catch (error) {
    console.error('Fact check error:', error);
  }
}

// Handle create report action
async function handleCreateReport(info, tab) {
  const content = info.selectionText || '';
  const pageUrl = tab.url;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/create_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        url: pageUrl,
        report_type: 'comprehensive'
      })
    });

    const result = await response.json();
    
    await chrome.storage.local.set({ 
      lastReportResult: result,
      timestamp: Date.now()
    });

    chrome.action.openPopup();
    
  } catch (error) {
    console.error('Create report error:', error);
  }
}

// Message handler for communication with popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiStatus') {
    checkApiStatus().then(sendResponse);
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'callMcpServer') {
    callMcpServer(request.data).then(sendResponse);
    return true;
  }
});

// Check API server status
async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return { status: 'online', message: 'Backend server is running' };
  } catch (error) {
    return { status: 'offline', message: 'Backend server is not accessible' };
  }
}

// Call MCP server
async function callMcpServer(data) {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}
