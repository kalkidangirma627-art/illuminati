import React from 'react';

export default function Login() {
  const handleLogin = (e) => {
    e.preventDefault();
    window.location.pathname = '/dashboard';
  };

  return (
    <div className="tailwind-scope font-body h-screen w-full bg-cover bg-center relative bg-no-repeat" style={{backgroundImage: "url('/assets/illuminatiloader.jpg')"}}>
      <div className="inline-flex items-center justify-center p-4 bg-transparent h-full w-full sm:w-auto">
        <div className="h-full w-full sm:min-w-[460px]">
          <div className="bg-black/80 backdrop-blur-3xl lg:max-w-[480px] z-10 p-6 relative w-full h-full border-t-4 border-green-600 rounded-lg">
            <div className="flex flex-col h-full gap-4">
              <div className="mb-8 text-center lg:text-start">
                <a href="/" className="flex justify-center lg:justify-start">
                  {/* Logo Placeholder */}
                  <h1 className="text-3xl font-bold text-green-500 tracking-widest">THE ORDER</h1>
                </a>
              </div>
              <div className="my-auto">
                {/* title */}
                <h4 className="text-white text-2xl font-semibold mb-2">Access Portal</h4>
                <p className="text-gray-400 mb-9">Enter your credentials to access the agency.</p>

                {/* form */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="emailaddress" className="block text-base/normal font-semibold text-gray-200 mb-2">Agent ID / Email</label>
                    <input className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0 focus:ring-0" type="text" id="emailaddress" required placeholder="Enter your ID" />
                  </div>
                  {/* end email input */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-base/normal font-semibold text-gray-200 mb-2">Passphrase</label>
                    <input className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0 focus:ring-0" type="password" required id="password" placeholder="Enter your passphrase" />
                  </div>
                  {/* end password input */}
                  <div className="flex justify-between items-center gap-1 mb-6">
                    <div className="inline-flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/20 text-green-600 shadow-sm focus:border-green-600 focus:ring focus:ring-green-600/60 focus:ring-offset-0" id="checkbox-signin" />
                      <label className="text-base/none ms-2 text-gray-200 align-middle select-none" htmlFor="checkbox-signin">Secure Session</label>
                    </div>
                  </div>
                  {/* end checkbox input */}
                  <div className="mb-6 text-center">
                    <button className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/10 text-white border border-white/20 rounded-lg transition-all duration-500 group hover:bg-green-600/60 hover:text-white mt-5" type="submit">Initialize Override</button>
                  </div>
                </form>
                {/* end form */}
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
