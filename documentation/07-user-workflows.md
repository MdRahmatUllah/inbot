# User Workflows

## Overview

This document describes detailed user interaction flows for all major features of the Chatbox application.

---

## 1. User Registration & Login

### Registration Flow

1. **Navigate to Registration**
   - User clicks "Sign Up" or "Register" button
   - Redirected to `/register` page

2. **Enter Registration Details**
   - Email address (validated)
   - Username (unique, 3-20 characters)
   - Password (min 8 characters, complexity requirements)
   - Confirm password

3. **Submit Registration**
   - Click "Create Account" button
   - Frontend validates inputs
   - API call: `POST /api/v1/auth/register`
   - Success: Redirect to login page with success message
   - Error: Display error message (email exists, weak password, etc.)

### Login Flow

1. **Navigate to Login**
   - User visits `/login` page
   - Or redirected from protected route

2. **Enter Credentials**
   - Email address
   - Password
   - Optional: "Remember me" checkbox

3. **Submit Login**
   - Click "Login" button
   - API call: `POST /api/v1/auth/login`
   - Receive JWT tokens (access + refresh)
   - Store tokens securely
   - Redirect to dashboard

4. **Auto-Login**
   - If valid refresh token exists
   - Automatically refresh access token
   - Skip login page

---

## 2. Creating a New Chat Session

### Flow

1. **Initiate New Session**
   - Click "New Chat" button in sidebar
   - Or use keyboard shortcut (Ctrl/Cmd + N)

2. **Session Creation**
   - API call: `POST /api/v1/sessions`
   - Default name: "New Conversation"
   - Default type: "chat"
   - Session appears in sidebar
   - Automatically selected as current session

3. **Optional: Configure Session**
   - Click session settings icon
   - Select Copilot (if any)
   - Configure AI provider/model
   - Set custom system prompt

4. **Ready to Chat**
   - Input box is focused
   - User can start typing

---

## 3. Sending Messages & Receiving Responses

### User Message Flow

1. **Compose Message**
   - Type message in input box
   - Optional: Attach files (drag & drop or click upload)
   - Optional: Add links
   - Optional: Enable web search toggle
   - Optional: Select knowledge base

2. **Send Message**
   - Press Enter (or Shift+Enter for new line)
   - Or click Send button
   - Message appears in chat immediately (optimistic UI)
   - Input box clears

3. **WebSocket Connection**
   - Frontend sends via WebSocket: `send_message` event
   - Backend receives and validates
   - Backend creates user message in database

### AI Response Flow

1. **Stream Start**
   - Backend sends: `stream_start` event
   - Frontend creates placeholder assistant message
   - Shows "thinking" indicator

2. **Streaming Chunks**
   - Backend sends: `stream_chunk` events
   - Frontend appends chunks to message
   - Message updates in real-time
   - Markdown renders progressively

3. **Stream End**
   - Backend sends: `stream_end` event
   - Includes token usage, latency
   - Frontend marks message as complete
   - Displays token usage (if enabled)

4. **Error Handling**
   - If error: Backend sends `stream_error` event
   - Frontend displays error message
   - User can retry

5. **Stop Generation**
   - User clicks "Stop" button
   - Frontend sends: `stop_generation` event
   - Backend cancels AI request
   - Partial response is saved

---

## 4. Attaching Files to Messages

### File Upload Flow

1. **Select Files**
   - **Option A**: Drag & drop files into input box
   - **Option B**: Click attachment icon, select files
   - Supported: PDF, DOCX, XLSX, PPTX, TXT, images

2. **File Validation**
   - Check file size (max 10MB per file)
   - Check file type
   - Display error if invalid

3. **Upload Files**
   - API call: `POST /api/v1/files/upload`
   - Show upload progress
   - Files uploaded to S3/MinIO
   - Receive storage keys

4. **File Parsing** (if applicable)
   - API call: `POST /api/v1/files/{id}/parse`
   - Extract text content
   - Display preview

5. **Attach to Message**
   - Files shown as chips in input box
   - User can remove files before sending
   - Files included in message payload

6. **Display in Chat**
   - Files shown as attachments in message
   - Images: Inline preview
   - Documents: Download link with icon

---

## 5. Using Knowledge Base

### Creating Knowledge Base

1. **Navigate to KB Page**
   - Click "Knowledge Base" in sidebar
   - Or navigate to `/knowledge-base`

2. **Create New KB**
   - Click "New Knowledge Base" button
   - Enter name and description
   - Select embedding provider/model
   - Configure chunking settings (optional)
   - API call: `POST /api/v1/knowledge-bases`

