import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — GreenLink ADM" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Verifique seu e-mail para redefinir a senha.");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada! Faça login.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold">{recoveryMode ? "Nova senha" : "Recuperar senha"}</h1>
        {recoveryMode ? (
          <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
            <div className="space-y-1.5">
              <Label htmlFor="np">Nova senha</Label>
              <Input id="np" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>Atualizar senha</Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleRequest}>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>Enviar link</Button>
          </form>
        )}
        <p className="mt-4 text-xs text-center text-muted-foreground">
          <Link to="/login" className="hover:underline">Voltar para login</Link>
        </p>
      </Card>
    </div>
  );
}