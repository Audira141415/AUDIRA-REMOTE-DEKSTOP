# Audio Streaming & WASAPI Loopback Pipeline Reference

## 1. WASAPI Architecture (Windows Audio Session API)
AUDIRA captures system audio output on the host using the `AUDCLNT_STREAMFLAGS_LOOPBACK` flag.

### Initialization Workflow:
1. `CoInitializeEx(None, COINIT_MULTITHREADED)`.
2. Instantiate `IMMDeviceEnumerator` and obtain default audio endpoint (`eRender, eMultimedia`).
3. Activate `IAudioClient` and query `GetMixFormat`.
4. Initialize Audio Client with:
   - `ShareMode: AUDCLNT_SHAREMODE_SHARED`
   - `StreamFlags: AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_EVENTCALLBACK`
5. Obtain `IAudioCaptureClient` to drain PCM packet buffers.

## 2. Opus Encoder Parameters
- **Sample Rate:** 48,000 Hz.
- **Channels:** 2 (Stereo).
- **Frame Size:** 20ms (960 samples per channel).
- **Application Mode:** `OPUS_APPLICATION_RESTRICTED_LOWDELAY`.
- **Bitrate:** Variable Bitrate (VBR), 48 kbps target.
- **Silence Suppression:** When client reports zero audio amplitude (mute/silent desktop), transmit empty ping or comfort noise frame instead of full payload.
