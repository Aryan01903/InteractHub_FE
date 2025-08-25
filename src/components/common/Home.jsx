import { useEffect, useState } from "react";
import Typed from "typed.js";
function Home() {
  useEffect(() => {
    const typed = new Typed('#typed-element', {
      strings: ['Role Based Access','Real Time Whiteboard Collaborator', 'Web Based Video Confrencing.'],
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
    <div>
      <div className="w-full h-32 flex items-center bg-white border-2 border-solid shadow-md border-t-0 p-4 sm:px-6 md:px-12">
        <div className="flex items-center justify-between w-full">
          <div className="sm:hidden flex items-center cursor-pointer" onClick={toggleMenu}>
            <div className="w-6 h-1 bg-black mb-1"></div>
            <div className="w-6 h-1 bg-black mb-1"></div>
            <div className="w-6 h-1 bg-black"></div>
          </div>
          <div className="text-lg hidden sm:flex sm:space-x-8 sm:ml-0 sm:text-center">
            <a href="" className="hover:text-gray-700 hover:text-xl">Home</a>
            <a href="" className="hover:text-gray-700 hover:text-xl">About</a>
            <a href="" className="hover:text-gray-700 hover:text-xl">Contact Me</a>
            <a href="" className="hover:text-gray-700 hover:text-xl">Features</a>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden flex flex-col items-center space-y-2 mt-4">
            <button className="m-1 bg-[#48C4D3] w-24 h-12 rounded-full">Login</button>
            <button className="m-1 bg-[#48C4D3] w-24 h-12 rounded-full">Register</button>
          </div>
        )}
        <div className="hidden sm:flex ml-auto mr-32">
          <button className="m-1 bg-[#48C4D3] w-24 h-12 rounded-full">Login</button>
          <button className="m-1 bg-[#48C4D3] w-24 h-12 rounded-full ml-5">Register</button>
        </div>
      </div>
      <div className="mt-8 text-center">
          <h1 className="text-3xl font-semibold">Welcome to InteractHub</h1>
          <p className="text-xl mt-4">
            <span id="typed-element"></span>
          </p>
        </div>
    </div>
  );
}

export default Home;
