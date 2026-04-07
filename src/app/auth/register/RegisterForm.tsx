"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PROVINCES = [
  "NCD","Central","Milne Bay","Oro","Southern Highlands","Enga",
  "Western Highlands","Simbu","Eastern Highlands","Morobe","Madang",
  "East Sepik","West Sepik","Manus","New Ireland","East New Britain",
  "West New Britain","Bougainville","Western","Gulf","Hela","Jiwaka",
];

export default function RegisterForm() {
  const [form, setForm] = useState({
    full_name: "", business_name: "", phone: "",
    province: "", market_name: "", email: "", password: "",
  });
  const [error,    setError]    = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) { setError(authError.message); return; }
      if (!authData.user) { setError("Sign-up failed. Please try again."); return; }

      // 2. Insert vendor profile
      const { error: profileError } = await supabase.from("vendors").insert({
        auth_user_id:  authData.user.id,
        full_name:     form.full_name,
        business_name: form.business_name || null,
        phone:         form.phone         || null,
        province:      form.province      || null,
        market_name:   form.market_name   || null,
      });
      if (profileError) { setError(profileError.message); return; }

      router.push("/vendor");
      router.refresh();
    });
  }

  const field = (
    id: keyof typeof form,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean }
  ) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={opts?.type ?? "text"}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        required={opts?.required}
        placeholder={opts?.placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {field("full_name",     "Full name",      { required: true, placeholder: "e.g. Maria Kila" })}
        {field("business_name", "Business name",  { placeholder: "e.g. Maria's Trade Store" })}
        {field("phone",         "Phone number",   { placeholder: "e.g. 7123 4567" })}
        {field("market_name",   "Market / location", { placeholder: "e.g. Koki Market" })}

        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="province">Province</label>
          <select
            id="province"
            value={form.province}
            onChange={(e) => set("province", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white text-gray-700"
          >
            <option value="">Select province…</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <hr className="border-gray-100" />

        {field("email",    "Email",    { type: "email",    required: true, placeholder: "you@example.com" })}
        {field("password", "Password", { type: "password", required: true, placeholder: "Min. 8 characters" })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a href="/auth/login" className="text-emerald-600 hover:underline">Sign in</a>
      </p>
    </form>
  );
}
