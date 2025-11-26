# API Error Handling Fix

## Problem
Frontend was failing when API returned HTML error pages (404, 500, etc) instead of JSON.

## Solution
Updated `api()` function in script.js to:
1. Check Content-Type header before parsing JSON
2. Handle non-JSON responses gracefully
3. Provide clear error messages instead of silent failures

## Implementation
```javascript
const contentType = res.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  data = await res.json();
} else if (!res.ok) {
  const text = await res.text();
  data = { error: `Server error (${res.status}): ${text.substring(0, 100)}` };
}
```

## Result
- Better error logging
- Frontend continues to function even with server errors
- Users see clear error messages instead of silent failures
