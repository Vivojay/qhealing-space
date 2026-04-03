import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';

const FAQ = [
  {
    patterns: ['hello', 'hi', 'hey', 'namaste', 'start', 'help'],
    reply: "Namaste 🙏 Welcome to Quantum Healing Space. I'm here to guide you. Are you exploring healing sessions, workshops, retreats — or do you have a specific question?"
  },
  {
    patterns: ['service', 'modality', 'offer', 'what do', 'healing', 'therapy', 'treat'],
    reply: "We offer 20+ modalities including Reiki, Deep Chakra Healing, Past Life Regression, Angel Therapy, Akashic Records, Hypnosis, Sound Therapy, EFT, Ho'oponopono, Ancestral Healing, and more. Any specific one you'd like to know about?"
  },
  {
    patterns: ['reiki'],
    reply: "Reiki channels universal life force energy to release blockages and restore balance across your physical, emotional, and spiritual bodies. Sessions are 60–90 min, available in-person or online."
  },
  {
    patterns: ['chakra'],
    reply: "Deep Chakra Healing works on your 7 energy centers — each linked to organs, nerve plexuses, and emotional states. Balancing these can bring profound shifts in physical and spiritual wellbeing."
  },
  {
    patterns: ['akashic', 'record'],
    reply: "Akashic Records are the vibrational archive of every soul's journey — past, present, and future. Accessing your records can reveal deep patterns, karmic threads, and hidden wisdom guiding your current life."
  },
  {
    patterns: ['past life', 'regression', 'past birth'],
    reply: "Past Life Regression uses hypnosis to recover memories from previous incarnations, helping resolve relationship patterns, unexplained fears, phobias, and chronic illnesses that have karmic roots."
  },
  {
    patterns: ['price', 'cost', 'charge', 'fee', 'how much', 'rate'],
    reply: "Consultation: ₹1,000 for Indian nationals · USD 3 for others\nIn-person booking deposit: ₹500 · USD 3 (adjusted in final payment)\nDistance sessions require full payment 24 hrs in advance."
  },
  {
    patterns: ['book', 'appointment', 'schedule', 'session', 'register'],
    reply: "To book a session:\n📞 WhatsApp / Call: +91 9267904256\n✉️ vartikashukla@xyz.com\n\nIn-person: Sector 56, Gurugram\nOnline: WhatsApp / Skype by appointment"
  },
  {
    patterns: ['online', 'distance', 'remote', 'skype', 'whatsapp'],
    reply: "Yes — both in-person and distance healing are equally effective. Online sessions are conducted via WhatsApp or Skype, strictly by prior appointment."
  },
  {
    patterns: ['retreat'],
    reply: "Our retreats include:\n• Stress Busting Retreat\n• Silent Meditation & Yoga\n• Chakra Balancing\n• Spiritual Healing\n• Reiki Healing\n• Forgiveness Retreat\n\nEach is a deeply transformative immersive experience. Want details on any?"
  },
  {
    patterns: ['workshop'],
    reply: "We conduct regular workshops on Reiki, Chakra Healing, Past Life Regression, Angel Therapy, EFT, Meditation, Tarot, and more — both in-person and online."
  },
  {
    patterns: ['corporate', 'company', 'organization', 'team', 'office', 'workplace'],
    reply: "Our corporate programs integrate spiritual practices into organizational culture — focusing on stress management, change management, and team wellbeing. Previous clients include SmartAnalyst."
  },
  {
    patterns: ['vartika', 'founder', 'about', 'who are', 'guide'],
    reply: "Quantum Healing Space is guided by Vartika Shukla — a healer, hypnotherapist, life coach, and holistic practitioner with innate intuitive abilities. She empowers people toward Personal, Professional & Spiritual growth."
  },
  {
    patterns: ['contact', 'reach', 'phone', 'email', 'address', 'location', 'where'],
    reply: "📍 Sector 56, Gurugram – 122011\n📞 +91 9267904256\n📞 +91 9819962635\n✉️ vartikashukla@xyz.com\n📸 @quantum_healingspace"
  },
  {
    patterns: ['payment', 'pay', 'transfer', 'paytm', 'paypal', 'bank'],
    reply: "Payment options:\n• Bank Transfer (HDFC): A/C 02931140001114, IFSC HDFC0000293\n• Paytm: 9819962635\n• PayPal: vartikashukla2000@yahoo.com\n• Any other convenient mode"
  },
  {
    patterns: ['child', 'kid', 'children', 'young'],
    reply: "We have specialised healing workshops for children addressing aggression, attention deficit, and concentration issues — using creative methods like art, clay modeling, and movement therapy."
  },
];

function getReply(input) {
  const lower = input.toLowerCase();
  for (const item of FAQ) {
    if (item.patterns.some(p => lower.includes(p))) {
      return item.reply;
    }
  }
  return "Thank you for reaching out. For personalised guidance, please contact Vartika directly:\n📞 +91 9267904256\n✉️ vartikashukla@xyz.com";
}

const INITIAL_MESSAGE = {
  id: 0,
  from: 'bot',
  text: "Namaste 🙏 I'm your guide to Quantum Healing Space. Ask me about our healing modalities, retreats, workshops, booking, or anything else.",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(text);
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
    }, 700 + Math.random() * 400);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 lg:right-8 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', zIndex: 9000 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>QHS Guide</p>
                  <p className="text-[10px]" style={{ color: 'var(--fg3)' }}>Quantum Healing Space</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:opacity-60 transition-opacity">
                <X className="w-4 h-4" style={{ color: 'var(--fg2)' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[320px] overflow-y-auto px-4 py-4 space-y-3" data-lenis-prevent>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-xl text-xs font-light leading-relaxed whitespace-pre-line"
                    style={{
                      background: msg.from === 'user' ? 'var(--fg3)' : 'var(--bg3)',
                      color: 'var(--fg)',
                      borderRadius: msg.from === 'user' ? '1rem 1rem 0.3rem 1rem' : '1rem 1rem 1rem 0.3rem',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1.5 px-4 py-3 w-16 rounded-xl"
                  style={{ background: 'var(--bg3)', borderRadius: '1rem 1rem 1rem 0.3rem' }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--fg3)' }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex gap-3 items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-xs outline-none font-light placeholder:opacity-30"
                style={{ color: 'var(--fg)' }}
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity disabled:opacity-20"
                style={{ background: 'var(--fg3)' }}
              >
                <Send className="w-3.5 h-3.5" style={{ color: 'var(--fg)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-5 right-5 lg:right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'var(--fg)', zIndex: 9000 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
