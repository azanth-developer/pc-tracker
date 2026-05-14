import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";

/**
 * A premium confirmation modal for deletion actions.
 */
export default function DeleteConfirmModal({ 
  isOpen, 
  title = "Confirm Deletion", 
  message = "This operation is categorized as irreversible.", 
  confirmText = "Delete Permanently",
  onConfirm, 
  onCancel, 
  isLoading 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-content"
            style={{
              maxWidth: "440px",
              padding: "2.5rem",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)"
            }}
          >
            <button 
              onClick={onCancel}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                color: "var(--text3)",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "rgba(239, 68, 68, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--danger)",
                  marginBottom: "1.5rem",
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.2)"
                }}
              >
                <ShieldAlert size={36} />
              </div>

              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "var(--text3)", lineHeight: 1.6, fontWeight: 500 }}>
                  {message}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.25rem", marginTop: "2.5rem" }}>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary"
                style={{ flex: 1, height: "54px" }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="btn-primary"
                style={{ 
                  flex: 1.5, 
                  height: "54px", 
                  background: "var(--danger)", 
                  boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)",
                  justifyContent: "center"
                }}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
