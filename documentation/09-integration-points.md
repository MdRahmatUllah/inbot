# Integration Points

## Overview

This document describes all external integrations, file handling mechanisms, real-time communication patterns, and third-party service integrations for the Chatbox application.

---

## 1. Real-Time Communication

### WebSocket vs Server-Sent Events (SSE)

#### WebSocket (Recommended)

**Pros**:
- Bidirectional communication
- Lower latency
- Better for interactive features (stop generation)
- Native browser support

**Cons**:
- More complex to scale
- Requires sticky sessions or Redis pub/sub

**Implementation**:

```python
# Backend: FastAPI WebSocket
from fastapi import WebSocket, WebSocketDisconnect
from app.services.ai_service import stream_ai_response

@router.websocket("/ws/sessions/{session_id}/stream")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    current_user: User = Depends(get_current_user_ws)
):
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            if data['type'] == 'send_message':
                # Send user message confirmation
                await websocket.send_json({
                    'type': 'message_created',
                    'data': {...}
                })
                
                # Stream AI response
                await websocket.send_json({
                    'type': 'stream_start',
                    'data': {'message_id': '...'}
                })
                
                async for chunk in stream_ai_response(data['message']):
                    await websocket.send_json({
                        'type': 'stream_chunk',
                        'data': {'chunk': chunk}
                    })
                
                await websocket.send_json({
                    'type': 'stream_end',
                    'data': {'usage': {...}}
                })
            
            elif data['type'] == 'stop_generation':
                # Cancel AI request
                break
                
    except WebSocketDisconnect:
        print(f"Client disconnected")
```

```typescript
// Frontend: WebSocket Client
class ChatWebSocket {
  private ws: WebSocket | null = null
  private messageHandlers: Map<string, Function> = new Map()
  
  connect(sessionId: string, token: string) {
    const wsUrl = `${WS_URL}/ws/sessions/${sessionId}/stream?token=${token}`
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const handler = this.messageHandlers.get(data.type)
      if (handler) handler(data.data)
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket closed')
      // Implement reconnection logic
    }
  }
  
  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        data: message
      }))
    }
  }
  
  stopGeneration(messageId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'stop_generation',
        data: { message_id: messageId }
      }))
    }
  }
  
  on(eventType: string, handler: Function) {
    this.messageHandlers.set(eventType, handler)
  }
  
  disconnect() {
    this.ws?.close()
  }
}
```

#### Server-Sent Events (SSE) (Alternative)

**Pros**:
- Simpler to implement
- Better for one-way streaming
- Automatic reconnection
- Works through proxies

**Cons**:
- One-way only (server → client)
- Need separate endpoint for client → server

**Implementation**:

```python
# Backend: SSE
from fastapi import Request
from sse_starlette.sse import EventSourceResponse

@router.get("/sessions/{session_id}/stream")
async def stream_response(
    request: Request,
    session_id: str,
    message: str,
    current_user: User = Depends(get_current_user)
):
    async def event_generator():
        async for chunk in stream_ai_response(message):
            if await request.is_disconnected():
                break
            
            yield {
                "event": "message",
                "data": json.dumps({"chunk": chunk})
            }
        
        yield {
            "event": "done",
            "data": json.dumps({"usage": {...}})
        }
    
    return EventSourceResponse(event_generator())
```

```typescript
// Frontend: SSE Client
const eventSource = new EventSource(
  `${API_URL}/sessions/${sessionId}/stream?message=${encodeURIComponent(message)}`
)

eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  // Handle chunk
})

eventSource.addEventListener('done', (event) => {
  const data = JSON.parse(event.data)
  // Handle completion
  eventSource.close()
})

eventSource.onerror = (error) => {
  console.error('SSE error:', error)
  eventSource.close()
}
```

### Scaling WebSocket Connections

#### Using Redis Pub/Sub

```python
# Backend: Redis pub/sub for multi-instance WebSocket
import redis.asyncio as redis
from fastapi import WebSocket

redis_client = redis.from_url("redis://localhost:6379")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        # Subscribe to Redis channel
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"session:{session_id}")
        
        # Listen for messages from other instances
        asyncio.create_task(self.listen_redis(session_id, pubsub))
    
    async def listen_redis(self, session_id: str, pubsub):
        async for message in pubsub.listen():
            if message['type'] == 'message':
                ws = self.active_connections.get(session_id)
                if ws:
                    await ws.send_text(message['data'])
    
    async def broadcast(self, session_id: str, message: str):
        # Publish to Redis for all instances
        await redis_client.publish(f"session:{session_id}", message)

manager = ConnectionManager()
```

---

## 2. File Upload & Download

### File Upload Flow

#### Backend Implementation

