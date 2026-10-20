# DXGI Desktop Duplication Architecture Reference

## 1. Overview
The DirectX Graphics Infrastructure (DXGI) Desktop Duplication API provides high-speed, hardware-accelerated access to desktop frame surfaces directly from GPU video memory (VRAM).

## 2. API Interface Contract (`IDXGIOutputDuplication`)

### Primary Acquisition Sequence
1. **`IDXGIOutput1::DuplicateOutput`**: Initializes the desktop duplication interface for a specific display output.
2. **`IDXGIOutputDuplication::AcquireNextFrame`**:
   - Parameters:
     - `TimeoutInMilliseconds`: Typically set between 20ms to 50ms.
     - `pFrameInfo`: Returns `DXGI_OUTDUPL_FRAME_INFO` containing:
       - `TotalMetadataBufferSize`: Non-zero if dirty rects or move rects exist.
       - `AccumulatedFrames`: Number of frames composited by DWM since last acquisition.
       - `LastPresentTime`: High-resolution QPC timestamp.
   - Return Codes:
     - `S_OK`: Frame acquired successfully.
     - `DXGI_ERROR_WAIT_TIMEOUT`: No desktop changes occurred within the timeout interval. Normal behavior; do not treat as an error.
     - `DXGI_ERROR_ACCESS_LOST`: Desktop mode changed, resolution altered, or UAC secure desktop activated. Requires interface release and re-instantiation.
3. **`IDXGIOutputDuplication::ReleaseFrame`**: Must be invoked immediately after texture copy to allow Windows Desktop Window Manager (DWM) to proceed with rendering.

## 3. Dirty Rect Optimization
To minimize memory bandwidth and video encoding overhead:
- Retrieve `DXGI_OUTDUPL_FRAME_INFO::TotalMetadataBufferSize`.
- Call `IDXGIOutputDuplication::GetFrameDirtyRects` to extract changed `RECT` bounds.
- Pass only updated bounding boxes to the video frame preprocessor or encode full frame if dirty area exceeds 70% of screen.
