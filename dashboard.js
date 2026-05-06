let currentUser = null;
let rawData = []; 
let currentChatPartnerId = null;
let chatInterval = null;

const ICON_MAP = {
  FileCheck: 'file-check',
  Fingerprint: 'fingerprint',
  Banknote: 'banknote',
  Building2: 'building-2',
  CreditCard: 'credit-card'
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('AGENT_LOG: Dashboard Booting...');
  initTheme(); // Run theme first for instant response
  await checkAuth();
  initLucide();
  initProfileModal();
  initSearch();
  startNotificationPolling();
});

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';
  try {
     const res = await fetch(`${API_BASE}/api/user/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('Auth failed');
    const user = await res.json();
    
    // NORMALIZE USER OBJECT
    currentUser = { ...user, id: user.id || user._id };
    console.log('AGENT_LOG: Auth Sync Success. UserID:', currentUser.id);

    document.getElementById('user-name-display').textContent = currentUser.name;
    document.getElementById('user-balance-val').textContent = (currentUser.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('user-role-badge').textContent = currentUser.role;
    updateAvatar();
    
    const role = (currentUser.role || '').toLowerCase().trim();
    if (role === 'agent') { 
      setupAgentUI(); 
    } else { 
      // AUTO-SET PARTNER FOR MEMBER
      currentChatPartnerId = currentUser.assignedAgentId || 'agent_id';
      console.log('AGENT_LOG: Member Chat Locked to Agent:', currentChatPartnerId);
      setupMemberUI(); 
    }
    
    document.getElementById('hero-title').classList.remove('opacity-0');
    document.getElementById('hero-subtitle').classList.remove('opacity-0');
  } catch(e) { 
    console.error('AGENT_LOG: Auth Critical Error:', e);
    window.location.href = 'login.html'; 
  }
}

// --- THEME LOGIC (INDEPENDENT) ---
function initTheme() {
  const toggles = [
    document.getElementById('theme-toggle-desktop'),
    document.getElementById('theme-toggle-mobile')
  ];

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log('AGENT_LOG: Theme switched to', isDark ? 'Dark' : 'Light');
  };

  toggles.forEach(btn => {
    if (btn) btn.onclick = (e) => {
      e.preventDefault();
      toggleTheme();
    };
  });

  // Apply saved theme immediately
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
  }
}

// --- SEARCH ---
function initSearch() {
  const searchInput = document.getElementById('dashboard-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const role = (currentUser.role || '').toLowerCase();
    if (role === 'agent') {
      renderAgentList(rawData.filter(m => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)));
    } else {
      renderCards(rawData.filter(c => c.cardText.toLowerCase().includes(term) || c.title.toLowerCase().includes(term)));
    }
  });
}

// --- AGENT ---
async function setupAgentUI() {
  updateHero('Agency Control Panel', 'Monitor and manage council member progress and requirements.');
  updateBanner('Agency Mode Active', 'Real-time synchronization enabled. Authorized access only.');
  const token = localStorage.getItem('token');
  try {
     const res = await fetch(`${API_BASE}/api/agent/members`, { headers: { 'Authorization': `Bearer ${token}` } });
    rawData = await res.json();
    renderAgentList(rawData);
  } catch(e) { console.error(e); }
}

function renderAgentList(members) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  members.forEach(m => {
    const cardEl = document.createElement('div');
    cardEl.className = "bg-white dark:bg-[#1A1C1E] rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col group hover:shadow-2xl transition-all cursor-pointer";
    const mid = m.id || m._id;
    cardEl.onclick = () => { 
      currentChatPartnerId = mid; 
      console.log('AGENT_LOG: Managing Member ID:', mid);
      showMemberDetail(m); 
    };
    cardEl.innerHTML = `
      <div class="h-[180px] bg-[#FAFAFA] dark:bg-[#111213] flex items-center justify-center relative">
         ${m.profilePicture ? `<img src="${m.profilePicture}" class="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl">` : `<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl font-black text-gray-400">${m.name[0]}</div>`}
         <div class="absolute top-4 right-4 px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase rounded-full">Active</div>
      </div>
      <div class="p-8 text-center">
         <h3 class="font-black text-xl text-gray-900 dark:text-white">${m.name}</h3>
         <p class="text-[11px] text-gray-500 mb-6 uppercase tracking-widest font-medium">${m.email}</p>
         <div class="inline-flex items-center gap-2 text-[10px] font-black text-white bg-[#AEEFB5] dark:text-black px-6 py-3 rounded-2xl uppercase shadow-lg shadow-[#AEEFB5]/20 group-hover:scale-105 transition-transform">
            Manage Protocol
         </div>
      </div>
    `;
    grid.appendChild(cardEl);
  });
  initLucide();
}

// --- MEMBER ---
async function setupMemberUI() {
  updateHero('Member Dashboard', 'Monitor your progress and manage your council requirements.');
  updateBanner('Personal Mode Active', 'Secure connection established. Council access authorized.');
  const token = localStorage.getItem('token');
  try {
     const res = await fetch(`${API_BASE}/api/member/requirements`, { headers: { 'Authorization': `Bearer ${token}` } });
    const reqs = await res.json();
    rawData = reqs.map(r => ({
      id: r.id || r._id,
      title: 'Protocol Requirement',
      cardText: r.title,
      progress: r.progress,
      isCompleted: r.isCompleted,
      category: r.isCompleted ? 'Completed' : 'In Progress',
      icon: 'FileCheck'
    }));
    renderCards(rawData);
  } catch(e) { console.error(e); }
}

function renderCards(cards) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = "bg-white dark:bg-[#1A1C1E] rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col group hover:shadow-2xl transition-all";
    const iconName = ICON_MAP[card.icon] || 'file';
    cardEl.innerHTML = `
      <div class="h-[200px] bg-[#FAFAFA] dark:bg-[#111213] flex items-center justify-center p-8 group-hover:bg-white dark:group-hover:bg-[#16181A] transition-colors relative">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="p-4 bg-white dark:bg-[#0E1012] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
            <i data-lucide="${iconName}" class="w-10 h-10 text-gray-900 dark:text-white" stroke-width="2"></i>
          </div>
          <span class="text-xl font-black tracking-tight text-gray-900 dark:text-white">${card.cardText}</span>
        </div>
      </div>
      <div class="p-8 flex flex-col gap-6">
        <div class="space-y-3">
          <div class="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <span>Protocol Progress</span>
             <span>${card.progress}%</span>
          </div>
          <div class="w-full bg-gray-100 dark:bg-[#0E1012] rounded-full h-3 p-1">
            <div class="bg-[#AEEFB5] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_#AEEFB5]" style="width: ${card.progress}%"></div>
          </div>
        </div>
        <div class="flex items-center gap-2">
           <div class="w-2 h-2 rounded-full ${card.isCompleted ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"></div>
           <span class="text-[10px] font-black uppercase tracking-[0.2em] ${card.isCompleted ? 'text-green-500' : 'text-gray-500'}">${card.category}</span>
        </div>
      </div>
    `;
    grid.appendChild(cardEl);
  });
  initLucide();
}

// --- MESSAGING ---
function toggleMessaging() {
  const modal = document.getElementById('messaging-modal');
  const isHidden = modal.classList.contains('hidden');
  if (isHidden) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    fetchMessages();
    chatInterval = setInterval(fetchMessages, 3000);
    console.log('AGENT_LOG: Messaging opened with partner:', currentChatPartnerId);
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    clearInterval(chatInterval);
  }
}

async function fetchMessages() {
  if (!currentChatPartnerId) return;
  const token = localStorage.getItem('token');
  try {
     const res = await fetch(`${API_BASE}/api/messages/history?partnerId=${currentChatPartnerId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const msgs = await res.json();
    const body = document.getElementById('messages-body');
    const myId = currentUser.id || currentUser._id;
    
    const html = msgs.map(m => {
      const isMe = m.senderId === myId;
      return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'} w-full">
          <div class="max-w-[85%] px-6 py-4 rounded-[24px] text-base font-medium ${isMe ? 'bg-[#AEEFB5] text-black rounded-br-none shadow-lg shadow-[#AEEFB5]/10' : 'bg-white dark:bg-[#0E1012] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-bl-none shadow-sm'}">
            ${m.content}
            <div class="text-[9px] opacity-40 mt-2 uppercase font-black tracking-widest">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `;
    }).join('');

    if (body.innerHTML !== html) {
      body.innerHTML = html || '<div class="flex-1 flex items-center justify-center opacity-20 text-[10px] font-black uppercase tracking-[0.4em]">No active transmissions</div>';
      body.scrollTop = body.scrollHeight; // Auto-scroll to bottom
    }
  } catch(e) { console.error('AGENT_LOG: Fetch Message Error:', e); }
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('msg-input');
  const content = input.value.trim();
  if (!content || !currentChatPartnerId) return;
  const token = localStorage.getItem('token');
  try {
     await fetch(`${API_BASE}/api/messages/send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: currentChatPartnerId, content })
    });
    input.value = '';
    fetchMessages();
  } catch(e) { console.error('AGENT_LOG: Send Message Error:', e); }
}

