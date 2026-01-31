---
type: "always_apply"
---

---
type: "always_apply"---

# Document Ingestion Standards

## Supported Types
- PDF: pdfplumber / PyPDF2
- DOC/DOCX: convert to PDF first
- Excel/CSV: pandas, openpyxl
- Complex docs: Docling

## Chunking Rules
- Size: 300–800 tokens
- Overlap: 10–15%
- Units: paragraph, section, table, figure

## Metadata (MANDATORY)
- document_id
- version
- page_number
- section_path
- chunk_hash

## Embeddings
- Stored ONLY in Qdrant
- Metadata stored in PostgreSQL
- Collections MUST be versioned