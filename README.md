# AI Summarizer Chrome Extension

A powerful Chrome extension that uses AI to summarize web page content and answer questions about it in real-time.

## Features

- **Summarize**: Extract and summarize the main content of any webpage with a single click
- **Ask Questions**: Ask follow-up questions about the page content and get instant answers
- **Session Management**: Maintains active sessions for continuous conversations
- **Content Extraction**: Automatically extracts visible text from web pages, ignoring scripts and hidden elements
- **Error Handling**: Graceful error handling with user-friendly messages

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Chrome Browser** (v88 or higher)
- **Backend Server** running at `http://localhost:8000` with endpoints:
  - `POST /summarize` - Summarize page content
  - `POST /create_session` - Create a new session
  - `POST /ask` - Ask questions about page content
  - `POST /close_session` - Close an active session

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   ```

2. **Navigate to the extension folder**:
   ```bash
   cd ai-summarizer/chrome-extension
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create environment file**:
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

5. **Build the extension**:
   ```bash
   npm run build
   ```

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist` folder from your project directory (`ai-summarizer/chrome-extension/dist`)
5. The extension should now appear in your Chrome toolbar

## Usage

### Summarize a Web Page

1. Navigate to any webpage
2. Click the **AI Summarizer** extension icon
3. Click the **Summarize** button
4. Wait for the AI to process and display the summary

### Ask Questions

1. Click the **Ask** button in the extension popup
2. Type your question about the page content
3. Press **Enter** to submit
4. View the answer in the chat interface



## Key Files Explained

### `manifest.json`
Defines extension permissions, scripts, and metadata. Specifies which APIs can be used and where scripts run.

### `src/content/content.js`
Runs in the context of web pages. Extracts visible text content and responds to background script requests.

### `src/background/background.js`
Service worker that handles:
- Communication between popup and content scripts
- API calls to backend server
- Session management
- Tab monitoring (close/switch detection)

### `src/App.jsx`
React component for the popup UI. Handles:
- User interactions (buttons, input)
- Message sending to background script
- Display of summaries and Q&A



## Backend API Requirements

Your backend server must implement these endpoints:

### 1. POST /summarize
```json
Request:
{
  "text": "page content here..."
}

Response:
{
  "summary": "summarized content..."
}
```

### 2. POST /create_session
```json
Request:
{
  "text": "page content..."
}

Response:
{
  "session_id": "unique-session-id"
}
```

### 3. POST /ask
```json
Request:
{
  "session_id": "unique-session-id",
  "question": "user question here"
}

Response:
{
  "answer": "answer to the question"
}
```

### 4. POST /close_session
```json
Request:
{
  "session_id": "unique-session-id"
}

Response:
{
  "status": "session closed"
}
```

## Configuration

### API Endpoint

The default backend URL is `http://localhost:8000`. To change it:

Update the URL in `src/background/background.js`:
```javascript
const backendURL = "http://your-server-url/summarize";
```

## Permissions

This extension requires the following Chrome permissions:

- `activeTab` - Access the current active tab
- `tabs` - Query tab information
- `scripting` - Inject and execute scripts
- `storage` - Store session data locally
- `host_permissions: <all_urls>` - Run on any website

## Browser Compatibility

- **Chrome**: v88+
- **Chromium-based browsers**: Edge, Brave, Opera (with modifications)


