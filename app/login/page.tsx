"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useUsersStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { users, addUser } = useUsersStore();

  const isFirstAccess = users.length === 0;
  const [mode, setMode] = useState<"login" | "register">(isFirstAccess ? "register" : "login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as User["role"],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const found = users.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
    );
    if (!found) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    login(found);
    router.push("/dashboard");
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    const exists = users.find((u) => u.email.toLowerCase() === form.email.toLowerCase());
    if (exists) {
      setError("Este e-mail já está cadastrado.");
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: isFirstAccess ? "admin" : form.role,
      avatar: "",
      department: "",
      phone: "",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addUser(newUser);
    login(newUser);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
            <span className="font-black text-black text-lg">V</span>
          </div>
          <div>
            <p className="font-black text-xl leading-none">Virgo Hub</p>
            <p className="text-gray-500 text-xs">Marketing Digital</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          {/* Header */}
          <div className="bg-black px-6 py-4 flex items-center gap-3">
            {mode === "login" ? (
              <LogIn size={18} className="text-yellow-400" />
            ) : (
              <UserPlus size={18} className="text-yellow-400" />
            )}
            <div>
              <h1 className="font-black text-white text-base leading-none">
                {mode === "login" ? "Entrar na conta" : isFirstAccess ? "Criar conta admin" : "Nova conta"}
              </h1>
              {isFirstAccess && mode === "register" && (
                <p className="text-yellow-400/80 text-xs mt-0.5">Primeiro acesso — você sera o administrador</p>
              )}
            </div>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="px-6 py-6 space-y-4"
          >
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Nome completo
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
                  className="w-full border-2 border-black px-3 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "register" && !isFirstAccess && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Perfil
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 bg-white transition-colors"
                >
                  <option value="admin">Administrador</option>
                  <option value="leader">Líder</option>
                  <option value="collaborator">Colaborador</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 px-3 py-2 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-yellow-400 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-black py-3 text-sm uppercase tracking-wide"
            >
              {mode === "login" ? "Entrar" : "Criar conta e entrar"}
            </button>

            {!isFirstAccess && (
              <div className="text-center pt-1">
                {mode === "login" ? (
                  <p className="text-sm text-gray-500">
                    Sem conta?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("register"); setError(""); }}
                      className="font-bold text-black underline underline-offset-2 hover:text-yellow-600 transition-colors"
                    >
                      Criar nova conta
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Já tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); }}
                      className="font-bold text-black underline underline-offset-2 hover:text-yellow-600 transition-colors"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Virgo Hub &copy; {new Date().getFullYear()} — Plataforma de Gestão para Agências
        </p>
      </div>
    </div>
  );
}
