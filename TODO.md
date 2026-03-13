# Snap Page Enhancement Implementation

## Plan
- [x] Modify Camera.tsx to show filters directly at bottom (no toggle button)
- [x] Modify Snap.tsx to store snap history as objects with captions
- [x] Add localStorage persistence for snap history
- [x] Add Edit/Delete functionality to history snaps
- [x] Add "Edit Snap" button on preview

## Implementation Steps
1. ✅ Update Camera.tsx - show filters directly at bottom without toggle button
2. ✅ Update Snap.tsx - change snapHistory type to objects with image and caption
3. ✅ Add useEffect to load snap history from localStorage on mount
4. ✅ Update sendSnapAsStory to save snaps with captions as objects
5. ✅ Update history click handler to load image and caption
6. ✅ Update history map to use snap.image
7. ✅ Add Edit Snap button on preview screen
8. ✅ Add Delete and Edit Caption functionality on history cards

