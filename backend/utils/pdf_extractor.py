import fitz  # PyMuPDF
from io import BytesIO

def extract_text_from_pdf(file):
    """
    Extract text content from a PDF file
    
    Args:
        file: FileStorage object from Flask request
        
    Returns:
        str: Extracted text from all pages
    """
    try:
        # Read file content
        pdf_content = file.read()
        
        # Open PDF from bytes
        pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
        
        # Extract text from all pages
        text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text += page.get_text()
        
        pdf_document.close()
        
        return text.strip()
        
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")