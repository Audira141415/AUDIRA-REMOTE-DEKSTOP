//! Reference Example: UDP NAT Traversal Probing Pattern
//! Used in `src/rendezvous_mediator.rs` for peer-to-peer punching.

use std::net::SocketAddr;
use std::time::Duration;

pub enum NatType {
    FullCone,
    RestrictedCone,
    PortRestrictedCone,
    Symmetric,
}

pub struct UdpPuncher {
    pub local_addr: SocketAddr,
    pub remote_peer_candidates: Vec<SocketAddr>,
}

impl UdpPuncher {
    pub fn new(local_addr: SocketAddr, candidates: Vec<SocketAddr>) -> Self {
        Self {
            local_addr,
            remote_peer_candidates: candidates,
        }
    }

    /// Sends UDP probing packets concurrently to peer candidates
    pub fn build_probe_payload(session_id: u64) -> Vec<u8> {
        let mut packet = Vec::with_capacity(16);
        packet.extend_from_slice(b"AUDP"); // Audira UDP Probe magic
        packet.extend_from_slice(&session_id.to_le_bytes());
        packet
    }
}
