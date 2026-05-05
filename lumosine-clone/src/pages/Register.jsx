import React from 'react';

export default function Register() {
  const handleRegister = (e) => {
    e.preventDefault();
    alert('Access Request Submitted. Awaiting high council approval.');
    window.location.pathname = '/login';
  };

  return (
    <div className="tailwind-scope font-body min-h-screen w-full bg-cover bg-center relative bg-no-repeat flex justify-center items-center py-10" style={{backgroundImage: "url('/assets/illuminatiloader.jpg')", overflowY: "auto"}}>
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
                <p className="text-gray-400 mb-6">Submit your dossier for evaluation. Invite only.</p>

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label htmlFor="fullname" className="block text-sm font-semibold text-gray-200 mb-2">Full Legal Name</label>
                    <input className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0 focus:ring-0" type="text" id="fullname" required placeholder="Enter your full name" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">Encrypted Email Address</label>
                    <input className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0 focus:ring-0" type="email" id="email" required placeholder="Enter your email" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-200 mb-2">Secure Comm Line (Phone)</label>
                    <input className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/10 text-white/80 focus:border-green-500 focus:outline-0 focus:ring-0" type="tel" id="phone" required placeholder="Enter your phone number" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="document" className="block text-sm font-semibold text-gray-200 mb-2">Identification Document</label>
                    <input className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 border border-white/10 rounded cursor-pointer focus:outline-0" type="file" id="document" required accept=".pdf,.doc,.docx,.jpg,.png" />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="photo" className="block text-sm font-semibold text-gray-200 mb-2">Biometric Scan (Photo)</label>
                    <input className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 border border-white/10 rounded cursor-pointer focus:outline-0" type="file" id="photo" required accept="image/*" />
                  </div>

                  <div className="mb-6 text-center">
                    <button className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/10 text-white border border-white/20 rounded-lg transition-all duration-500 group hover:bg-green-600/60 hover:text-white mt-2" type="submit">Submit Dossier</button>
                  </div>
                </form>
              </div>

              <footer className="text-center mt-2">
                <p className="text-base inline-block px-2 py-1 text-gray-400">Already a member? <a href="/login" className="text-green-500 ms-1 hover:underline"><b>Log In</b></a></p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
