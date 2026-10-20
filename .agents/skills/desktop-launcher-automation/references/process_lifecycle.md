# Desktop Launcher & Process Lifecycle Reference

## 1. Process Lifecycle States
- **Stopped:** No `audira.exe` or background service daemon is active.
- **Service Mode:** Windows service daemon running with system rights (`NT AUTHORITY\SYSTEM`), listening on local named pipe.
- **User Session Host:** Desktop GUI running in active interactive console session (Session 1), capturing desktop and responding to rendezvous mediator.
- **Client Session:** Remote window opened connecting to peer.

## 2. Port Binding & Graceful Teardown
- Launcher scripts (`start.bat` / `scripts/start.ps1`) check for listening port conflicts (Rendezvous UDP 21116, Relay TCP 21117).
- Cleanup scripts (`stop.bat` / `scripts/stop.ps1`) send graceful termination signals before fallback killing processes.
