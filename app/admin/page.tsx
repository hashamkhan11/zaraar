"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { Watch, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginForm { email: string; password: string; }

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true); setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C] flex items-center justify-center">
              <Watch className="w-4.5 h-4.5 text-[#0A0A0A]" strokeWidth={1.75} />
            </div>
            <span className="font-display font-light text-[1.3rem] tracking-[0.3em] text-[#F5F5F0] uppercase">ZARAAR</span>
          </div>
          <p className="eyebrow-dark">Admin Panel</p>
        </div>

        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h1 className="font-display font-light text-[1.4rem] text-[#F5F5F0] mb-6">Sign In</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                className={`zaraar-input ${errors.email ? "border-red-400" : ""}`}
                {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`zaraar-input pr-9 ${errors.password ? "border-red-400" : ""}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-0 bottom-3 text-white/40 hover:text-[#C9A84C] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#B8954A] text-[#0A0A0A] font-body text-[11px] font-bold tracking-[0.18em] uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</> : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center eyebrow-dark mt-7">Authorized Personnel Only</p>
      </div>
    </div>
  );
}
