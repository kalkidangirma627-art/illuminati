/**
 * Illuminati.ethiopia - Application Database
 * Uses localStorage for persistence with cross-tab real-time sync via storage events.
 * Admin credentials: admin@illuminati.et / Admin@Illuminati2024
 */
const DB = (function () {
  const STORE_KEY = 'illuminati_db_v2';
  const SESSION_KEY = 'illuminati_session';

  const TASK_STAGES = [
    { key: 'documentLegitimacy', label: 'Document Legitimacy', color: '#ff942e', bg: '#fee4cb' },
    { key: 'identityVerification', label: 'Identity Verification', color: '#4f3ff0', bg: '#e9e7fd' },
    { key: 'biometricInfo', label: 'Biometric Info Storage', color: '#096c86', bg: '#d5deff' },
    { key: 'sendingDocuments', label: 'Sending Documents to HQ', color: '#df3670', bg: '#ffd3e2' },
    { key: 'paymentFinalized', label: 'Payment Finalized', color: '#34c471', bg: '#c8f7dc' }
  ];

  // Seed initial data if DB doesn't exist
  function seed() {
    return {
      users: [
        {
          id: 'admin_001',
          name: 'Supreme Admin',
          email: 'admin@illuminati.et',
          password: 'Admin@Illuminati2024',
          phone: '+251900000000',
          role: 'Admin',
          status: 'Approved',
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          agentId: null,
          notes: 'Primary administrator account. Do not remove.'
        },
        {
          id: 'agent_001',
          name: 'Agent Alpha',
          email: 'agent@illuminati.et',
          password: 'Agent@1234',
          phone: '+251911000001',
          role: 'Agent',
          status: 'Approved',
          photo: 'https://images.unsplash.com/photo-1543965170-4c01a586684e?w=150&q=80',
          agentId: null,
          notes: ''
        },
        {
          id: 'member_001',
          name: 'Jessica Haile',
          email: 'jessica@example.com',
          password: 'Member@1234',
          phone: '+251912000001',
          role: 'Member',
          status: 'Approved',
          photo: 'https://images.unsplash.com/photo-1533993192821-2cce3a8267d1?w=150&q=80',
          agentId: 'agent_001',
          notes: ''
        },
        {
          id: 'member_002',
          name: 'Mark David',
          email: 'mark@example.com',
          password: 'Member@5678',
          phone: '+251912000002',
          role: 'Member',
          status: 'Approved',
          photo: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80',
          agentId: 'agent_001',
          notes: ''
        },
        {
          id: 'member_003',
          name: 'Sara Tesfaye',
          email: 'sara@example.com',
          password: 'Member@9012',
          phone: '+251912000003',
          role: 'Member',
          status: 'Pending',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
          agentId: null,
          notes: 'Awaiting Admin approval.'
        }
      ],
      tasks: {
        'member_001': {
          documentLegitimacy: true,
          identityVerification: false,
          biometricInfo: false,
          sendingDocuments: false,
          paymentFinalized: false
        },
        'member_002': {
          documentLegitimacy: false,
          identityVerification: false,
          biometricInfo: false,
          sendingDocuments: false,
          paymentFinalized: false
        },
        'member_003': {
          documentLegitimacy: false,
          identityVerification: false,
          biometricInfo: false,
          sendingDocuments: false,
          paymentFinalized: false
        }
      },
      messages: [
        {
          id: 'msg_001',
          toMemberId: 'member_001',
          fromName: 'Agent Alpha',
          text: 'Your Document Legitimacy has been confirmed. Proceed to the next stage.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ]
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        const initial = seed();
        localStorage.setItem(STORE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('DB load error', e);
      return seed();
    }
  }

  function save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    // Notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY }));
    notifySubscribers(data);
  }

  // Subscription system
  let subscribers = [];
  function notifySubscribers(data) {
    subscribers.forEach(fn => { try { fn(data); } catch(e) {} });
  }
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY || e.key === null) {
      notifySubscribers(load());
    }
  });

  // ----- Session -----
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, role: user.role, name: user.name, photo: user.photo }));
  }
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  return {
    STAGES: TASK_STAGES,

    // ---- Auth ----
    login(emailOrPhone, password) {
      const db = load();
      const user = db.users.find(u =>
        (u.email === emailOrPhone || u.phone === emailOrPhone) &&
        u.password === password
      );
      if (!user) return { ok: false, error: 'Invalid credentials.' };
      if (user.status === 'Pending') return { ok: false, error: 'Your account is pending Admin approval.' };
      if (user.status === 'Suspended') return { ok: false, error: 'Your account has been suspended.' };
      setSession(user);
      return { ok: true, user };
    },
    logout() { clearSession(); window.location.href = 'login.html'; },
    getSession,
    requireAuth(expectedRole) {
      const s = getSession();
      if (!s) { window.location.href = 'login.html'; return null; }
      if (expectedRole && s.role !== expectedRole && s.role !== 'Admin') {
        window.location.href = 'login.html'; return null;
      }
      return s;
    },

    // ---- Users ----
    getUsers() { return load().users; },
    getUser(id) { return load().users.find(u => u.id === id); },
    getMembersByAgent(agentId) {
      return load().users.filter(u => u.role === 'Member' && u.agentId === agentId);
    },
    getAllMembers() { return load().users.filter(u => u.role === 'Member'); },
    getAllAgents() { return load().users.filter(u => u.role === 'Agent'); },
    updateUserStatus(userId, status) {
      const db = load();
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx > -1) { db.users[idx].status = status; save(db); return true; }
      return false;
    },
    assignAgentToMember(memberId, agentId) {
      const db = load();
      const idx = db.users.findIndex(u => u.id === memberId);
      if (idx > -1) { db.users[idx].agentId = agentId; save(db); return true; }
      return false;
    },
    registerMember(name, email, phone, password) {
      const db = load();
      if (db.users.find(u => u.email === email || u.phone === phone)) {
        return { ok: false, error: 'Email or phone already registered.' };
      }
      const newUser = {
        id: 'member_' + Date.now(),
        name, email, phone, password,
        role: 'Member', status: 'Pending',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
        agentId: null, notes: ''
      };
      const taskEntry = { documentLegitimacy: false, identityVerification: false, biometricInfo: false, sendingDocuments: false, paymentFinalized: false };
      db.users.push(newUser);
      db.tasks[newUser.id] = taskEntry;
      save(db);
      return { ok: true };
    },

    // ---- Tasks ----
    getTasks(memberId) {
      const db = load();
      return db.tasks[memberId] || { documentLegitimacy: false, identityVerification: false, biometricInfo: false, sendingDocuments: false, paymentFinalized: false };
    },
    setTask(memberId, taskKey, value, agentName) {
      const db = load();
      if (!db.tasks[memberId]) db.tasks[memberId] = {};
      db.tasks[memberId][taskKey] = value;
      // Auto-send a message when a task is checked
      if (value === true) {
        const stageLabel = TASK_STAGES.find(s => s.key === taskKey)?.label || taskKey;
        db.messages.push({
          id: 'msg_' + Date.now(),
          toMemberId: memberId,
          fromName: agentName || 'Agent',
          text: `✅ Stage completed: "${stageLabel}". Your file has been updated.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      save(db);
    },
    getMemberProgress(memberId) {
      const t = this.getTasks(memberId);
      const completed = Object.values(t).filter(v => v === true).length;
      return { completed, total: 5, percent: Math.round((completed / 5) * 100) };
    },

    // ---- Messages ----
    getMessagesForMember(memberId) {
      return load().messages.filter(m => m.toMemberId === memberId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    sendMessage(toMemberId, fromName, text) {
      const db = load();
      db.messages.push({ id: 'msg_' + Date.now(), toMemberId, fromName, text, timestamp: new Date().toISOString(), read: false });
      save(db);
    },

    // ---- Subscriptions ----
    subscribe(fn) {
      subscribers.push(fn);
      fn(load());
      return () => { subscribers = subscribers.filter(s => s !== fn); };
    }
  };
})();