```python
# app/api/v1/files.py
from fastapi import UploadFile, File
from app.services.file_service import upload_file_to_s3, parse_file

@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    purpose: str = "message_attachment",
    current_user: User = Depends(get_current_user)
):
    # Validate file
    if file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(400, "File too large")
    
    # Upload to S3
    storage_key = await upload_file_to_s3(
        file=file,
        user_id=current_user.id,
        purpose=purpose
    )
    
    # Save metadata to database
    file_record = FileModel(
        user_id=current_user.id,
        filename=file.filename,
        mime_type=file.content_type,
        size=file.size,
        storage_key=storage_key
    )
    db.add(file_record)
    db.commit()
    
    return {
        "id": file_record.id,
        "filename": file.filename,
        "storage_key": storage_key,
        "url": f"https://cdn.chatbox.app/{storage_key}"
    }
```

#### S3/MinIO Integration

```python
# app/services/file_service.py
import boto3
from botocore.client import Config

s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    config=Config(signature_version='s3v4')
)

async def upload_file_to_s3(
    file: UploadFile,
    user_id: str,
    purpose: str
) -> str:
    # Generate storage key
    file_ext = file.filename.split('.')[-1]
    storage_key = f"users/{user_id}/{purpose}/{uuid.uuid4()}.{file_ext}"
    
    # Upload to S3
    s3_client.upload_fileobj(
        file.file,
        settings.S3_BUCKET,
        storage_key,
        ExtraArgs={
            'ContentType': file.content_type,
            'ACL': 'private'
        }
    )
    
    return storage_key

async def get_presigned_url(storage_key: str, expires_in: int = 3600) -> str:
    """Generate presigned URL for file download"""
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': settings.S3_BUCKET,
            'Key': storage_key
        },
        ExpiresIn=expires_in
    )
    return url
```

#### Frontend Upload Component

```typescript
// components/file-upload.tsx
'use client'

import { useState } from 'react'
import { uploadFile } from '@/lib/api/files'

export function FileUpload({ onUploadComplete }: { onUploadComplete: (file: any) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'message_attachment')
      
      const result = await uploadFile(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        setProgress(percentCompleted)
      })
      
      onUploadComplete(result)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }
  
  return (
    <div>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <progress value={progress} max={100} />}
    </div>
  )
}
```

---

## 3. File Parsing

### Supported File Types

- **PDF**: pypdf
- **DOCX**: python-docx
- **XLSX**: openpyxl
- **PPTX**: python-pptx
- **EPUB**: ebooklib
- **Images**: Pillow + pytesseract (OCR)
- **Text**: Plain text, Markdown, code files

### File Parser Implementation

```python
# app/utils/file_parser.py
from pypdf import PdfReader
from docx import Document
from openpyxl import load_workbook
from pptx import Presentation
import ebooklib
from ebooklib import epub
from PIL import Image
import pytesseract

class FileParser:
    @staticmethod
    def parse_pdf(file_path: str) -> str:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    @staticmethod
    def parse_docx(file_path: str) -> str:
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    
    @staticmethod
    def parse_xlsx(file_path: str) -> str:
        wb = load_workbook(file_path)
        text = ""
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                text += " ".join([str(cell) for cell in row if cell]) + "\n"
        return text
    
    @staticmethod
    def parse_pptx(file_path: str) -> str:
        prs = Presentation(file_path)
        text = ""
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text += shape.text + "\n"
        return text
    
    @staticmethod
    def parse_epub(file_path: str) -> str:
        book = epub.read_epub(file_path)
        text = ""
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                text += item.get_content().decode('utf-8') + "\n"
        return text
    
    @staticmethod
    def parse_image(file_path: str) -> str:
        """Extract text from image using OCR"""
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text
    
    @staticmethod
    def parse_file(file_path: str, mime_type: str) -> str:
        """Parse file based on MIME type"""
        parsers = {
            'application/pdf': FileParser.parse_pdf,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileParser.parse_docx,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileParser.parse_xlsx,
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileParser.parse_pptx,
            'application/epub+zip': FileParser.parse_epub,
            'image/png': FileParser.parse_image,
            'image/jpeg': FileParser.parse_image,
        }
        
        parser = parsers.get(mime_type)
        if parser:
            return parser(file_path)
        else:
            # Default: read as text
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
```

---

## 4. Web Search Integration

### Supported Search Providers

- **Bing Web Search API**
- **Google Custom Search API**
- **DuckDuckGo (unofficial API)**
- **Brave Search API**

### Web Search Implementation

