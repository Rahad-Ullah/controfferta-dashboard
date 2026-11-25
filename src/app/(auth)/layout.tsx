import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="relative isolate flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#061B1E] px-4 py-10 text-white selection:bg-[#00BC7D]/30 selection:text-[#7CFFD8] sm:px-6"
      style={{
        backgroundColor: "#061B1E",
        backgroundImage: `
          radial-gradient(ellipse 680px 420px at 50% -8%, rgba(0, 188, 125, 0.28) 0%, rgba(0, 114, 82, 0.12) 44%, transparent 76%),
          radial-gradient(circle 620px at -12% 92%, rgba(0, 91, 74, 0.38) 0%, transparent 68%),
          radial-gradient(circle 600px at 112% 18%, rgba(18, 54, 72, 0.42) 0%, transparent 68%),
          linear-gradient(145deg, #071F22 0%, #061B1E 48%, #041513 100%)
        `,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, black, transparent 78%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-2xl -translate-x-1/2 rounded-full bg-[#00BC7D]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-xl -translate-x-1/2 rounded-full bg-[#0D9488]/10 blur-3xl"
      />

      <Link
        href="/"
        aria-label="Go to the Controfferta dashboard"
        className="group relative z-10 mb-8 inline-flex transition-transform duration-200 hover:-translate-y-0.5"
      >
        <Image
          src="/images/logo.png"
          alt="Controfferta.it"
          width={1290}
          height={112}
          priority
          className="h-7 w-auto sm:h-8"
        />
      </Link>

      <div className="relative z-10 flex w-full max-w-md justify-center">
        {children}
      </div>
      <footer className="relative z-10 mt-8 space-y-2 text-center text-[11px] text-slate-500">
        <p>© {currentYear} Controfferta.it. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3">
          <span>Private admin portal</span>
        </div>
      </footer>
    </div>
  );
}
