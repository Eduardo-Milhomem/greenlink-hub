import { useAppStore } from "@/lib/mock/store";
import { Lead } from "@/types/lead";
import type { LeadStatus as MockLeadStatus, LeadOrigem } from "@/lib/mock/types";
import type { LeadStatus as DomainLeadStatus } from "@/types/lead";

const mockLeadStatusToDomain: Record<MockLeadStatus, Exclude<DomainLeadStatus, "convertido">> = {
  novo: "novo",
  contatado: "contatado",
  qualificado: "qualificado",
  descartado: "perdido",
};

const domainLeadStatusToMock: Record<DomainLeadStatus, MockLeadStatus> = {
  novo: "novo",
  contatado: "contatado",
  qualificado: "qualificado",
  perdido: "descartado",
  convertido: "qualificado",
};

const isLeadOrigem = (v: string | undefined): v is LeadOrigem =>
  v === "site" || v === "indicacao" || v === "evento" || v === "ads" || v === "outro";

export const leadService = {
  list: async (): Promise<Lead[]> => {
    const leads = useAppStore.getState().leads;
    return leads.map((l) => ({
      id: l.id,
      name: l.nome,
      companyName: l.empresa,
      email: l.email,
      phone: l.telefone,
      source: l.origem,
      status: l.convertidoEm || l.clienteId ? "convertido" : mockLeadStatusToDomain[l.status],
      notes: l.observacao,
      createdAt: l.criadoEm,
      updatedAt: l.criadoEm,
      convertedAt: l.convertidoEm,
      convertedCustomerId: l.clienteId,
    }));
  },

  create: async (data: Partial<Lead>) => {
    const addLead = useAppStore.getState().addLead;
    addLead({
      nome: data.name!,
      email: data.email,
      telefone: data.phone,
      empresa: data.companyName,
      origem: isLeadOrigem(data.source) ? data.source : "outro",
      status: data.status ? domainLeadStatusToMock[data.status] : "novo",
    });
  },

  update: async (id: string, data: Partial<Lead>) => {
    const updateLead = useAppStore.getState().updateLead;
    updateLead(id, {
      nome: data.name,
      email: data.email,
      telefone: data.phone,
      empresa: data.companyName,
      origem: isLeadOrigem(data.source) ? data.source : undefined,
      status: data.status ? domainLeadStatusToMock[data.status] : undefined,
    });
  },

  remove: async (id: string) => {
    const removeLead = useAppStore.getState().removeLead;
    removeLead(id);
  },

  convert: async (id: string, _customerId?: string) => {
    const convertLead = useAppStore.getState().converterLead;
    convertLead(id);
  },
};
