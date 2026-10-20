//! Reference Example: Safe File System Path Resolver & Traversal Prevention
//! Used by `libs/base/src/fs.rs` in AUDIRA Remote Desktop.

use std::path::{Path, PathBuf};

pub struct SafeFsResolver {
    base_directory: PathBuf,
}

impl SafeFsResolver {
    pub fn new(base_dir: impl AsRef<Path>) -> std::io::Result<Self> {
        let canonical_base = std::fs::canonicalize(base_dir)?;
        Ok(Self {
            base_directory: canonical_base,
        })
    }

    /// Resolves requested relative path securely within the sandbox boundary
    pub fn resolve_path(&self, user_requested_path: &str) -> Result<PathBuf, String> {
        let raw_path = Path::new(user_requested_path);

        // Disallow absolute drive roots or prefix leaps
        if raw_path.has_root() || raw_path.is_absolute() {
            return Err("Absolute path manipulation rejected".to_string());
        }

        // Check for manual directory climbing segments
        for component in raw_path.components() {
            if let std::path::Component::ParentDir = component {
                return Err("Path traversal (..) forbidden".to_string());
            }
        }

        let combined = self.base_directory.join(raw_path);
        
        // Canonicalize candidate if it exists
        if combined.exists() {
            let canonical_target = std::fs::canonicalize(&combined)
                .map_err(|e| format!("Failed to canonicalize path: {}", e))?;
            
            if !canonical_target.starts_with(&self.base_directory) {
                return Err("Target escapes sandbox boundary".to_string());
            }
            Ok(canonical_target)
        } else {
            // For new file creation, ensure parent is safely bounded
            if let Some(parent) = combined.parent() {
                if parent.exists() {
                    let canonical_parent = std::fs::canonicalize(parent)
                        .map_err(|e| format!("Parent canonicalize error: {}", e))?;
                    if !canonical_parent.starts_with(&self.base_directory) {
                        return Err("Parent directory escapes sandbox boundary".to_string());
                    }
                }
            }
            Ok(combined)
        }
    }
}
