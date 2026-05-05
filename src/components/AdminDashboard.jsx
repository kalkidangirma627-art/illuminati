import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#fee4cb','#e9e7fd','#dbf6fd','#ffd3e2','#c8f7dc','#d5deff'];
const ACCENT_COLORS = ['#ff942e','#4f3ff0','#096c86','#df3670','#34c471','#4067f9'];

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '??';
}

function SidebarIcon({ children, active }) {
  return (
    <a href="#" className={`app-sidebar-link${active ? ' active' : ''}`}>
      {children}
    </a>
  );
}

export default function AdminDashboard({ onLogout }) {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [msgOpen, setMsgOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignMap, setAssignMap] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setAgents((Array.isArray(data) ? data : []).filter(u => u.role === 'agent' && u.status === 'approved'));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    await fetch(`/api/admin/approve/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const handleReject = async (id) => {
    await fetch(`/api/admin/reject/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDeleteId(null);
    fetchUsers();
  };

  const handleAssign = async (memberId) => {
    const agentId = assignMap[memberId];
    if (!agentId) return;
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, agentId })
    });
    fetchUsers();
  };

  const filtered = users.filter(u => {
    const matchTab = u.status === activeTab;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const approvedCount = users.filter(u => u.status === 'approved').length;
  const totalCount = users.length;

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className={`dashboard-page${darkMode ? ' dark' : ''}`}>
      <div className="app-container">
        {/* HEADER */}
        <div className="app-header">
          <div className="app-header-left">
            <span className="app-icon"></span>
            <p className="app-name">Lumosine Admin</p>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </div>
          </div>
          <div className="app-header-right">
            <button className={`mode-switch${darkMode ? ' active' : ''}`} title="Switch Theme" onClick={() => setDarkMode(!darkMode)}>
              <svg className="moon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="24" height="24" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
              </svg>
            </button>
            <button className="notification-btn" style={{ position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {pendingCount > 0 && (
                <span style={{ position:'absolute', top:-2, right:-2, background:'#df3670', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button className="profile-btn">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#1f1c2e', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, marginRight:6 }}>
                {getInitials(user?.name)}
              </div>
              <span>{user?.name}</span>
            </button>
            <button onClick={onLogout} style={{ marginLeft:12, padding:'6px 18px', borderRadius:20, border:'none', background:'#ff4757', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13, transition:'0.2s' }}>
              Logout
            </button>
          </div>
          <button className="messages-btn" onClick={() => setMsgOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="app-content">
          {/* SIDEBAR */}
          <div className="app-sidebar">
            <SidebarIcon active>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
              </svg>
            </SidebarIcon>
          </div>

          {/* MAIN */}
          <div className="projects-section">
            <div className="projects-section-header">
              <p>Admin Panel</p>
              <p className="time">{today}</p>
            </div>

            {/* KPI Strip */}
            <div className="projects-section-line">
              <div className="projects-status">
                <div className="item-status">
                  <span className="status-number">{pendingCount}</span>
                  <span className="status-type">Pending</span>
                </div>
                <div className="item-status">
                  <span className="status-number">{approvedCount}</span>
                  <span className="status-type">Approved</span>
                </div>
                <div className="item-status">
                  <span className="status-number">{totalCount}</span>
                  <span className="status-type">Total Users</span>
                </div>
              </div>
              <div className="view-actions">
                {['pending','approved','rejected'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`view-btn${activeTab === tab ? ' active' : ''}`}
                    style={{ padding:'0 14px', borderRadius:20, fontSize:13, fontWeight:600, height:34, width:'auto', minWidth:80 }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* User Cards */}
            <div className="project-boxes jsGridView" style={{ paddingBottom:24 }}>
              {loading ? (
                <div style={{ padding:32, color:'var(--secondary-color)', opacity:0.6 }}>Loading users...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding:32, color:'var(--secondary-color)', opacity:0.6 }}>No {activeTab} users found.</div>
              ) : filtered.map((u, i) => {
                const bg = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const ac = ACCENT_COLORS[i % ACCENT_COLORS.length];
                return (
                  <div className="project-box-wrapper" key={u.id}>
                    <div className="project-box" style={{ backgroundColor: bg }}>
                      <div className="project-box-header">
                        <span style={{ textTransform:'capitalize', fontWeight:700, color:ac, opacity:1, fontSize:12 }}>{u.role}</span>
                        <div className="more-wrapper">
                          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:'rgba(255,255,255,0.6)', fontWeight:700, color: u.status==='pending'?'#ff942e':u.status==='approved'?'#34c471':'#df3670' }}>
                            {u.status}
                          </span>
                        </div>
                      </div>
                      <div className="project-box-content-header">
                        <div style={{ width:52, height:52, borderRadius:'50%', background:ac, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, margin:'0 auto 10px' }}>
                          {getInitials(u.name)}
                        </div>
                        <p className="box-content-header">{u.name}</p>
                        <p className="box-content-subheader">{u.email}</p>
                      </div>

                      {/* Assign Agent (for approved members) */}
                      {activeTab === 'approved' && u.role === 'member' && agents.length > 0 && (
                        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                          <select
                            value={assignMap[u.id] || ''}
                            onChange={e => setAssignMap(prev => ({ ...prev, [u.id]: e.target.value }))}
                            style={{ flex:1, padding:'5px 8px', borderRadius:10, border:'1px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.8)', fontSize:12, fontFamily:'DM Sans, sans-serif' }}
                          >
                            <option value="">Assign agent...</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssign(u.id)}
                            style={{ padding:'5px 12px', borderRadius:10, border:'none', background:ac, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:12 }}
                          >
                            Assign
                          </button>
                        </div>
                      )}

                      <div className="project-box-footer" style={{ gap:8 }}>
                        {activeTab === 'pending' && (<>
                          <button
                            onClick={() => handleApprove(u.id)}
                            style={{ flex:1, padding:'8px 0', borderRadius:20, border:'none', background:'#34c471', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}
                          >✓ Approve</button>
                          <button
                            onClick={() => handleReject(u.id)}
                            style={{ flex:1, padding:'8px 0', borderRadius:20, border:'none', background:'#df3670', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}
                          >✕ Reject</button>
                        </>)}
                        {activeTab !== 'pending' && (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            style={{ flex:1, padding:'8px 0', borderRadius:20, border:'none', background:'rgba(0,0,0,0.1)', color:'#df3670', fontWeight:700, cursor:'pointer', fontSize:13 }}
                          >🗑 Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MESSAGES/NOTICES PANEL */}
          <div className={`messages-section${msgOpen ? ' show' : ''}`}>
            <button className="messages-close" onClick={() => setMsgOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
            <div className="projects-section-header">
              <p>System Notices</p>
            </div>
            <div className="messages">
              {pendingCount > 0 && (
                <div className="message-box">
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'#ff942e', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>!</div>
                  <div className="message-content">
                    <div className="message-header"><div className="name">Pending Approvals</div></div>
                    <p className="message-line">{pendingCount} account{pendingCount > 1 ? 's' : ''} waiting for your approval.</p>
                    <p className="message-line time">{today}</p>
                  </div>
                </div>
              )}
              <div className="message-box">
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#4f3ff0', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>A</div>
                <div className="message-content">
                  <div className="message-header"><div className="name">System</div></div>
                  <p className="message-line">Welcome, {user?.name}. You have full admin access.</p>
                  <p className="message-line time">Today</p>
                </div>
              </div>
              <div className="message-box">
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#34c471', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>✓</div>
                <div className="message-content">
                  <div className="message-header"><div className="name">Total Users</div></div>
                  <p className="message-line">{totalCount} user{totalCount !== 1 ? 's' : ''} registered. {approvedCount} approved.</p>
                  <p className="message-line time">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:24, padding:32, maxWidth:360, width:'90%', textAlign:'center' }}>
            <p style={{ fontWeight:700, fontSize:18, color:'#1f1c2e', marginBottom:12 }}>Delete User?</p>
            <p style={{ color:'#4A4A4A', marginBottom:24, fontSize:14 }}>This action cannot be undone. All data for this user will be removed.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:'10px 24px', borderRadius:20, border:'1px solid #ddd', background:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding:'10px 24px', borderRadius:20, border:'none', background:'#df3670', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
