'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Upload, Paperclip } from 'lucide-react';
import styles from './page.module.css';

interface Msg {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function SupportPage() {
  const [tab, setTab] = useState<'chat' | 'ticket'>('chat');
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '1', sender: 'ai', text: "Hey! 👋 I'm your Accra Threads AI Stylist. Ask me anything — outfit ideas, size advice, or what's trending in Accra right now." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMsgs(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setInput('');
    setIsTyping(true);
    
    // Mock AI response
    setTimeout(() => {
      setMsgs(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        sender: 'ai', 
        text: "That's a great match! The Kente Bomber goes perfectly with those joggers. Need any size recommendations before you add to cart?" 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={styles.page}>
      
      <div className={styles.header}>
        <h1 className="font-display text-4xl">Support & Styling</h1>
        <p className="text-secondary" style={{ marginTop: '12px' }}>Talk to our AI stylist or open a direct ticket.</p>
      </div>

      <div className={styles.layout}>
        {/* Support Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.nav}>
            <button className={`${styles.navItem} ${tab === 'chat' ? styles.active : ''}`} onClick={() => setTab('chat')}>
               <span className={styles.navIcon}>✨</span> AI Stylist
            </button>
            <button className={`${styles.navItem} ${tab === 'ticket' ? styles.active : ''}`} onClick={() => setTab('ticket')}>
               <span className={styles.navIcon}>🎫</span> Submit Ticket
            </button>
          </div>

          <div className={styles.faqBlock}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>FAQ</h3>
            <div className="accordion-item">
              <button className="accordion-trigger">How do sizes run?</button>
            </div>
            <div className="accordion-item">
              <button className="accordion-trigger">Where do you deliver?</button>
            </div>
             <div className="accordion-item">
              <button className="accordion-trigger">Cowrie Points rules?</button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className={styles.content}>
          
          {tab === 'chat' && (
            <div className={styles.chatBox}>
               <div className={styles.chatHeader}>
                 <div className={styles.chatAvatar}>AI</div>
                 <div>
                   <h3 style={{ fontSize: '1rem' }}>Accra Stylist</h3>
                   <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <span className={styles.dotOnline} /> Online
                   </span>
                 </div>
               </div>

               <div className={styles.chatBody}>
                  {msgs.map(m => (
                    <div key={m.id} className={`chat-bubble ${m.sender === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai'}`} style={{ marginBottom: '16px' }}>
                      {m.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="typing-indicator" style={{ marginBottom: '16px' }}>
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  )}
                  <div ref={endRef} />
               </div>

               <div className={styles.chatPrompts}>
                   <button className="prompt-chip" onClick={() => handleSend("What do you recommend for Detty December?")}>Detty December picks?</button>
                   <button className="prompt-chip" onClick={() => handleSend("Is the Adinkra Hoodie true to size?")}>Hoodie sizing?</button>
               </div>

               <div className={styles.chatInputWrap}>
                 <button className={styles.attachBtn}><Paperclip size={20}/></button>
                 <input 
                   type="text" 
                   value={input} 
                   onChange={e => setInput(e.target.value)} 
                   placeholder="Ask me anything..." 
                   className={styles.chatInput}
                   onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
                 />
                 <button className={styles.sendBtn} onClick={() => handleSend(input)}><Send size={18}/></button>
               </div>
            </div>
          )}

          {tab === 'ticket' && (
             <div className={styles.ticketBox}>
               <h2 className="text-2xl" style={{ marginBottom: '8px' }}>Open a Ticket</h2>
               <p className="text-secondary" style={{ marginBottom: '32px' }}>We aim to respond to all inquiries within 24 hours.</p>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                 <div>
                   <label className="input-label">Name</label>
                   <input type="text" className="input-field" placeholder="Kofi Mensah" />
                 </div>
                 <div>
                   <label className="input-label">Email</label>
                   <input type="email" className="input-field" placeholder="kofi@example.com" />
                 </div>
               </div>

               <div style={{ marginBottom: '24px' }}>
                   <label className="input-label">Topic</label>
                   <select className="input-field input-select">
                     <option>Order Status</option>
                     <option>Returns & Exchanges</option>
                     <option>Styling Advice</option>
                     <option>Other</option>
                   </select>
               </div>

               <div style={{ marginBottom: '24px' }}>
                   <label className="input-label">Message</label>
                   <textarea className="input-field" rows={5} placeholder="How can we help?" style={{ resize: 'vertical' }}></textarea>
               </div>

               <button className="btn btn-primary btn-lg">Submit Ticket</button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
