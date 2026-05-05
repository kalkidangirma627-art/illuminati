import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        login(data.user, data.token);
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="tailwind-scope font-body h-screen w-full bg-cover bg-center relative bg-no-repeat" style={{ backgroundImage: "url('/assets/illuminatiloader.jpg')" }}>
      <div className="inline-flex items-center justify-center p-4 bg-transparent h-full w-full sm:w-auto">
        <div className="h-full w-full sm:min-w-[460px]">
          <div className="bg-black/80 backdrop-blur-3xl lg:max-w-[480px] z-10 p-6 relative w-full h-full border-t-4 border-green-600 rounded-lg">
            <div className="flex flex-col h-full gap-4">
              <div className="mb-8 text-center lg:text-start">
                <a href="/" className="flex justify-center lg:justify-start">
                  <h1 className="text-3xl font-bold text-green-500 tracking-widest">THE ORDER</h1>
                </a>
              </div>
              <div className="my-auto">
                <h4 className="text-white text-2xl font-semibold mb-2">Access Portal</h4>
                <p className="text-gray-400 mb-9">Enter your credentials to access the agency.</p>

                {error && (
                  <div style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid #ff4757', borderRadius: 8, padding: '10px 16px', color: '#ff4757', marginBottom: 16, fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="emailaddress" className="block text-base/normal font-semibold text-gray-200 mb-2">Email Address</label>
                    <input
                      className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0"
                      type="email" id="emailaddress" required placeholder="Enter your email"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-base/normal font-semibold text-gray-200 mb-2">Passphrase</label>
                    <input
                      className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0"
                      type="password" required id="password" placeholder="Enter your passphrase"
                      value={password} onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Admin hint */}
                  <div style={{ background:'rgba(79,63,240,0.1)', border:'1px solid rgba(79,63,240,0.3)', borderRadius:8, padding:'8px 14px', marginBottom:16, fontSize:12, color:'rgba(255,255,255,0.5)' }}>
                    🔐 Admin: <span style={{ color:'rgba(79,63,240,0.9)', fontWeight:600 }}>admin@lumosine.com</span> / <span style={{ color:'rgba(79,63,240,0.9)', fontWeight:600 }}>admin</span>
                  </div>

                  <div className="mb-6 text-center">
                    <button
                      className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/10 text-white border border-white/20 rounded-lg transition-all duration-500 hover:bg-green-600/60 hover:text-white mt-5"
                      type="submit" disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Initialize Override'}
                    </button>
                  </div>
                </form>
              </div>

              <footer className="text-center mt-6">
                <p className="text-base inline-block px-2 py-1 text-gray-400">No clearance? <a href="/register" className="text-green-500 ms-1 hover:underline"><b>Request Access</b></a></p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
