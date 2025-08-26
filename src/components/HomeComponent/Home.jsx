import { useEffect, useState } from "react";
import Typed from "typed.js";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import AboutInteractHub from "./AboutUs";
import Features from "./Features";
import Footer from "../common/footer";
import LoginModal from "../common/Login";
import { ToastContainer } from "react-toastify";

function Home() {
  useEffect(() => {
    const typed = new Typed('#typed-element', {
      strings: ['Multi Tenant Support','Role Based Access', 'Real Time Whiteboard Collaboration', 'Web Based Video Conferencing'],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1000,
      loop: true,
    });
    return () => {
      typed.destroy();
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ Modal state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Navbar */}
      <nav className="w-full h-20 fixed top-0 bg-white border-b-2 shadow-md z-50">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-3xl font-bold text-[#48C4D3]">InteractHub</div>

          <button className="sm:hidden flex items-center p-2" onClick={toggleMenu}>
            {isMenuOpen ? <IoMdClose className="text-2xl" /> : <IoMdMenu className="text-2xl" />}
          </button>

          <div className="hidden sm:flex items-center space-x-8">
            <a href="#Home">Home</a>
            <a href="#About">About</a>
            <a href="#features">Contact Me</a>
            <a href="#">Features</a>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <button
              className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors"
              onClick={() => setShowLoginModal(true)} // ✅ Open modal
            >
              Login
            </button>
            <button className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors">
              Register
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`sm:hidden absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="flex flex-col items-center py-4 space-y-4">
            <a href="#Home" onClick={toggleMenu}>Home</a>
            <a href="#About" onClick={toggleMenu}>About</a>
            <a href="#" onClick={toggleMenu}>Contact Me</a>
            <a href="#features" onClick={toggleMenu}>Features</a>
            <button className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7]" onClick={() => { toggleMenu(); setShowLoginModal(true); }}>
              Login
            </button>
            <button className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7]">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20" id="Home">
        <div className="mt-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-700">Welcome To</h1>
          <h1 className="text-6xl font-semibold text-[#48C4D3]">InteractHub</h1>
          <p className="text-2xl mt-6 mb-6">
            <span id="typed-element" className="text-[#2D2D2D] font-semibold"></span>
          </p>
        </div>
      </div>

      {/* Other sections */}
      <div id="About"><AboutInteractHub /></div>
      <div id="features" className="m-14"><Features /></div>
      <Footer />

      {/* ✅ Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <ToastContainer />
    </div>
  );
}

export default Home;
