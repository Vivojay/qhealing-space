# Combined Healings - System Design Implementation

## Problem
QR code payment amount desync when user changes wish selection after clicking checkout - critical financial/security issue.

## Solution Overview
Multi-layer approach ensuring **zero staleness**:

### Backend Changes (`backend/main.py`)
1. **Request ID Versioning**: Each checkout request gets unique `request_id`
2. **Stale Detection**: Reject requests where stored ID ≠ incoming ID
3. **Atomic Session Management**: Delete old session → Create new session with updated amount
4. **Dynamic QR Generation**: QR URL embeds current `amount` and `session_id`
5. **Response Tracking**: Return `request_id` in session response for validation

### Frontend Changes (`src/pages/CombinedHealings.jsx`)
1. **AbortController Pattern**: Cancel in-flight requests when selection changes
2. **Debounced Refresh (250ms)**: Prevent API spam on rapid selections
3. **Multi-Ref State Tracking**: 
   - `isApiCallInProgressRef` - prevent concurrent calls
   - `checkoutJustCreated` - skip checks after creation
   - Request ID validation - discard stale responses
4. **Immediate QR Clear**: Reset QR before new request (no stale display)
5. **Load Tracking**: `initialLoadCompleteRef` - skip validation pre-load

## Flow
```
User deselects wish → 
  1. Immediate QR clear (no stale display) →
  2. 250ms debounce →
  3. AbortController cancels pending request →
  4. New POST with current selected_wish_ids + request_id →
  5. Backend: validates request_id, creates new session →
  6. Returns fresh QR with current amount →
  7. Frontend: validates request_id matches →
  8. Updates UI with new QR
```

## Key Safety Features
- ✅ Zero window for stale QR display
- ✅ Request ID validation prevents response/reality mismatch
- ✅ AbortController prevents race conditions
- ✅ Debounce prevents API spam
- ✅ Backend atomic operations (delete + create)
- ✅ Dynamic QR amounts tied to current selection
