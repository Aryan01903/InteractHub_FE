import { useEffect, useState } from "react";
import Typed from "typed.js";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { Link } from "react-scroll";
import AboutInteractHub from "./AboutUs";
import Features from "./Features";
import Footer from "../common/footer";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const typed = new Typed('#typed-element', {
      strings: ['Multi Tenant Support', 'Role Based Access', 'Real Time Whiteboard Collaboration', 'Web Based Video Conferencing'],
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
            <Link to="Home" smooth={true} duration={500} className="cursor-pointer hover:text-xl hover:text-gray-500">Home</Link>
            <Link to="About" smooth={true} duration={500} className="cursor-pointer hover:text-xl hover:text-gray-500">About</Link>
            <Link to="features" smooth={true} duration={500} className="cursor-pointer hover:text-xl hover:text-gray-500">Features</Link>
            <Link to="contact" smooth={true} duration={500} className="cursor-pointer hover:text-xl hover:text-gray-500">Contact Me</Link>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <button
              className="bg-[#48C4D3] w-24 h-10 rounded-full text-white font-medium hover:bg-[#3aabb7] transition-colors"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-[#48C4D3] w-24 h-10 rounded-full text-white font-medium hover:bg-[#3aabb7] transition-colors"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`sm:hidden absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="flex flex-col items-center py-4 space-y-4">
            <Link to="Home" smooth={true} duration={500} onClick={toggleMenu}>Home</Link>
            <Link to="About" smooth={true} duration={500} onClick={toggleMenu}>About</Link>
            <Link to="features" smooth={true} duration={500} onClick={toggleMenu}>Features</Link>
            <Link to="contact" smooth={true} duration={500} onClick={toggleMenu}>Contact Me</Link>
            <button
              className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7]"
              onClick={() => { toggleMenu(); navigate("/login"); }}
            >
              Login
            </button>
            <button
              className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7]"
              onClick={() => { toggleMenu(); navigate("/register"); }}
            >
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
      <div id="About"><AboutInteractHub /></div>
      <div id="features" className="m-14"><Features /></div>
      <div id="contact">
        <Footer />
      </div>

      <ToastContainer />
    </div>
  );
}

export default Home;