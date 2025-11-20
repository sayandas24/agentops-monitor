# Pricing per 1M tokens (Gemini 2.0 Flash free tier is amazing!)
PRICING = {
    "gemini-2.0-flash": {
        "input": 0.0,   # FREE up to rate limits
        "output": 0.0,  # FREE up to rate limits
    },
    "gemini-1.5-flash": {
        "input": 0.0,
        "output": 0.0,
    },
    "gemini-1.5-pro": {
        "input": 1.25 / 1_000_000,
        "output": 5.0 / 1_000_000,
    },
    "gpt-4": {
        "input": 30.0 / 1_000_000,
        "output": 60.0 / 1_000_000,
    },
    "gpt-3.5-turbo": {
        "input": 0.5 / 1_000_000,
        "output": 1.5 / 1_000_000,
    },
}

def calculate_cost(model_name: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost based on model and token usage"""
    model_key = model_name.lower()
    
    # Find matching pricing
    for key in PRICING:
        if key in model_key:
            pricing = PRICING[key]
            input_cost = input_tokens * pricing["input"]
            output_cost = output_tokens * pricing["output"]
            return round(input_cost + output_cost, 6)
    
    return 0.0  # Unknown model defaults to free
