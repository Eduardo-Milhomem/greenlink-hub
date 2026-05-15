import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useCustomers,
  useCreateOpportunity,
  useMoveOpportunity,
  useOpportunities,
} from "@/hooks/domain";
import { formatBRL } from "@/lib/formatters";
import type { Opportunity, OpportunityStage } from "@/types/opportunity";
import { Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — GreenLink ADM" }] }),
  component: Pipeline,
});

const STAGES: { id: OpportunityStage; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Ganho" },
  { id: "perdido", label: "Perdido" },
];

function Pipeline() {
  const { data: oportunidades = [] } = useOpportunities();
  const { data: clientes = [] } = useCustomers();
  const moverOportunidade = useMoveOpportunity();
  const criarOportunidade = useCreateOpportunity();
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [estagio, setEstagio] = useState<OpportunityStage>("novo");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (!clienteId && clientes.length) setClienteId(clientes[0].id);
  }, [clienteId, clientes]);

  const onDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id);
    const novoEstagio = e.over?.id as OpportunityStage | undefined;
    if (!novoEstagio) return;
    const opp = oportunidades.find((o) => o.id === id);
    if (opp && opp.stage !== novoEstagio) {
      void moverOportunidade.mutateAsync({ id, stage: novoEstagio }).then(() => {
        toast.success(`Movido para ${STAGES.find((s) => s.id === novoEstagio)?.label}`);
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Pipeline"
        description="Arraste os cards entre as colunas."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Nova oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova oportunidade</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    await criarOportunidade.mutateAsync({
                      title: String(fd.get("titulo")),
                      customerId: clienteId,
                      amount: Number(fd.get("valor") || 0),
                      stage: estagio,
                    });
                    toast.success("Oportunidade criada");
                    setOpen(false);
                  } catch (err) {
                    toast.error("Erro ao criar oportunidade");
                  }
                }}
              >
                <div className="space-y-1.5">
                  <Label>Título</Label>
                  <Input name="titulo" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Valor (R$)</Label>
                    <Input name="valor" type="number" step="0.01" defaultValue={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estágio</Label>
                    <Select
                      value={estagio}
                      onValueChange={(v) => setEstagio(v as OpportunityStage)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Criar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          {STAGES.map((s) => {
            const cards = oportunidades.filter((o) => o.stage === s.id);
            const total = cards.reduce((a, o) => a + o.amount, 0);
            return (
              <Coluna key={s.id} id={s.id} label={s.label} count={cards.length} total={total}>
                {cards.map((o) => (
                  <CardOportunidade
                    key={o.id}
                    opp={o}
                    cliente={clientes.find((c) => c.id === o.customerId)?.legalName ?? "—"}
                  />
                ))}
              </Coluna>
            );
          })}
        </div>
      </DndContext>
    </PageContainer>
  );
}

function Coluna({
  id,
  label,
  count,
  total,
  children,
}: {
  id: string;
  label: string;
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`snap-start shrink-0 w-72 rounded-xl border bg-muted/30 p-3 transition-colors ${isOver ? "bg-primary/10 border-primary/40" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">
            {count} · {formatBRL(total)}
          </p>
        </div>
      </div>
      <div className="space-y-2 min-h-[100px]">{children}</div>
    </div>
  );
}

function CardOportunidade({ opp, cliente }: { opp: Opportunity; cliente: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: opp.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-grab active:cursor-grabbing select-none ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{opp.title}</p>
          <p className="text-xs text-muted-foreground truncate">{cliente}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold">{formatBRL(opp.amount)}</span>
            {opp.assignedTo && (
              <Badge variant="outline" className="text-[10px]">
                {opp.assignedTo}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