// --- NOTIFICATIONS ---
function startNotificationPolling() {
  setInterval(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
       const res = await fetch(`${API_BASE}/api/messages/unread`, { headers: { 'Authorization': `Bearer ${token}` } });
      const { count } = await res.json();
      const dots = [document.getElementById('msg-dot'), document.getElementById('msg-dot-mobile')];
      dots.forEach(d => { if(d) count > 0 ? d.classList.remove('hidden') : d.classList.add('hidden'); });
    } catch(e) {}
  }, 5000);
}

// --- HELPERS ---
function updateHero(title, sub) { document.getElementById('hero-title').textContent = title; document.getElementById('hero-subtitle').textContent = sub; }
function updateBanner(mode, desc) { document.getElementById('banner-mode').textContent = mode; document.getElementById('banner-desc').textContent = desc; }
function updateAvatar() {
  const container = document.getElementById('avatar-container');
  if (!container) return;
  if (currentUser?.profilePicture) { container.innerHTML = `<img src="${currentUser.profilePicture}" class="w-full h-full object-cover">`; }
  else { container.textContent = currentUser?.name?.charAt(0) || 'U'; }
}
function initLucide() { if (window.lucide) lucide.createIcons(); }
function initProfileModal() {
  const modal = document.getElementById('profile-modal');
  const trigger = document.getElementById('profile-trigger');
  const close = document.getElementById('close-profile-modal-icon');
  const logout = document.getElementById('logout-btn');
  if (trigger) trigger.onclick = () => { document.getElementById('edit-name').value = currentUser.name; document.getElementById('edit-avatar').value = currentUser.profilePicture || ''; modal.classList.remove('hidden'), modal.classList.add('flex'); };
  if (close) close.onclick = () => modal.classList.add('hidden'), modal.classList.remove('flex');
  if (logout) logout.onclick = () => (localStorage.removeItem('token'), window.location.href = 'login.html');
}

