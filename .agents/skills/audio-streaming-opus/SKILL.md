---
name: audio-streaming-opus
description: Audio loopback capture implementation (Windows WASAPI loopback, Linux PulseAudio/ALSA) and real-time Opus codec encoding and jitter buffer management.
---

# Audio Streaming & Opus Pipeline Skill

This skill provides implementation details for capturing host desktop audio and streaming it with ultra-low latency using the Opus audio codec.

## 1. Platform Audio Loopback Capture
- **Windows:** WASAPI Audio Client initialized in `AUDCLNT_STREAMFLAGS_LOOPBACK` mode on the default multimedia rendering device (`eRender, eMultimedia`).
- **Linux:** PulseAudio monitor source (e.g. `*.monitor`) or PipeWire audio node capture.
- **macOS:** CoreAudio audio tap / virtual audio device.

## 2. Opus Encoder Parameters
- **Sampling Rate:** 48,000 Hz (48 kHz).
- **Channels:** Stereo (2 channels) or Mono (1 channel).
- **Frame Duration:** 20 ms (960 PCM samples per frame).
- **Application Mode:** `OPUS_APPLICATION_RESTRICTED_LOWDELAY` or `OPUS_APPLICATION_VOIP`.
- **Bitrate:** 32 kbps to 64 kbps (dynamic adaptation based on network conditions).

## 3. Client Jitter Buffer
On the receiving client:
- Maintain an adaptive jitter buffer of 20–40ms.
- If jitter buffer underruns, feed PLC (Packet Loss Concealment) frames to the Opus decoder instead of cutting audio abruptly.
