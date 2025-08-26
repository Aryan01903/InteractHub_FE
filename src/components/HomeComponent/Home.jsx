import { useEffect, useState } from "react";
import Typed from "typed.js";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import AboutInteractHub from "./AboutUs";
import Features from "./Features";
import Footer from "../common/footer";

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
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Navbar */}
      <nav className="w-full h-20 fixed top-0 bg-white border-b-2 shadow-md z-50">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          {/* Logo placeholder */}
          <div className="text-3xl font-bold text-[#48C4D3]">InteractHub</div>

          {/* Menu Toggler (For mobile screens) */}
          <button 
            className="sm:hidden flex items-center p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <IoMdClose className="text-2xl" />
            ) : (
              <IoMdMenu className="text-2xl" />
            )}
          </button>

          {/* Navigation Links (Visible on larger screens) */}
          <div className="hidden sm:flex items-center space-x-8">
            <a href="#Home" className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold">
              Home
            </a>
            <a href="#About" className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold">
              About
            </a>
            <a href="#features" className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold">
              Contact Me
            </a>
            <a href="#" className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold">
              Features
            </a>
          </div>

          {/* Login/Register (Visible on larger screens) */}
          <div className="hidden sm:flex items-center space-x-4">
            <button className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors">
              Login
            </button>
            <button className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors">
              Register
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`sm:hidden absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center py-4 space-y-4">
            <a 
              href="#Home" 
              className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold"
              onClick={toggleMenu}
            >
              Home
            </a>
            <a 
              href="#About" 
              className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold"
              onClick={toggleMenu}
            >
              About
            </a>
            <a 
              href="#" 
              className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold"
              onClick={toggleMenu}
            >
              Contact Me
            </a>
            <a 
              href="#features" 
              className="text-lg hover:text-gray-700 transition-all duration-200 hover:font-semibold"
              onClick={toggleMenu}
            >
              Features
            </a>
            <button 
              className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors"
              onClick={toggleMenu}
            >
              Login
            </button>
            <button 
              className="bg-[#48C4D3] w-24 h-10 rounded-full hover:bg-[#3aabb7] transition-colors"
              onClick={toggleMenu}
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
      {/* About */}
      <div id="About">
        <AboutInteractHub/>
      </div>
      {/* Slider (Features) */}
      <div id="features" className="m-14">
        <Features/>
      </div>
      <Footer/>
    </div>
  );
}

export default Home;