3. **Upload Files**
   - Click "Upload Files" button
   - Select multiple files
   - API call: `POST /api/v1/knowledge-bases/{id}/files`
   - Files are queued for processing

4. **Processing**
   - Backend parses files
   - Chunks text
   - Generates embeddings
   - Stores in vector database
   - Status updates: pending → processing → completed

### Using KB in Chat

1. **Select KB**
   - In chat input, click KB icon
   - Select knowledge base from dropdown
   - KB indicator shows in input box

2. **Send Query**
   - User sends message as normal
   - Backend performs vector search
   - Retrieves relevant chunks
   - Includes in AI context

3. **View Sources**
   - AI response includes citations
   - User can click to see source chunks
   - Shows filename and relevance score

---

## 6. Creating and Using Copilots

### Creating Copilot

1. **Navigate to Copilots**
   - Click "Copilots" in sidebar
   - Or navigate to `/copilots`

2. **Create New Copilot**
   - Click "New Copilot" button
   - Enter name (e.g., "Code Assistant")
   - Write system prompt
   - Optional: Upload avatar
   - Select default provider/model
   - API call: `POST /api/v1/copilots`

3. **Save Copilot**
   - Copilot appears in list
   - Available for use in sessions

### Using Copilot

1. **Select Copilot in Session**
   - In session settings
   - Choose copilot from dropdown
   - Session uses copilot's system prompt

2. **Chat with Copilot**
   - All messages use copilot configuration
   - Copilot avatar shown (if set)
   - Behavior matches system prompt

---

## 7. Exporting Conversations

### Export Flow

1. **Open Export Dialog**
   - Click session menu (three dots)
   - Select "Export"
   - Or use keyboard shortcut

2. **Select Format**
   - Markdown (.md)
   - HTML (.html)
   - Plain Text (.txt)
   - JSON (.json)

3. **Configure Options**
   - Include timestamps (yes/no)
   - Include token usage (yes/no)
   - Include system messages (yes/no)

4. **Download**
   - Click "Export" button
   - API call: `GET /api/v1/sessions/{id}/export?format=markdown`
   - File downloads automatically
   - Filename: `{session-name}-{date}.{ext}`

---

## 8. Importing Conversations

### Import Flow

1. **Open Import Dialog**
   - Click "Import" in sidebar
   - Or navigate to settings

2. **Select File**
   - Upload JSON export file
   - Or paste JSON content

3. **Preview**
   - Show session name
   - Show message count
   - Show preview of first few messages

4. **Confirm Import**
   - Click "Import" button
   - API call: `POST /api/v1/sessions/import`
   - New session created
   - Redirect to imported session

---

## 9. Configuring AI Providers

### Provider Configuration Flow

1. **Navigate to Settings**
   - Click "Settings" in sidebar
   - Go to "Providers" tab

2. **Select Provider**
   - Click on provider (e.g., OpenAI)
   - Provider configuration panel opens

3. **Enter API Key**
   - Paste API key
   - Click "Validate" to test
   - API call: Test connection

4. **Configure Settings**
   - Select default model
   - Set temperature, max tokens
   - Enable/disable provider

5. **Save Configuration**
   - API call: `PATCH /api/v1/settings/providers/{id}`
   - Settings encrypted and stored
   - Provider available for use

---

## 10. Managing Sessions

### Session Operations

1. **Rename Session**
   - Click session name
   - Edit inline
   - Press Enter to save
   - API call: `PATCH /api/v1/sessions/{id}`

2. **Star/Unstar Session**
   - Click star icon
   - Session moves to "Starred" section
   - API call: `PATCH /api/v1/sessions/{id}`

3. **Delete Session**
   - Click session menu → Delete
   - Confirmation dialog
   - API call: `DELETE /api/v1/sessions/{id}`
   - Session removed from list

4. **Search Sessions**
   - Click search icon in sidebar
   - Type search query
   - Sessions filtered in real-time
   - Search by name or content

---

## 11. Keyboard Shortcuts

### Default Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Chat | Ctrl + N | Cmd + N |
| Search | Ctrl + K | Cmd + K |
| Settings | Ctrl + , | Cmd + , |
| Toggle Sidebar | Ctrl + B | Cmd + B |
| Send Message | Enter | Enter |
| New Line | Shift + Enter | Shift + Enter |
| Stop Generation | Esc | Esc |
| Delete Message | Ctrl + D | Cmd + D |
| Copy Message | Ctrl + C | Cmd + C |

### Customization

1. Navigate to Settings → Hotkeys
2. Click on shortcut to edit
3. Press new key combination
4. Save changes

