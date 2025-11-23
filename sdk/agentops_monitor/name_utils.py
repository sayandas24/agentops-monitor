"""
Utilities for extracting and formatting trace names from various input types.
"""


def extract_query_from_message(new_message):
    """
    Extract text content from Google ADK message object.
    
    Args:
        new_message: types.Content object with parts
        
    Returns:
        Extracted text or None if not found
    """
    if not new_message:
        return None
    
    try:
        # Check if message has parts attribute
        if not hasattr(new_message, 'parts'):
            return None
        
        # Iterate through parts to find text
        for part in new_message.parts:
            if hasattr(part, 'text') and part.text:
                return part.text
        
        return None
    except Exception as e:
        # Graceful fallback on any error
        print(f"Warning: Could not extract query text: {e}")
        return None


def sanitize_trace_name(text, max_length=100):
    """
    Clean and format text for use as trace name.
    
    - Strip whitespace
    - Replace newlines with spaces
    - Collapse multiple spaces
    - Truncate to max_length with "..."
    - Ensure non-empty result
    
    Args:
        text: Raw text to sanitize
        max_length: Maximum character length
        
    Returns:
        Sanitized trace name or None if input is empty
    """
    if not text:
        return None
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    if not text:
        return None
    
    # Replace newlines with spaces
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # Collapse multiple spaces into single space
    import re
    text = re.sub(r'\s+', ' ', text)
    
    # Truncate if needed
    if len(text) > max_length:
        text = text[:max_length].rstrip() + "..."
    
    return text


def generate_trace_name(default_name, query_text=None, trace_type=None):
    """
    Generate final trace name with fallback logic.
    
    Priority:
    1. Sanitized query_text if available
    2. default_name if query_text is None/empty
    
    Args:
        default_name: Fallback name (e.g., "RunnerExecution")
        query_text: Extracted query text
        trace_type: Original trace type for metadata (not used in name generation)
        
    Returns:
        Final trace name
    """
    if query_text:
        sanitized = sanitize_trace_name(query_text)
        if sanitized:
            return sanitized
    
    return default_name
