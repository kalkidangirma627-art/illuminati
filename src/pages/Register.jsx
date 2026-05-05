import React, { useState } from 'react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess('Registration submitted! Your account is pending admin approval. You will be able to log in once approved.');
        setName(''); setEmail(''); setPassword('');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="tailwind-scope font-body min-h-screen w-full bg-cover bg-center relative bg-no-repeat flex justify-center items-center py-10"
      style={{ backgroundImage: "url('/assets/illuminatiloader.jpg')", overflowY: 'auto' }}>
      <div className="inline-flex items-center justify-center p-4 bg-transparent w-full sm:w-auto">
        <div className="w-full sm:min-w-[500px]">
          <div className="bg-black/80 backdrop-blur-3xl lg:max-w-[540px] z-10 p-8 relative w-full h-full border-t-4 border-green-600 rounded-lg">
            <div className="flex flex-col h-full gap-4">
              <div className="mb-6 text-center lg:text-start">
                <a href="/" className="flex justify-center lg:justify-start">
                  <h1 className="text-3xl font-bold text-green-500 tracking-widest">THE ORDER</h1>
                </a>
              </div>

              <div className="my-auto">
                <h4 className="text-white text-2xl font-semibold mb-2">Request Access</h4>
                <p className="text-gray-400 mb-6">Submit your dossier for admin evaluation.</p>

                {error && (
                  <div style={{ background:'rgba(255,71,87,0.15)', border:'1px solid #ff4757', borderRadius:8, padding:'10px 16px', color:'#ff4757', marginBottom:16, fontSize:14 }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{ background:'rgba(52,196,113,0.15)', border:'1px solid #34c471', borderRadius:8, padding:'10px 16px', color:'#34c471', marginBottom:16, fontSize:14 }}>
                    {success}
                    <div style={{ marginTop:10 }}>
                      <a href="/login" style={{ color:'#34c471', fontWeight:700, textDecoration:'underline' }}>← Back to Login</a>
                    </div>
                  </div>
                )}

                {!success && (
                  <form onSubmit={handleRegister}>
                    <div className="mb-4">
                      <label htmlFor="fullname" className="block text-sm font-semibold text-gray-200 mb-2">Full Legal Name</label>
                      <input
                        className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0"
                        type="text" id="fullname" required placeholder="Enter your full name"
                        value={name} onChange={e => setName(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="regemail" className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
                      <input
                        className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0"
                        type="email" id="regemail" required placeholder="Enter your email"
                        value={email} onChange={e => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="regpassword" className="block text-sm font-semibold text-gray-200 mb-2">Passphrase</label>
                      <input
                        className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0"
                        type="password" id="regpassword" required placeholder="Create a secure passphrase" minLength={6}
                        value={password} onChange={e => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-200 mb-2">Request Role</label>
                      <div style={{ display:'flex', gap:12 }}>
                        {['agent','member'].map(r => (
                          <label key={r} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:8, border:`2px solid ${role === r ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, cursor:'pointer', flex:1, justifyContent:'center', color: role === r ? '#22c55e' : 'rgba(255,255,255,0.6)', fontWeight:600, fontSize:14, transition:'all 0.2s', background: role === r ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                            <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} style={{ display:'none' }} />
                            {r === 'agent' ? '🕵️ Agent' : '👤 Member'}
                          </label>
                        ))}
                      </div>
                      <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:8 }}>
                        Your account will be reviewed and approved by an Admin before access is granted.
                      </p>
                    </div>

                    <div className="mb-6 text-center">
                      <button
                        className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/10 text-white border border-white/20 rounded-lg transition-all duration-500 hover:bg-green-600/60 hover:text-white mt-2"
                        type="submit" disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Dossier'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <footer className="text-center mt-2">
                <p className="text-base inline-block px-2 py-1 text-gray-400">
                  Already cleared? <a href="/login" className="text-green-500 ms-1 hover:underline"><b>Log In</b></a>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
