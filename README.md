# URS - Universal Research Suite Chrome Extension

A powerful Chrome extension that integrates Tavily search tools with AI capabilities and MCP server support.

## Features

### 🔍 Tavily Tools Integration
- **Search**: Advanced web search using Tavily API
- **Extract**: Extract content from web pages
- **Map**: Location-based search and mapping
- **Crawl**: Web crawling capabilities

### 🤖 AI Skills
- **Summarize**: Create concise summaries of content
- **Fact Check**: Verify statements and claims
- **Create Report**: Generate comprehensive reports
- **Analyze**: Deep analysis of content and data

### 🎯 User Features
1. **Right-click Context Menu**: Access URS functions directly from any webpage
2. **Sticky Mode**: Keep the popup window open while browsing
3. **Resizable Popup**: Adjust popup dimensions to your preference
4. **MCP Server Integration**: Connect to Model Context Protocol servers

## Installation

### Chrome Extension Setup

1. **Install the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `urs` folder

### Backend Server Setup

1. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure API keys**:
   - Copy `env_example.txt` to `.env`
   - Add your Tavily API key
   - (Optional) Add OpenAI or other AI model API keys

3. **Start the backend server**:
```bash
python server.py
```

4. **Start the MCP server** (optional):
```bash
python mcp_server.py
```

## Configuration

### API Keys Required

- **Tavily API Key**: Get from [Tavily.com](https://tavily.com)
- **OpenAI API Key** (optional): For AI skills functionality
- Other AI model APIs can be configured as alternatives

### Environment Variables

Create a `.env` file in the backend folder:

```env
TAVILY_API_KEY=your_tavily_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
MCP_SERVER_URL=http://localhost:8001
```

## Usage

### Using Context Menu
1. Select text on any webpage
2. Right-click and choose URS options:
   - Search with Tavily
   - Extract Information
   - Summarize
   - Fact Check
   - Create Report

### Using Popup
1. Click the URS extension icon
2. Select a tool or skill
3. **Enter text, URL, or upload a file**:
   - Type directly in the text area, OR
   - Click the **➕ Plus button** to upload a file
   - Drag & drop files (max 5MB)
   - Supported formats: `.txt`, `.docx`, `.pdf`, `.md`, `.pptx`, `.csv`, `.xlsx`
4. Click "Execute"

### Keyboard Shortcuts
- `Ctrl+Shift+U`: Open URS popup
- `Ctrl+Shift+S`: Search selected text

### Sticky Mode
- Click the 📌 pin icon to keep the popup window open
- Useful for continuous research tasks

### Resizing
- Click the ⤢ resize icon
- Adjust width and height in settings
- Changes are saved automatically

### File Upload
- Click the **➕ Plus button** next to the input field
- **Drag & drop** your file into the drop zone, OR click to browse
- **Supported formats**: `.txt`, `.docx`, `.pdf`, `.md`, `.pptx`, `.csv`, `.xlsx`
- **Max file size**: 5MB (configurable in `.env` via `MAX_FILE_SIZE_MB`)
- **Max content length**: 50,000 characters (configurable in `.env` via `MAX_CONTENT_LENGTH`)
- Files are automatically processed and text is extracted
- Use any AI skill (summarize, fact-check, report) on uploaded files

> **Note**: If you need to process larger files, you can increase the limits in `backend/.env`:
> - `MAX_FILE_SIZE_MB=10` for 10MB files
> - `MAX_CONTENT_LENGTH=100000` for 100,000 characters

## Architecture

```
urs/
├── manifest.json          # Chrome extension manifest
├── background.js          # Service worker for extension
├── popup.html            # Popup UI
├── popup.js              # Popup functionality
├── popup.css             # Popup styles
├── content.js            # Content script for web pages
├── content.css           # Content styles
├── backend/
│   ├── server.py         # FastAPI backend server
│   ├── mcp_server.py     # MCP server implementation
│   ├── requirements.txt  # Python dependencies
│   └── env_example.txt   # Environment variables example
└── icons/                # Extension icons
```

## Development

### Backend Development
- The backend uses FastAPI for REST API endpoints
- Tavily integration for search capabilities
- Optional AI model integration for advanced skills
- MCP server for protocol support

### Extension Development
- Manifest V3 Chrome extension
- Background service worker for context menus
- Content scripts for page interaction
- Popup UI with modern design

## API Endpoints

### Main Server (port 8000)
- `GET /health` - Health check
- `POST /api/tavily/search` - Tavily search
- `POST /api/tavily/extract` - Content extraction
- `POST /api/skills/summarize` - Summarization
- `POST /api/skills/fact_check` - Fact checking
- `POST /api/skills/create_report` - Report generation

### MCP Server (port 8001)
- `WS /mcp/ws` - WebSocket connection
- `POST /mcp/call` - REST API calls
- `GET /mcp/tools` - List available tools

## Troubleshooting

### Extension not working
1. Check if backend server is running
2. Verify API keys in `.env` file
3. Check Chrome console for errors (F12)

### Backend server issues
1. Ensure all dependencies are installed
2. Check if ports 8000 and 8001 are available
3. Verify Tavily API key is valid

### Connection errors
1. Ensure CORS is properly configured
2. Check firewall settings
3. Verify localhost is accessible

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Acknowledgments

- Tavily for search API
- OpenAI for AI capabilities
- Chrome Extensions documentation
