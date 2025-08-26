export default function AboutUs() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        <div className="md:flex-1">
          <h1 className="text-4xl font-extrabold text-slate-800 leading-tight">
            About <span className="text-cyan-500">InteractHub</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            InteractHub is a next-generation web-based video conferencing
            platform designed to make virtual collaboration seamless, secure,
            and engaging. We go beyond simply connecting people — we empower
            them.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">✨ Our mission</h2>
          <p className="mt-2 text-slate-600">
            To simplify virtual communication by providing a reliable,
            user-friendly, and interactive hub where people can connect,
            collaborate, and create—anytime, anywhere.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-slate-800">🔑 What we offer</h2>
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
            Unlike generic meeting apps, InteractHub is built with flexibility
            in mind. With multi-tenant support, organizations can create their
            own dedicated spaces, while real-time whiteboarding ensures ideas
            flow as naturally as in-person discussions.
          </p>

          <p className="mt-6 text-slate-700 font-medium">
            Together, let&apos;s redefine the way the world interacts. 🚀
          </p>
        </div>
      </div>
    </section>
  );
}
