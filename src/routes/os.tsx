import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useServiceOrders, useCustomers, useCreateServiceOrder } from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import { Plus, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ServiceOrderStatus, ServicePriority } from "@/types/serviceOrder";

export const Route = createFileRoute("/os")({
  head: () => ({ meta: [{ title: "Ordens de Serviço — GreenLink ADM" }] }),
  component: OSList,
});

const statusLabel: Record<ServiceOrderStatus, string> = {
  open: "Aberta",
  scheduled: "Agendada",
  in_route: "Em rota",
  in_progress: "Em execução",
  waiting_parts: "Aguardando peças",
  done: "Concluída",
  cancelled: "Cancelada",
  return_required: "Retorno necessário",
};

const prioColor: Record<ServicePriority, string> = {
  low: "bg-muted text-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/15 text-warning-foreground",
  urgent: "bg-destructive/15 text-destructive",
};

const isServiceOrderStatus = (v: string): v is ServiceOrderStatus => v in statusLabel;

function OSList() {
  const { data: ordens = [], isLoading: isLoadingOS } = useServiceOrders();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const createOS = useCreateServiceOrder();

  const [filter, setFilter] = useState<"todas" | ServiceOrderStatus>("todas");
  const [tecnico, setTecnico] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    customerId: "",
    priority: "medium" as ServicePriority,
    assignedTo: "",
  });

  const isLoading = isLoadingOS || isLoadingCustomers;

  const tecnicos = Array.from(
    new Set(ordens.map((o) => o.assignedTo).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const filtradas = ordens.filter((o) => {
    if (filter !== "todas" && o.status !== filter) return false;
    if (tecnico !== "todos" && (o.assignedTo ?? "Sem técnico") !== tecnico) return false;
    return true;
  });

  const submit = async () => {
    if (!form.description || !form.customerId) {
      toast.error("Preencha título e cliente.");
      return;
    }
    try {
      await createOS.mutateAsync({
        osNumber: `OS-${Math.floor(Math.random() * 10000)}`,
        description: form.description,
        customerId: form.customerId,
        priority: form.priority,
        assignedTo: form.assignedTo,
        status: "open",
      });
      toast.success("OS criada.");
      setOpen(false);
      setForm({ description: "", customerId: "", priority: "medium", assignedTo: "" });
    } catch (err) {
      toast.error("Erro ao criar OS.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} OS · ${ordens.filter((o) => o.status !== "done" && o.status !== "cancelled").length} em aberto`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova OS</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={form.customerId}
                    onValueChange={(v) => setForm({ ...form, customerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prioridade</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) => setForm({ ...form, priority: v as ServicePriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Técnico</Label>
                    <Input
                      value={form.assignedTo}
                      onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit} disabled={createOS.isPending}>
                  {createOS.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(v) => {
          if (v === "todas") setFilter("todas");
          else if (isServiceOrderStatus(v)) setFilter(v);
        }}
        className="mb-4"
      >
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="todas">Todas ({ordens.length})</TabsTrigger>
          {(Object.keys(statusLabel) as ServiceOrderStatus[]).map((s) => (
            <TabsTrigger key={s} value={s}>
              {statusLabel[s]} ({ordens.filter((o) => o.status === s).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="w-full sm:w-[260px]">
          <Label>Técnico</Label>
          <Select value={tecnico} onValueChange={setTecnico}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Sem técnico">Sem técnico</SelectItem>
              {tecnicos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map((o) => {
            const cli = customers.find((c) => c.id === o.customerId);
            const total = o.tasks.length;
            const feitas = o.tasks.filter((t) => t.status === "done").length;
            return (
              <Link key={o.id} to="/os/$id" params={{ id: o.id }}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{o.osNumber}</span>
                    <span
                      className={`text-[10px] uppercase tracking-wide rounded-md px-2 py-0.5 ${prioColor[o.priority]}`}
                    >
                      {o.priority}
                    </span>
                  </div>
                  <p className="font-medium leading-tight">{o.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cli?.legalName ?? "—"}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
                    <Badge variant="outline">{statusLabel[o.status]}</Badge>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      {o.createdAt && (
                        <>
                          <Clock className="h-3 w-3" />
                          {formatDate(o.createdAt)}
                        </>
                      )}
                    </span>
                  </div>
                  {total > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(feitas / total) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {feitas}/{total} tarefas
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
          {!filtradas.length && <p className="text-sm text-muted-foreground">Nenhuma OS.</p>}
        </div>
      )}
    </PageContainer>
  );
}