```python
# app/services/web_search_service.py
import httpx
from bs4 import BeautifulSoup

class WebSearchService:
    def __init__(self, provider: str, api_key: str = None):
        self.provider = provider
        self.api_key = api_key

    async def search(self, query: str, max_results: int = 5) -> list:
        if self.provider == 'bing':
            return await self._search_bing(query, max_results)
        elif self.provider == 'google':
            return await self._search_google(query, max_results)
        elif self.provider == 'duckduckgo':
            return await self._search_duckduckgo(query, max_results)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    async def _search_bing(self, query: str, max_results: int) -> list:
        url = "https://api.bing.microsoft.com/v7.0/search"
        headers = {"Ocp-Apim-Subscription-Key": self.api_key}
        params = {"q": query, "count": max_results}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            data = response.json()

        results = []
        for item in data.get('webPages', {}).get('value', []):
            results.append({
                'title': item['name'],
                'snippet': item['snippet'],
                'link': item['url']
            })

        return results

    async def _search_google(self, query: str, max_results: int) -> list:
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": self.api_key,
            "cx": self.search_engine_id,  # Custom Search Engine ID
            "q": query,
            "num": max_results
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        results = []
        for item in data.get('items', []):
            results.append({
                'title': item['title'],
                'snippet': item['snippet'],
                'link': item['link']
            })

        return results

    async def parse_url(self, url: str) -> dict:
        """Fetch and parse content from URL"""
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            html = response.text

        soup = BeautifulSoup(html, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Get text
        text = soup.get_text()

        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return {
            'url': url,
            'title': soup.title.string if soup.title else '',
            'content': text[:10000]  # Limit to 10k chars
        }
```

---

## 5. Vector Database Integration

### pgvector (PostgreSQL Extension)

```python
# app/services/embedding_service.py
from openai import OpenAI
from sqlalchemy import text
from app.database import SessionLocal

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class EmbeddingService:
    @staticmethod
    async def generate_embedding(text: str, model: str = "text-embedding-3-small") -> list:
        """Generate embedding using OpenAI"""
        response = client.embeddings.create(
            input=text,
            model=model
        )
        return response.data[0].embedding

    @staticmethod
    async def search_similar(
        kb_id: int,
        query_embedding: list,
        top_k: int = 5
    ) -> list:
        """Search for similar chunks using cosine similarity"""
        db = SessionLocal()

        # Convert embedding to pgvector format
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'

        query = text("""
            SELECT
                id,
                text,
                file_id,
                chunk_index,
                1 - (embedding <=> :query_embedding::vector) as similarity
            FROM kb_chunks
            WHERE kb_id = :kb_id
            ORDER BY embedding <=> :query_embedding::vector
            LIMIT :top_k
        """)

        result = db.execute(
            query,
            {
                'query_embedding': embedding_str,
                'kb_id': kb_id,
                'top_k': top_k
            }
        )

        chunks = []
        for row in result:
            chunks.append({
                'id': row.id,
                'text': row.text,
                'file_id': row.file_id,
                'chunk_index': row.chunk_index,
                'similarity': row.similarity
            })

        db.close()
        return chunks
```

### Text Chunking

```python
# app/utils/chunking.py
from typing import List

class TextChunker:
    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 512,
        chunk_overlap: int = 50
    ) -> List[dict]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            chunks.append({
                'text': chunk_text,
                'start_offset': start,
                'end_offset': end,
                'chunk_index': len(chunks)
            })

            start += chunk_size - chunk_overlap

        return chunks

    @staticmethod
    def chunk_by_sentences(
        text: str,
        max_chunk_size: int = 512
    ) -> List[str]:
        """Chunk text by sentences, respecting max size"""
        import re

        # Split by sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= max_chunk_size:
                current_chunk += sentence + " "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + " "

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks
```

---

## 6. Export/Import Formats

### Markdown Export

```python
# app/services/export_service.py
from app.models import Session, Message

class ExportService:
    @staticmethod
    def export_to_markdown(session: Session, messages: List[Message]) -> str:
        """Export session to Markdown format"""
        md = f"# {session.name}\n\n"
        md += f"**Created**: {session.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        md += "---\n\n"

        for message in messages:
            role = message.role.capitalize()
            md += f"## {role}\n\n"

            for part in message.content_parts:
                if part['type'] == 'text':
                    md += f"{part['text']}\n\n"
                elif part['type'] == 'image':
                    md += f"![Image]({part['image']})\n\n"
                elif part['type'] == 'tool-call':
                    md += f"**Tool Call**: {part['toolName']}\n"
                    md += f"```json\n{json.dumps(part['args'], indent=2)}\n```\n\n"

            if message.usage:
                md += f"*Tokens: {message.usage['totalTokens']}*\n\n"

            md += "---\n\n"

        return md

    @staticmethod
    def export_to_html(session: Session, messages: List[Message]) -> str:
        """Export session to HTML format"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{session.name}</title>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .message {{ margin-bottom: 20px; padding: 15px; border-radius: 8px; }}
                .user {{ background-color: #e3f2fd; }}
                .assistant {{ background-color: #f5f5f5; }}
                .role {{ font-weight: bold; margin-bottom: 10px; }}
                pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }}
            </style>
        </head>
        <body>
            <h1>{session.name}</h1>
            <p><strong>Created:</strong> {session.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <hr>
        """

        for message in messages:
            html += f'<div class="message {message.role}">'
            html += f'<div class="role">{message.role.capitalize()}</div>'

            for part in message.content_parts:
                if part['type'] == 'text':
                    # Convert markdown to HTML (simplified)
                    text = part['text'].replace('\n', '<br>')
                    html += f'<div>{text}</div>'

            html += '</div>'

        html += """
        </body>
        </html>
        """

        return html

    @staticmethod
    def export_to_json(session: Session, messages: List[Message]) -> dict:
        """Export session to JSON format"""
        return {
            'version': '1.0',
            'session': {
                'id': session.id,
                'name': session.name,
                'type': session.type,
                'created_at': session.created_at.isoformat(),
            },
            'messages': [
                {
                    'id': msg.id,
                    'role': msg.role,
                    'content_parts': msg.content_parts,
                    'timestamp': msg.timestamp.isoformat(),
                    'usage': msg.usage
                }
                for msg in messages
            ]
        }
```

