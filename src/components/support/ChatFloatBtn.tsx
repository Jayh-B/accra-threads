'use client';
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import styles from './ChatFloatBtn.module.css';

export default function ChatFloatBtn() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="chat-float-btn" onClick={() => setOpen(true)} aria-label="Open AI Stylist">
        <MessageCircle size={24} />
      </button>
      {open && (
        <div className={styles.miniChat}>
          <div className={styles.miniHeader}>
            <div className={styles.miniTitle}>
              <span className={styles.miniDot} />
              <strong>Accra AI Stylist</strong>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}><X size={16}/></button>
          </div>
          <div className={styles.miniBody}>
            <div className="chat-bubble chat-bubble--ai">
              Hey! 👋 I&apos;m your Accra Threads AI Stylist. Ask me anything — outfit ideas, size advice, what&apos;s trending in Accra right now.
            </div>
          </div>
          <div className={styles.miniFooter}>
            <a href="/support" className="prompt-chip">Go to full chat →</a>
          </div>
        </div>
      )}
    </>
  );
}
