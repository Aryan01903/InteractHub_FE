import { IoPersonOutline } from "react-icons/io5";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiAcademicCap } from "react-icons/hi";

function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 w-full py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Personal Info */}
        <ul className="space-y-4 text-lg">
          <li className="flex items-center gap-3">
            <IoPersonOutline className="text-teal-400 text-2xl" />
            <span>Made with 💻 by <b>Aryan Kumar Shrivastav</b></span>
          </li>
          <li className="flex items-center gap-3">
            <MdEmail className="text-pink-400 text-2xl" />
            <span>
              main.aryanshrivastav2003@gmail.com <br />
              projectdeveloper25@gmail.com
            </span>
          </li>
          <li className="flex items-center gap-3">
            <HiAcademicCap className="text-yellow-400 text-2xl" />
            <span>B.Tech ECE Student at Dr. Akhilesh Das Gupta Institute of Professional Studies, New Delhi</span>
          </li>
        </ul>

        {/* Social Links */}
        <div className="flex gap-6 mt-6 text-3xl">
          <a
            href="https://www.linkedin.com/in/aryan-kumar-shrivastav-638831268/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/Aryan01903"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
