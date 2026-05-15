import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useServiceOrder,
  useCustomer,
  useAssets,
  useOrder,
  useContract,
  useTicket,
  useFinishServiceOrder,
  useAddTask,
  useToggleTask,
  useUpdateServiceOrder,
} from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import { ArrowLeft, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ServiceOrderStatus } from "@/types/serviceOrder";

export const Route = createFileRoute("/os/$id")({
  head: () => ({ meta: [{ title: "OS — GreenLink ADM" }] }),
  component: OSDetalhe,
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

function OSDetalhe() {
  const { id } = Route.useParams();
  const { data: os, isLoading: isLoadingOS } = useServiceOrder(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(os?.customerId);
  const { data: assets = [], isLoading: isLoadingAssets } = useAssets();
  const { data: pedidoRel, isLoading: isLoadingOrder } = useOrder(os?.orderId);
  const { data: contratoRel, isLoading: isLoadingContract } = useContract(os?.contractId);
  const { data: ticketRel, isLoading: isLoadingTicket } = useTicket(os?.ticketId);
  const finishOS = useFinishServiceOrder();
  const addTask = useAddTask();
  const toggleTask = useToggleTask();
  const updateOS = useUpdateServiceOrder();

  const [novaTarefa, setNovaTarefa] = useState("");

  const handleAddTask = async () => {
    if (!novaTarefa.trim()) return;
    try {
      await addTask.mutateAsync({ osId: os!.id, title: novaTarefa });
      setNovaTarefa("");
      toast.success("Tarefa adicionada.");
    } catch (err) {
      toast.error("Erro ao adicionar tarefa.");
    }
  };

  const isLoading =
    isLoadingOS ||
    isLoadingCustomer ||
    isLoadingAssets ||
    isLoadingOrder ||
    isLoadingContract ||
    isLoadingTicket;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!os) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">OS não encontrada.</p>
      </PageContainer>
    );
  }

  const vinculados = assets.filter((a) => a.id === os.assetId);
  const feitas = os.tasks.filter((t) => t.status === "done").length;

  return (
    <PageContainer>
      <Link
        to="/os"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ordens de Serviço
      </Link>
      <PageHeader
        title={`${os.osNumber} — ${os.description}`}
        description={`${cli?.legalName ?? "—"} · ${os.assignedTo ?? "Sem técnico"}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Select
              value={os.status}
              onValueChange={async (v) => {
                try {
                  await updateOS.mutateAsync({
                    id: os.id,
                    data: { status: v as ServiceOrderStatus },
                  });
                  toast.success("Status atualizado.");
                } catch (err) {
                  toast.error("Erro ao atualizar status.");
                }
              }}
              disabled={updateOS.isPending}
            >
              <SelectTrigger className="w-[160px]">
                {updateOS.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusLabel) as ServiceOrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {os.status !== "done" && (
              <Button
                disabled={finishOS.isPending}
                onClick={async () => {
                  try {
                    await finishOS.mutateAsync(os.id);
                    toast.success("OS concluída.");
                  } catch (err) {
                    toast.error("Erro ao concluir OS.");
                  }
                }}
              >
                {finishOS.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Concluir
              </Button>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                Checklist ({feitas}/{os.tasks.length})
              </h2>
            </div>
            <ul className="space-y-2">
              {os.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={t.status === "done"}
                    onCheckedChange={async () => {
                      try {
                        await toggleTask.mutateAsync({ osId: os.id, taskId: t.id });
                      } catch (err) {
                        toast.error("Erro ao atualizar tarefa.");
                      }
                    }}
                    disabled={toggleTask.isPending}
                  />
                  <span className={t.status === "done" ? "line-through text-muted-foreground" : ""}>
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Nova tarefa"
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTask();
                  }
                }}
              />
              <Button onClick={handleAddTask} disabled={addTask.isPending}>
                {addTask.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Registro</h2>
            <div className="mt-3">
              <label className="text-xs uppercase text-muted-foreground">
                Observações / Detalhes técnicos
              </label>
              <Textarea value={os.description} rows={3} readOnly />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Detalhes</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{statusLabel[os.status]}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prioridade</span>
                <span className="font-medium uppercase">{os.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aberta em</span>
                <span>{formatDate(os.createdAt)}</span>
              </div>
              {os.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Concluída em</span>
                  <span>{formatDate(os.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Vínculos</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedido</span>
                {pedidoRel ? (
                  <Link
                    to="/pedidos/$id"
                    params={{ id: pedidoRel.id }}
                    className="text-primary hover:underline"
                  >
                    {pedidoRel.orderNumber}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contrato</span>
                {contratoRel ? (
                  <Link
                    to="/contratos/$id"
                    params={{ id: contratoRel.id }}
                    className="text-primary hover:underline"
                  >
                    {contratoRel.contractNumber}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket</span>
                {ticketRel ? (
                  <Link
                    to="/suporte/$id"
                    params={{ id: ticketRel.id }}
                    className="text-primary hover:underline"
                  >
                    {ticketRel.ticketNumber}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Ativos vinculados</h2>
            {vinculados.length ? (
              <ul className="space-y-1 text-sm">
                {vinculados.map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <Link to="/ativos" className="hover:text-primary">
                      {a.assetTag}
                    </Link>
                    <span className="text-muted-foreground text-xs">{a.siteName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