async function saveProfile() {
  const name = document.getElementById('edit-name').value;
  const profilePicture = document.getElementById('edit-avatar').value;
  const token = localStorage.getItem('token');
  try {
     const res = await fetch(`${API_BASE}/api/user/profile`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, profilePicture }) });
    if (res.ok) { 
      const data = await res.json(); 
      const updated = data.user;
      currentUser = { ...updated, id: updated.id || updated._id }; 
      document.getElementById('user-name-display').textContent = currentUser.name; 
      updateAvatar(); 
      document.getElementById('close-profile-modal-icon').click(); 
    }
  } catch (e) { console.error(e); }
}

function showMemberDetail(member) {
  const grid = document.getElementById('card-grid');
  updateHero(`Managing: ${member.name}`, `Overriding protocols for council member ${member.email}`);
  grid.innerHTML = `
    <div class="col-span-full mb-8">
       <button onclick="setupAgentUI()" class="flex items-center gap-3 text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Agency Network
       </button>
    </div>
    <div id="requirements-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 col-span-full"></div>
  `;
  const container = document.getElementById('requirements-container');
  (member.requirements || []).forEach(req => {
    const cardEl = document.createElement('div');
    cardEl.className = "bg-white dark:bg-[#1A1C1E] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm";
    const rid = req.id || req._id;
    const mid = member.id || member._id;
    cardEl.innerHTML = `
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-[#AEEFB5]/10 rounded-2xl"><i data-lucide="file-check" class="w-6 h-6 text-[#AEEFB5]"></i></div>
        <h3 class="font-black text-xl text-gray-900 dark:text-white">${req.title}</h3>
      </div>
      <div class="space-y-8">
        <div>
          <div class="flex justify-between text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">
            <span>Transmission Level</span>
            <span>${req.progress}%</span>
          </div>
          <input type="range" min="0" max="100" value="${req.progress}" onchange="updateReq('${mid}', '${rid}', { progress: parseInt(this.value) })" class="w-full h-1.5 bg-gray-100 dark:bg-[#0E1012] rounded-full appearance-none cursor-pointer accent-[#AEEFB5]">
        </div>
        <div class="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Status</span>
          <div class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${req.isCompleted ? 'bg-[#AEEFB5]' : 'bg-gray-700'}" onclick="updateReq('${mid}', '${rid}', { isCompleted: ${!req.isCompleted} })">
            <span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${req.isCompleted ? 'translate-x-5' : 'translate-x-1'} shadow-sm"></span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(cardEl);
  });
  initLucide();
}

async function updateReq(memberId, reqId, payload) {
  const token = localStorage.getItem('token');
  try {
     await fetch(`${API_BASE}/api/agent/requirements/${reqId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
     const res = await fetch(`${API_BASE}/api/agent/members`, { headers: { 'Authorization': `Bearer ${token}` } });
    const members = await res.json();
    const updated = members.find(m => (m.id === memberId || m._id === memberId));
    if (updated) showMemberDetail(updated);
    document.getElementById('notif-dot').classList.remove('hidden');
  } catch(e) { console.error(e); }
}
