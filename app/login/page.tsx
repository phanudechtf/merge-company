"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  // mockup only — no auth, go straight to the dashboard
  const enter = () => router.push("/dashboard");

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-5 bg-gradient-to-br from-[#2a1a3e] via-[#3a2450] to-[#101a34]">
      {/* Vivid background — bold blurred colour blobs for the frost to catch */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-[26rem] w-[26rem] rounded-full bg-[#ff7a45] opacity-70 blur-[90px]" />
        <div className="absolute top-1/4 right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-[#e84c8a] opacity-70 blur-[100px]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#7c5cff] opacity-70 blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-[#38bdf8] opacity-50 blur-[90px]" />
      </div>

      {/* Frosted glass card */}
      <div className="relative w-full max-w-[400px] rounded-[28px] border border-white/25 bg-white/10 backdrop-blur-2xl shadow-[0_20px_70px_-20px_rgba(0,0,0,0.6)] p-8 sm:p-9 ring-1 ring-white/10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-9">
          <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center shadow-md overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merge-logo.png" alt="MERGE" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="leading-tight">
            <p className="text-white text-sm font-bold tracking-wide">MERGE Workspace</p>
            <p className="text-white/60 text-[10px]">SENSE ASIA CORPORATION</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-sm">เข้าสู่ระบบ</h1>
        <p className="text-sm text-white/70 mt-1.5 mb-8">ยินดีต้อนรับกลับสู่ MERGE Workspace</p>

        <form onSubmit={(e) => { e.preventDefault(); enter(); }} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-white/60 mb-1.5">
              อีเมล / ชื่อผู้ใช้
            </label>
            <input
              type="text"
              defaultValue="siri@senseasia.co"
              className="w-full bg-transparent border-b border-white/30 pb-2 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
              placeholder="you@company.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-white/60">รหัสผ่าน</label>
              <button type="button" className="text-[11px] text-white/70 hover:text-white transition-colors">
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                defaultValue="password123"
                className="w-full bg-transparent border-b border-white/30 pb-2 pr-8 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 bottom-2 text-white/50 hover:text-white transition-colors"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <button
            type="button"
            onClick={() => setRemember((v) => !v)}
            className="flex items-center gap-2.5 text-sm text-white/80 group"
          >
            <span
              className={
                "w-[18px] h-[18px] rounded-md flex items-center justify-center transition-all " +
                (remember ? "bg-white" : "border border-white/50 group-hover:border-white")
              }
            >
              {remember && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.5l2.2 2.2L9.5 3.8" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            จดจำการเข้าสู่ระบบ
          </button>

          {/* Primary */}
          <button
            type="submit"
            className="group w-full h-12 rounded-full bg-ink text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black shadow-lg shadow-black/30 transition-all active:scale-[0.99]"
          >
            เข้าสู่ระบบ
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Social */}
          <button
            type="button"
            onClick={enter}
            className="w-full h-12 rounded-full bg-white/90 text-ink text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-white shadow-sm transition-all active:scale-[0.99]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-8">
          ยังไม่มีบัญชี?{" "}
          <button className="text-white font-semibold hover:underline underline-offset-4">สมัครใช้งาน</button>
        </p>
      </div>
    </main>
  );
}
