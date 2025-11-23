"""Test edge cases for descriptive trace names"""
from agentops_monitor.name_utils import extract_query_from_message, sanitize_trace_name, generate_trace_name

# Mock message class for testing
class MockPart:
    def __init__(self, text):
        self.text = text

class MockMessage:
    def __init__(self, text):
        self.parts = [MockPart(text)]

print("Testing edge cases for trace name sanitization:\n")

# Test 1: Empty/None message
print("1. Empty/None message:")
result = generate_trace_name("RunnerExecution", query_text=None)
print(f"   Input: None")
print(f"   Output: {result}")
print(f"   Expected: RunnerExecution")
print(f"   ✓ PASS" if result == "RunnerExecution" else f"   ✗ FAIL")
print()

# Test 2: Very long query (>100 chars)
print("2. Very long query (>100 chars):")
long_query = "This is a very long question that exceeds the maximum character limit and should be truncated with ellipsis at the end to keep the trace name manageable"
result = sanitize_trace_name(long_query)
print(f"   Input length: {len(long_query)} chars")
print(f"   Output: {result}")
print(f"   Output length: {len(result)} chars")
print(f"   ✓ PASS" if len(result) <= 103 and result.endswith("...") else f"   ✗ FAIL")
print()

# Test 3: Query with newlines
print("3. Query with newlines:")
newline_query = "What is\nthe capital\nof India?"
result = sanitize_trace_name(newline_query)
print(f"   Input: {repr(newline_query)}")
print(f"   Output: {result}")
print(f"   Expected: What is the capital of India?")
print(f"   ✓ PASS" if result == "What is the capital of India?" else f"   ✗ FAIL")
print()

# Test 4: Query with multiple consecutive spaces
print("4. Query with multiple consecutive spaces:")
spaces_query = "What  is   the    capital     of India?"
result = sanitize_trace_name(spaces_query)
print(f"   Input: {repr(spaces_query)}")
print(f"   Output: {result}")
print(f"   Expected: What is the capital of India?")
print(f"   ✓ PASS" if result == "What is the capital of India?" else f"   ✗ FAIL")
print()

# Test 5: Query with leading/trailing whitespace
print("5. Query with leading/trailing whitespace:")
whitespace_query = "   What is the capital of India?   "
result = sanitize_trace_name(whitespace_query)
print(f"   Input: {repr(whitespace_query)}")
print(f"   Output: {result}")
print(f"   Expected: What is the capital of India?")
print(f"   ✓ PASS" if result == "What is the capital of India?" else f"   ✗ FAIL")
print()

# Test 6: Extract from mock message
print("6. Extract from mock message:")
mock_msg = MockMessage("What is AI?")
result = extract_query_from_message(mock_msg)
print(f"   Input: MockMessage with text='What is AI?'")
print(f"   Output: {result}")
print(f"   Expected: What is AI?")
print(f"   ✓ PASS" if result == "What is AI?" else f"   ✗ FAIL")
print()

# Test 7: Combined test - newlines + spaces + whitespace
print("7. Combined: newlines + spaces + whitespace:")
combined_query = "  What  is\n\nthe   capital\n  of   India?  "
result = sanitize_trace_name(combined_query)
print(f"   Input: {repr(combined_query)}")
print(f"   Output: {result}")
print(f"   Expected: What is the capital of India?")
print(f"   ✓ PASS" if result == "What is the capital of India?" else f"   ✗ FAIL")
print()

print("All edge case tests completed!")
