import { customerService } from "./customers";
import { leadService } from "./leads";
import { opportunityService } from "./opportunities";
import { catalogService } from "./catalog";
import { quoteService } from "./quotes";
import { orderService } from "./orders";
import { contractService } from "./contracts";
import { assetService } from "./assets";
import { serviceOrderService } from "./serviceOrders";
import { ticketService } from "./tickets";
import { inventoryService } from "./inventory";
import { financeService } from "./finance";
import { adminService } from "./admin";

/**
 * Camada de serviços por domínio unificada.
 */
export const services = {
  customers: customerService,
  leads: leadService,
  opportunities: opportunityService,
  catalog: catalogService,
  quotes: quoteService,
  orders: orderService,
  contracts: contractService,
  assets: assetService,
  serviceOrders: serviceOrderService,
  tickets: ticketService,
  inventory: inventoryService,
  finance: financeService,
  admin: adminService,
};

export type Services = typeof services;

export * from "./customers";
export * from "./leads";
export * from "./opportunities";
export * from "./catalog";
export * from "./quotes";
export * from "./orders";
export * from "./contracts";
export * from "./assets";
export * from "./serviceOrders";
export * from "./tickets";
export * from "./inventory";
export * from "./finance";
export * from "./admin";
export * from "./http";
