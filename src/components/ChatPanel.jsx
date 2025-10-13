import React, { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  getDocs,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  startAt,
  endAt,
  limit
} from 'firebase/firestore';

// A simple real-time chat panel backed by Firestore
export default function ChatPanel() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [peerEmail, setPeerEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Subscribe to chats for the current user
  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by updatedAt desc
      list.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
      setChats(list);
      // Auto-select first chat if none selected
      if (!activeChatId && list.length > 0) setActiveChatId(list[0].id);
    });
    return () => unsub();
  }, [user]);

  // Subscribe to messages of the active chat
  useEffect(() => {
    if (!activeChatId) { setMessages([]); return; }
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeChatId]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId) || null, [chats, activeChatId]);

  const ensureUserDocByEmail = async (email) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  };

  const startChatWithEmail = async () => {
    if (!user || !peerEmail) return;
    setCreating(true);
    try {
      const peer = await ensureUserDocByEmail(peerEmail);
      if (!peer) {
        alert('No user found with that email.');
        return;
      }
      await startChatWithUser(peer);
      setPeerEmail('');
    } finally {
      setCreating(false);
    }
  };

  const startChatWithUser = async (peer) => {
    if (!user || !peer?.id) return;
    const a = user.uid;
    const b = peer.id;
    if (a === b) {
      alert('You cannot start a chat with yourself.');
      return;
    }
    const [u1, u2] = [a, b].sort();
    const chatId = `${u1}_${u2}`;
    const chatRef = doc(db, 'chats', chatId);
    const existing = await getDoc(chatRef);
    if (!existing.exists()) {
      await setDoc(chatRef, {
        participants: [u1, u2],
        lastMessage: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setActiveChatId(chatId);
  };

  const sendMessage = async () => {
    if (!user || !activeChatId || !newMessage.trim()) return;
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');
    await addDoc(msgsRef, {
      senderId: user.uid,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });
    const chatRef = doc(db, 'chats', activeChatId);
    await updateDoc(chatRef, {
      lastMessage: newMessage.trim(),
      updatedAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  const styles = {
    container: { display: 'flex', height: 'calc(100vh - 8rem)', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
    left: { width: '320px', borderRight: '1px solid #E8F5E9', display: 'flex', flexDirection: 'column' },
    right: { flex: 1, display: 'flex', flexDirection: 'column' },
    header: { padding: '1rem 1.25rem', borderBottom: '1px solid #E8F5E9', fontWeight: 600 },
    chatItem: (active) => ({ display: 'flex', gap: '0.75rem', padding: '0.9rem 1.25rem', cursor: 'pointer', backgroundColor: active ? '#F1F8E9' : 'transparent', borderLeft: active ? '4px solid #4CAF50' : '4px solid transparent' }),
    chatName: { fontWeight: 600 },
    searchRow: { display: 'flex', gap: '0.5rem', padding: '0.75rem 0.75rem' },
    input: { flex: 1, border: '1px solid #C5E1A5', borderRadius: '8px', padding: '0.6rem' },
    button: { border: 'none', backgroundColor: '#4CAF50', color: '#FFFFFF', borderRadius: '8px', padding: '0.6rem 0.9rem', cursor: 'pointer' },
    peopleList: { overflowY: 'auto', maxHeight: '220px', borderTop: '1px solid #E8F5E9' },
    personRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', cursor: 'pointer' },
    personName: { fontWeight: 600 },
    msgs: { flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' },
    bubble: (own) => ({ alignSelf: own ? 'flex-end' : 'flex-start', backgroundColor: own ? '#4CAF50' : '#E8F5E9', color: own ? '#FFFFFF' : '#1B5E20', padding: '0.6rem 0.8rem', borderRadius: '14px', maxWidth: '70%' }),
    composer: { display: 'flex', gap: '0.5rem', borderTop: '1px solid #E8F5E9', padding: '0.75rem' },
  };

  const otherParticipantId = (chat) => {
    if (!user || !chat) return null;
    return chat.participants.find((p) => p !== user.uid) || null;
  };

  const [otherNames, setOtherNames] = useState({});
  useEffect(() => {
    (async () => {
      if (!user || chats.length === 0) return;
      const map = {};
      for (const c of chats) {
        const peerId = otherParticipantId(c);
        if (!peerId) continue;
        try {
          const uref = doc(db, 'users', peerId);
          const usnap = await getDoc(uref);
          map[peerId] = usnap.exists() ? (usnap.data().name || usnap.data().email || peerId) : peerId;
        } catch (_) {
          map[peerId] = peerId;
        }
      }
      setOtherNames(map);
    })();
  }, [user, chats]);

  // Search people by name/email
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!searchTerm || searchTerm.trim().length < 2) { setPeople([]); return; }
      const term = searchTerm.trim().toLowerCase();
      try {
        // Try prefix search on name (requires index)
        const q1 = query(collection(db, 'users'), orderBy('name'), startAt(searchTerm), endAt(searchTerm + '\uf8ff'), limit(10));
        const snap = await getDocs(q1);
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!cancelled) setPeople(arr);
      } catch (e) {
        // Fallback: read a small set and filter locally
        const snap = await getDocs(query(collection(db, 'users'), limit(25)));
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(u => (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term));
        if (!cancelled) setPeople(arr);
      }
    })();
    return () => { cancelled = true; };
  }, [searchTerm]);

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.header}>Chats</div>
        <div style={styles.searchRow}>
          <input placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.input} />
          <input placeholder="Start new by email" value={peerEmail} onChange={(e) => setPeerEmail(e.target.value)} style={styles.input} />
          <button style={styles.button} onClick={startChatWithEmail} disabled={creating || !peerEmail}>New</button>
        </div>
        {people.length > 0 && (
          <div style={styles.peopleList}>
            {people.map(p => (
              <div key={p.id} style={styles.personRow} onClick={() => startChatWithUser({ id: p.id })}>
                <div>
                  <div style={styles.personName}>{p.name || p.email || p.id}</div>
                  <div style={{ color: '#558B2F', fontSize: '0.85rem' }}>{p.email}</div>
                </div>
                <button style={styles.button} onClick={(e) => { e.stopPropagation(); startChatWithUser({ id: p.id }); }}>Message</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ overflowY: 'auto' }}>
          {chats.map((c) => {
            const peerId = otherParticipantId(c);
            const name = otherNames[peerId] || peerId;
            const active = c.id === activeChatId;
            return (
              <div key={c.id} style={styles.chatItem(active)} onClick={() => setActiveChatId(c.id)}>
                <div>
                  <div style={styles.chatName}>{name}</div>
                  <div style={{ color: '#558B2F', fontSize: '0.85rem', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage || 'No messages yet'}</div>
                </div>
              </div>
            );
          })}
          {chats.length === 0 && (
            <div style={{ padding: '0.75rem 1rem', color: '#558B2F' }}>No chats yet. Search or start one by email.</div>
          )}
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.header}>
          {activeChat ? 'Conversation' : 'Select a chat'}
        </div>
        <div style={styles.msgs}>
          {messages.map((m) => (
            <div key={m.id} style={styles.bubble(m.senderId === user?.uid)}>{m.text}</div>
          ))}
          {activeChat && messages.length === 0 && (
            <div style={{ color: '#558B2F' }}>Say hi and start the conversation.</div>
          )}
        </div>
        <div style={styles.composer}>
          <input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={styles.input}
            disabled={!activeChat}
          />
          <button style={styles.button} onClick={sendMessage} disabled={!activeChat || !newMessage.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
