import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useAddUserRole, useAdminUsers, useRemoveUserRole, type AppRole } from "@/hooks/domain";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — GreenLink ADM" }] }),
  component: AdminUsersPage,
});

const allRoles: AppRole[] = ["admin", "manager", "operator", "viewer"];

function AdminUsersPage() {
  const { hasRole } = useAuth();
  const { data: users = [], isLoading } = useAdminUsers();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return users;
    return users.filter(
      (u) =>
        (u.fullName || "").toLowerCase().includes(qq) || (u.email || "").toLowerCase().includes(qq),
    );
  }, [q, users]);

  if (!hasRole("admin")) {
    return (
      <PageContainer>
        <PageHeader title="Usuários" description="Acesso restrito" />
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Você precisa ser admin para gerenciar permissões.
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Usuários" description={`${users.length} cadastrados`} />

      <Card className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                  <TableCell className="space-x-1">
                    {(u.roles.length ? u.roles : (["viewer"] as AppRole[])).map((r) => (
                      <Badge
                        key={`${u.id}-${r}`}
                        variant={r === "admin" ? "default" : "outline"}
                        className="uppercase text-[10px]"
                      >
                        {r}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      {allRoles.map((role) => {
                        const active = u.roles.includes(role);
                        const busy = addRole.isPending || removeRole.isPending;
                        return (
                          <Button
                            key={`${u.id}-${role}`}
                            size="sm"
                            variant={active ? "secondary" : "outline"}
                            disabled={busy}
                            onClick={async () => {
                              try {
                                if (active) await removeRole.mutateAsync({ userId: u.id, role });
                                else await addRole.mutateAsync({ userId: u.id, role });
                                toast.success(active ? "Role removida" : "Role adicionada");
                              } catch (e) {
                                toast.error("Falha ao atualizar role");
                              }
                            }}
                          >
                            {role}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
