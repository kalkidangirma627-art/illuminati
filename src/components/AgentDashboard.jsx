import React, { useState, useEffect } from 'react';
import { Search, Users, LayoutGrid, Menu, Lock, Globe, ChevronDown, DollarSign, ArrowLeft, Moon, Sun, FileCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AgentDashboard({ onLogout }) {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/agent/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
      
      // If we are currently viewing a member, refresh their data too
      if (selectedMember) {
        const updated = data.find(m => m.id === selectedMember.id);
        if (updated) setSelectedMember(updated);
      }
    } catch(e) { console.error('Fetch Error:', e); }
  };

  const updateRequirement = async (reqId, payload) => {
    try {
      await fetch(`http://localhost:3001/api/agent/requirements/${reqId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      fetchMembers();
    } catch(e) { console.error('Update Error:', e); }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#121212] font-sans pb-20 transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex flex-col md:flex-row md:justify-between items-center py-4 md:py-6 px-4 md:px-8 max-w-[1400px] mx-auto gap-4 md:gap-0">
        <div className="flex items-center gap-1 text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href='/'}>
            <img src="/assets/ethiopiaemblem.svg" alt="Emblem" className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex flex-col leading-tight">
               <span style={{ fontFamily: 'Amoria', fontSize: '1.4rem', fontWeight: 700 }}>Illuminati</span>
               <span className="text-[10px] opacity-60 tracking-[0.2em] font-normal uppercase">.ethiopia</span>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 w-full md:w-auto">
          <button onClick={() => setDarkMode(!darkMode)} className="hidden md:flex p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-gray-300 dark:border-gray-700 text-xs md:text-sm font-medium text-gray-900 dark:text-white transition-colors">
            Agency Control
          </button>
          <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-gray-300 dark:border-gray-700">
            <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">{user?.name || 'Agent'}</span>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#AEEFB5] shadow-sm cursor-pointer overflow-hidden flex items-center justify-center text-green-900 font-bold">
               {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
            </div>
          </div>
          <button className="text-xs text-gray-400 hover:text-red-500 ml-2" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-[44px] font-semibold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'Amoria' }}>
            {selectedMember ? `Managing: ${selectedMember.name}` : 'Agency Control Panel'}
          </h1>
          {selectedMember && (
            <button onClick={() => setSelectedMember(null)} className="flex items-center gap-2 mx-auto text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Members
            </button>
          )}
        </div>

        {!selectedMember && (
          <div className="relative max-w-[640px] mx-auto mt-6 md:mt-10">
            <input
              type="text"
              placeholder="Search members by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 md:pl-6 pr-12 md:pr-14 py-3 md:py-4 rounded-full bg-white dark:bg-[#1A1C1E] shadow-sm border border-gray-100 dark:border-gray-800 text-base md:text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AEEFB5] transition-all outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-[#AEEFB5] hover:bg-[#9BE3A3] text-green-900 rounded-full flex items-center justify-center transition-colors">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {!selectedMember ? (
            filteredMembers.map((m) => (
              <div key={m.id} onClick={() => setSelectedMember(m)} className="bg-white dark:bg-[#1A1C1E] rounded-2xl md:rounded-[24px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 flex flex-col group hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
                <div className="h-[140px] sm:h-[180px] bg-[#FAFAFA] dark:bg-[#111213] flex items-center justify-center p-4">
                   {m.profilePicture ? (
                     <img src={m.profilePicture} alt="Profile" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover" />
                   ) : (
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-400">
                       {m.name?.charAt(0)}
                     </div>
                   )}
                </div>
                <div className="p-4 md:p-6 text-center">
                   <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{m.name}</h3>
                   <p className="text-gray-500 text-sm mt-1">{m.email}</p>
                   <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-green-600 dark:text-[#AEEFB5] bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {m.requirements?.length || 0} Requirements
                   </div>
                </div>
              </div>
            ))
          ) : (
            (selectedMember.requirements || []).map(req => (
              <div key={req.id} className="bg-white dark:bg-[#1A1C1E] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileCheck className="w-5 h-5 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-500 mb-2">
                      <span>PROGRESS</span>
                      <span>{req.progress}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={req.progress} 
                      onChange={(e) => updateRequirement(req.id, { progress: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#AEEFB5]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status Override</span>
                    <button 
                      onClick={() => updateRequirement(req.id, { isCompleted: !req.isCompleted })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${req.isCompleted ? 'bg-[#AEEFB5]' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${req.isCompleted ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {selectedMember && (selectedMember.requirements || []).length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
               No active requirements for this member.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
