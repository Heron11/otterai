# Image Upload Feature Documentation

## Overview

The image upload feature allows users to send images alongside text prompts to Claude, leveraging Claude's vision capabilities for image analysis, UI design feedback, debugging visual issues, and more.

## Features

- **Multiple Image Upload**: Upload up to 5 images per message
- **Drag & Drop Support**: Easy file selection via file picker
- **Format Support**: JPEG, PNG, GIF, WebP (as per Claude API requirements)
- **Size Limit**: 5MB per image (Claude API limit)
- **Image Preview**: See thumbnails before sending
- **Remove Images**: Click X on hover to remove individual images
- **Visual Feedback**: Toast notifications for upload status and errors
- **Disabled During Streaming**: Prevents uploads while AI is responding

## User Interface

### Image Upload Button
- **Location**: Bottom row of chat input, next to voice button
- **Appearance**: Circular button with image icon
- **States**:
  - Default: Grey with hover effect (turns orange #e86b47)
  - Processing: Spinning loader icon
  - Disabled: Greyed out during streaming

### Image Previews
- **Location**: Above textarea, below any previous messages
- **Display**: Horizontal scrollable row of thumbnails
- **Size**: 80x80px thumbnails with object-fit cover
- **Features**:
  - Filename displayed on hover
  - Remove button (X) appears on hover
  - Orange border on hover (#e86b47)
  - 2px border by default

## Technical Implementation

### Components Created

1. **ImageUploadButton.tsx**
   - Handles file selection and validation
   - Converts images to base64
   - Enforces size and format limits
   - Shows loading state during processing

2. **Updated Chat.client.tsx**
   - Manages image upload state
   - Integrates with message sending
   - Clears images after sending

3. **Updated BaseChat.tsx**
   - Displays image previews
   - Renders upload button
   - Passes props to child components

4. **Updated UserMessage.tsx**
   - Renders images in user messages
   - Supports multimodal content (text + images)
   - Displays images before text content

5. **Updated stream-text.ts**
   - Updated type definitions for multimodal content
   - Supports both string and array content

### Message Format

#### Text-Only Message
```typescript
{
  role: 'user',
  content: 'This is a text message'
}
```

#### Multimodal Message (Text + Images)
```typescript
{
  role: 'user',
  content: [
    {
      type: 'image',
      image: 'base64EncodedString',
      mimeType: 'image/jpeg'
    },
    {
      type: 'image',
      image: 'base64EncodedString',
      mimeType: 'image/png'
    },
    {
      type: 'text',
      text: 'What do you think of these designs?'
    }
  ]
}
```

### API Integration

The Vercel AI SDK's `convertToCoreMessages` function automatically converts our multimodal format to Claude's expected format:

```typescript
// Our format
{ type: 'image', image: 'base64...', mimeType: 'image/jpeg' }

// Claude API format (handled automatically by Vercel AI SDK)
{
  type: 'image',
  source: {
    type: 'base64',
    media_type: 'image/jpeg',
    data: 'base64...'
  }
}
```

## Usage Examples

### Example 1: Design Feedback
1. Click the image upload button (📷 icon)
2. Select a screenshot of your UI
3. Type: "How can I improve this design?"
4. Send - Claude analyzes the image and provides feedback

### Example 2: Bug Debugging
1. Upload screenshot(s) showing the bug
2. Type: "I'm seeing this error, what's wrong?"
3. Claude examines the visual context and helps debug

### Example 3: Multiple Images Comparison
1. Upload 2-5 images
2. Type: "Which of these layouts works best?"
3. Claude compares and provides recommendations

## Validation & Error Handling

### Client-Side Validation
- **File Type**: Only JPEG, PNG, GIF, WebP accepted
- **File Size**: Maximum 5MB per image
- **File Count**: Maximum 5 images per message

### Error Messages
- "Unsupported format. Use JPG, PNG, GIF, or WebP."
- "File too large. Maximum 5MB per image."
- "Failed to process [filename]"

### Success Feedback
- "1 image uploaded" (single image)
- "3 images uploaded" (multiple images)

## Limitations

### Per Claude Vision API
- **Max Image Size**: 5MB per image
- **Max Resolution**: 8000x8000px (or 2000x2000px if sending >20 images)
- **Optimal Size**: 1092x1092px (~1.15 megapixels)
- **People Identification**: Claude cannot identify people by name
- **Accuracy**: May struggle with very small text or rotated images

### Application Limits
- **Max Images Per Message**: 5 (configurable in ImageUploadButton)
- **Supported Formats**: JPEG, PNG, GIF, WebP only
- **No Video**: Only static images supported

## Cost Considerations

Images are tokenized based on their size:
- ~1,600 tokens per optimally-sized image (1092x1092px)
- Approximate cost: $4.80 per 1,000 images (at $3/M tokens)
- Larger images cost more tokens after resizing

**Tip**: Resize images to ~1092x1092px before uploading for optimal cost and performance.

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Safari**: Full support ✅
- **Firefox**: Full support ✅
- **Mobile Browsers**: Full support ✅

All modern browsers support the File API and base64 encoding required for this feature.

## Future Enhancements

Potential improvements:
- [ ] Drag & drop directly onto textarea
- [ ] Paste images from clipboard
- [ ] Image compression before upload
- [ ] Preview full-size image on click
- [ ] Support for image URLs (already supported by Claude API)
- [ ] Batch image processing feedback
- [ ] Image annotation/markup before sending

## Related Files

- `app/components/chat/ImageUploadButton.tsx` - Main upload component
- `app/components/chat/Chat.client.tsx` - State management
- `app/components/chat/BaseChat.tsx` - UI integration
- `app/components/chat/UserMessage.tsx` - Message rendering
- `app/lib/.server/llm/stream-text.ts` - Type definitions
- `app/routes/api.chat.ts` - API endpoint

## References

- [Claude Vision API Documentation](https://docs.claude.com/en/docs/build-with-claude/vision)
- [Vercel AI SDK - Multimodal Messages](https://sdk.vercel.ai/docs/ai-sdk-core/multimodal-messages)
- [Web File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)

