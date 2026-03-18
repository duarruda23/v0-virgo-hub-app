"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useUsersStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const { login, currentUser } = useAuthStore();
  const { users, addUser } = useUsersStore();
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "collaborator" as User["role"],
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && currentUser) router.replace("/dashboard");
  }, [mounted, currentUser, router]);

  const isFirstAccess = mounted && users.length === 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Preencha todos os campos."); return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres."); return;
    }
    const exists = users.find((u) => u.email.toLowerCase() === form.email.toLowerCase());
    if (exists) {
      setError("Este e-mail já está cadastrado."); return;
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo-virgo.png" alt="Virgo Hub" width={180} height={60} className="object-contain" priority />
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="bg-black px-6 py-4">
            <div className="flex items-center gap-3">
              <UserPlus size={18} className="text-yellow-400" />
              <div>
                <h1 className="font-black text-white text-base leading-none">
                  {isFirstAccess ? "Criar conta administradora" : "Criar nova conta"}
                </h1>
                {isFirstAccess && (
                  <p className="text-yellow-400/80 text-xs mt-0.5">
                    Primeiro acesso — você sera o administrador do sistema
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Nome completo
              </label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Seu nome completo" autoComplete="name"
                className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                E-mail
              </label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="seu@email.com" autoComplete="email"
                className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <input
                  name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handleChange} placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                  className="w-full border-2 border-black px-3 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isFirstAccess && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Perfil de acesso
                </label>
                <select
                  name="role" value={form.role} onChange={handleChange}
                  className="w-full border-2 border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-yellow-50 bg-white transition-colors"
                >
                  <option value="admin">Administrador</option>
                  <option value="leader">Lider</option>
                  <option value="collaborator">Colaborador</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 px-3 py-2 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <button type="submit"
              className="w-full bg-yellow-400 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-black py-3 text-sm uppercase tracking-wide">
              {isFirstAccess ? "Criar conta e entrar" : "Cadastrar e entrar"}
            </button>

            {!isFirstAccess && (
              <div className="text-center pt-1">
                <p className="text-sm text-gray-500">
                  Ja tem conta?{" "}
                  <Link href="/login" className="font-bold text-black underline underline-offset-2 hover:text-yellow-600 transition-colors">
                    Fazer login
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Virgo Hub — Plataforma de Gestao para Agencias
        </p>
      </div>
    </div>
  );
}
