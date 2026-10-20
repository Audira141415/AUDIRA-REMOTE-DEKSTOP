# Rendezvous & Relay Framing Protocol Reference

## 1. Network Architecture
AUDIRA employs a hybrid connection architecture:
1. **Direct P2P via STUN/Hole-Punching:** Peers register with rendezvous server (`hbbs`), exchange public and local IP/port candidates, and probe UDP sockets to punch through NAT firewalls.
2. **Encrypted Relay Fallback (`hbbr`):** If symmetric NAT prevents direct connection, both peers establish outgoing TLS/TCP tunnels to a relay server.

## 2. Packet Framing Format
Each rendezvous message begins with a 4-byte big-endian length prefix followed by a Protobuf payload:
```
+-------------------+-------------------------------+
|  Length (4 Bytes) |  Protobuf Payload (N Bytes)   |
+-------------------+-------------------------------+
```
- Magic header for rendezvous UDP ping: `0x52, 0x55, 0x53, 0x54` ("RUST").