---

## 7. MCP (Model Context Protocol) Integration

### MCP Server Management

```python
# app/services/mcp_service.py
import subprocess
import json
from typing import Dict, List

class MCPService:
    def __init__(self):
        self.servers: Dict[str, subprocess.Popen] = {}

    async def start_server(self, server_config: dict) -> dict:
        """Start an MCP server"""
        if server_config['transport']['type'] == 'stdio':
            # Start stdio-based MCP server
            process = subprocess.Popen(
                [server_config['transport']['command']] + server_config['transport']['args'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            self.servers[server_config['id']] = process

            return {
                'id': server_config['id'],
                'status': 'running',
                'pid': process.pid
            }

        elif server_config['transport']['type'] == 'http':
            # HTTP-based MCP server (already running)
            return {
                'id': server_config['id'],
                'status': 'connected',
                'url': server_config['transport']['url']
            }

    async def call_tool(self, server_id: str, tool_name: str, args: dict) -> dict:
        """Call a tool on an MCP server"""
        process = self.servers.get(server_id)
        if not process:
            raise ValueError(f"Server {server_id} not running")

        # Send tool call request
        request = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': tool_name,
                'arguments': args
            }
        }

        process.stdin.write(json.dumps(request).encode() + b'\n')
        process.stdin.flush()

        # Read response
        response_line = process.stdout.readline()
        response = json.loads(response_line)

        return response.get('result', {})

    async def list_tools(self, server_id: str) -> List[dict]:
        """List available tools from an MCP server"""
        process = self.servers.get(server_id)
        if not process:
            raise ValueError(f"Server {server_id} not running")

        request = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/list'
        }

        process.stdin.write(json.dumps(request).encode() + b'\n')
        process.stdin.flush()

        response_line = process.stdout.readline()
        response = json.loads(response_line)

        return response.get('result', {}).get('tools', [])

    async def stop_server(self, server_id: str):
        """Stop an MCP server"""
        process = self.servers.get(server_id)
        if process:
            process.terminate()
            process.wait(timeout=5)
            del self.servers[server_id]
```

---

## 8. Internationalization (i18n)

### Backend i18n (Optional)

```python
# app/utils/i18n.py
from typing import Dict

translations: Dict[str, Dict[str, str]] = {
    'en': {
        'session_created': 'Session created successfully',
        'message_sent': 'Message sent',
        'error_occurred': 'An error occurred'
    },
    'zh-CN': {
        'session_created': '会话创建成功',
        'message_sent': '消息已发送',
        'error_occurred': '发生错误'
    }
}

def translate(key: str, lang: str = 'en') -> str:
    return translations.get(lang, {}).get(key, key)
```

### Frontend i18n (i18next)

```typescript
// lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: require('@/public/locales/en/common.json')
      },
      'zh-CN': {
        common: require('@/public/locales/zh-CN/common.json')
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

```json
// public/locales/en/common.json
{
  "app_name": "Chatbox",
  "new_chat": "New Chat",
  "settings": "Settings",
  "send_message": "Send message",
  "stop_generating": "Stop generating",
  "copy": "Copy",
  "delete": "Delete",
  "export": "Export",
  "import": "Import"
}
```

---

## 9. Error Handling & Retry Logic

### Backend Error Handling

```python
# app/utils/retry.py
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_ai_provider_with_retry(provider, prompt):
    """Call AI provider with automatic retry on failure"""
    try:
        return await provider.generate(prompt)
    except Exception as e:
        print(f"AI provider error: {e}")
        raise
```

### Frontend Error Handling

```typescript
// lib/api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken
        })

        localStorage.setItem('access_token', response.data.access_token)

        // Retry original request
        error.config.headers.Authorization = `Bearer ${response.data.access_token}`
        return apiClient.request(error.config)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
```


