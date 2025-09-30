export default function AboutUs() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        <div className="md:flex-1">
          <h1 className="text-4xl font-extrabold text-slate-800 leading-tight">
            About <span className="text-[#3aabb7]">InteractHub</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            InteractHub is a next-generation web-based video conferencing platform designed to make virtual collaboration seamless, secure, and engaging. We go beyond simply connecting people — we empower them to collaborate, innovate, and build meaningful connections across the globe. Founded with a passion for redefining remote communication, InteractHub combines cutting-edge technology with a user-centric approach to deliver an unparalleled experience.
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Since our inception, we’ve been driven by the belief that distance should never hinder creativity or productivity. Our platform is trusted by teams, educators, and organizations worldwide to facilitate dynamic meetings, brainstorming sessions, and collaborative projects. With a focus on reliability and innovation, InteractHub is your partner in transforming the way you connect.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">✨ Our Mission</h2>
          <p className="mt-2 text-slate-600">
            To simplify virtual communication by providing a reliable, user-friendly, and interactive hub where people can connect, collaborate, and create—anytime, anywhere.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">🌟 Our Values</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
            <li>• <span className="font-medium text-[#3aabb7]">Innovation</span>: Constantly pushing the boundaries of what’s possible in virtual collaboration.</li>
            <li>• <span className="font-medium text-[#3aabb7]">Inclusivity</span>: Creating a platform that’s accessible to everyone, everywhere.</li>
            <li>• <span className="font-medium text-[#3aabb7]">Reliability</span>: Ensuring uninterrupted, high-quality connections for all users.</li>
            <li>• <span className="font-medium text-[#3aabb7]">User-Centricity</span>: Designing with the needs of our users at the forefront.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">🔑 What We Offer</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
            <li>• High-quality video & audio conferencing</li>
            <li>• Screen sharing & file collaboration</li>
            <li>• Real-time whiteboard collaboration</li>
            <li>• Multi-tenant support for organizations</li>
            <li>• Secure, private, and scalable meetings</li>
            <li>• An intuitive, easy-to-use interface</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">🌍 Why InteractHub?</h2>
          <p className="mt-2 text-slate-600">
            Unlike generic meeting apps, InteractHub is built with flexibility in mind. With multi-tenant support, organizations can create their own dedicated spaces, while real-time whiteboarding ensures ideas flow as naturally as in-person discussions. Our commitment to security, scalability, and ease of use sets us apart, making InteractHub the go-to choice for teams of all sizes.
          </p>

          <p className="mt-6 text-slate-700 font-medium">
            Together, let&apos;s redefine the way the world interacts. 🚀
          </p>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">🚀 Get Started</h2>
          <p className="mt-2 text-slate-600">
            Ready to experience seamless collaboration? Join InteractHub today and start connecting with your team in a whole new way.
          </p>
          <a
            href="/register"
            className="mt-4 inline-block px-6 py-3 bg-[#3aabb7] text-white font-medium rounded-lg hover:bg-[#2e8b94] transition-colors"
          >
            Start Now
          </a>
        </div>
      </div>
    </section>
  );
}