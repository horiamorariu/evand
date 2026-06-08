"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    // 1. Deconectare Firebase client (curăță token local)
    await signOut(auth);
    // 2. Șterge session cookie de pe server
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
    >
      Ieșire
    </button>
  );
}
