# GreenLink ADM — Prisma Schema para anexar no Lovable

Este arquivo contém o schema Prisma base do projeto GreenLink ADM, alinhado ao PRD v2 e à estrutura recomendada para o backend transacional.

## Objetivo

Use este arquivo como referência de modelagem para:

- entidades principais do sistema
- relacionamentos entre módulos
- enums de status e tipologias
- base para migrations e integração com PostgreSQL
- alinhamento entre frontend do Lovable e backend real

## Instruções para o Lovable

- Não simplificar ou fundir entidades que representam conceitos diferentes.
- Manter separação explícita entre `Lead`, `Opportunity`, `Quote`, `CustomerOrder`, `Contract`, `Receivable`, `Asset`, `ServiceOrder` e `SupportTicket`.
- Não substituir identificadores específicos por estruturas genéricas ambíguas.
- Se necessário, adaptar nomes técnicos do schema apenas quando houver motivo estrutural claro, preservando a semântica.

---

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  active
  inactive
}

enum CustomerType {
  pf
  pj
}

enum GenericStatus {
  active
  inactive
}

enum LeadStatus {
  novo
  contatado
  qualificado
  perdido
  convertido
}

enum OpportunityStage {
  novo
  qualificado
  proposta
  negociacao
  ganho
  perdido
}

enum CatalogItemType {
  product
  service
  kit
  rental
  manufactured
}

enum ContractType {
  sale_installation
  rental
  subscription
  support
  mixed
}

enum ContractStatus {
  draft
  active
  suspended
  expired
  cancelled
}

enum BillingFrequency {
  one_time
  monthly
  quarterly
  semiannual
  annual
}

enum BillingStatus {
  open
  partial
  paid
  overdue
  cancelled
}

enum AssetOwnerType {
  greenlink
  customer
  third_party
}

enum AssetStatus {
  available
  reserved
  installed
  rented
  maintenance
  returned
  inactive
}

enum StockMovementType {
  in
  out
  transfer
  adjustment
  reservation
  release
  consumption
  production_in
}

enum ProductionOrderStatus {
  planned
  released
  in_progress
  done
  cancelled
}

enum ServiceType {
  installation
  maintenance
  removal
  support
  inspection
  training
}

enum ServicePriority {
  low
  medium
  high
  urgent
}

enum ServiceOrderStatus {
  open
  scheduled
  in_route
  in_progress
  waiting_parts
  done
  cancelled
  return_required
}

enum TaskStatus {
  pending
  done
}

enum TicketPriority {
  low
  medium
  high
  urgent
}

enum TicketStatus {
  new
  in_progress
  waiting_customer
  resolved
  cancelled
}

enum FinancialCategoryType {
  revenue
  expense
}

enum EntryType {
  inflow
  outflow
}

enum QuoteStatus {
  draft
  sent
  approved
  rejected
  expired
  cancelled
}

enum OrderStatus {
  open
  approved
  invoiced
  partially_fulfilled
  fulfilled
  cancelled
}

model AppUser {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fullName           String            @map("full_name")
  email              String            @unique
  passwordHash       String?           @map("password_hash")
  status             UserStatus        @default(active)
  createdAt          DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime          @updatedAt @map("updated_at") @db.Timestamptz(6)
  roles              UserRole[]
  leadsAssigned      Lead[]            @relation("LeadAssignedTo")
  opportunities      Opportunity[]     @relation("OpportunityAssignedTo")
  quotesCreated      Quote[]           @relation("QuoteCreatedBy")
  quotesApproved     Quote[]           @relation("QuoteApprovedBy")
  ordersCreated      CustomerOrder[]   @relation("OrderCreatedBy")
  contractsCreated   Contract[]        @relation("ContractCreatedBy")
  serviceOrdersMade  ServiceOrder[]    @relation("ServiceOrderCreatedBy")
  serviceOrdersOwner ServiceOrder[]    @relation("ServiceOrderAssignedTo")
  ticketsAssigned    SupportTicket[]   @relation("TicketAssignedTo")
  comments           TicketComment[]
  commissions        Commission[]
  createdCustomers   Customer[]

  @@map("app_user")
}

model Role {
  id          String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String           @unique
  name        String
  description String?
  createdAt   DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)
  users       UserRole[]
  permissions RolePermission[]

  @@map("role")
}

model Permission {
  id          String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String           @unique
  name        String
  module      String
  createdAt   DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)
  roles       RolePermission[]

  @@map("permission")
}

model UserRole {
  userId String @map("user_id") @db.Uuid
  roleId String @map("role_id") @db.Uuid
  user   AppUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role    @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_role")
}

model RolePermission {
  roleId       String     @map("role_id") @db.Uuid
  permissionId String     @map("permission_id") @db.Uuid
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permission")
}

model Customer {
  id             String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  customerType   CustomerType     @map("customer_type")
  legalName      String           @map("legal_name")
  tradeName      String?          @map("trade_name")
  documentNumber String?          @map("document_number")
  email          String?
  phone          String?
  city           String?
  state          String?
  status         GenericStatus    @default(active)
  notes          String?
  createdBy      String?          @map("created_by") @db.Uuid
  createdAt      DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)
  creator        AppUser?         @relation(fields: [createdBy], references: [id])
  contacts       CustomerContact[]
  addresses      Address[]
  opportunities  Opportunity[]
  quotes         Quote[]
  orders         CustomerOrder[]
  contracts      Contract[]
  assets         Asset[]
  tickets        SupportTicket[]
  serviceOrders  ServiceOrder[]
  receivables    Receivable[]

  @@map("customer")
}

model CustomerContact {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  customerId  String          @map("customer_id") @db.Uuid
  fullName    String          @map("full_name")
  roleTitle   String?         @map("role_title")
  email       String?
  phone       String?
  isPrimary   Boolean         @default(false) @map("is_primary")
  createdAt   DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime        @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer    Customer        @relation(fields: [customerId], references: [id], onDelete: Cascade)
  openedTickets SupportTicket[] @relation("TicketOpenedByContact")
  comments    TicketComment[]

  @@map("customer_contact")
}

model Supplier {
  id             String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  legalName      String        @map("legal_name")
  tradeName      String?       @map("trade_name")
  documentNumber String?       @map("document_number")
  email          String?
  phone          String?
  city           String?
  state          String?
  status         GenericStatus @default(active)
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  addresses      Address[]
  payables       Payable[]
  expenses       Expense[]

  @@map("supplier")
}

model Address {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  customerId  String?   @map("customer_id") @db.Uuid
  supplierId  String?   @map("supplier_id") @db.Uuid
  label       String?
  street      String?
  number      String?
  complement  String?
  district    String?
  city        String?
  state       String?
  zipCode     String?   @map("zip_code")
  latitude    Decimal?  @db.Decimal(10, 7)
  longitude   Decimal?  @db.Decimal(10, 7)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
  supplier    Supplier? @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  assetSites  Asset[]
  warehouses  Warehouse[]
  serviceOrders ServiceOrder[]

  @@map("address")
}

model Lead {
  id                  String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                String
  companyName         String?       @map("company_name")
  email               String?
  phone               String?
  source              String?
  status              LeadStatus    @default(novo)
  assignedTo          String?       @map("assigned_to") @db.Uuid
  convertedCustomerId String?       @map("converted_customer_id") @db.Uuid
  convertedAt         DateTime?     @map("converted_at") @db.Timestamptz(6)
  notes               String?
  createdAt           DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  assignee            AppUser?      @relation("LeadAssignedTo", fields: [assignedTo], references: [id])
  convertedCustomer   Customer?     @relation(fields: [convertedCustomerId], references: [id])
  opportunities       Opportunity[]

  @@map("lead")
}

model Opportunity {
  id                String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  leadId            String?          @map("lead_id") @db.Uuid
  customerId        String?          @map("customer_id") @db.Uuid
  title             String
  stage             OpportunityStage @default(novo)
  amount            Decimal          @default(0) @db.Decimal(14, 2)
  expectedCloseDate DateTime?        @map("expected_close_date") @db.Date
  assignedTo        String?          @map("assigned_to") @db.Uuid
  winProbability    Decimal?         @map("win_probability") @db.Decimal(5, 2)
  notes             String?
  createdAt         DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt         DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)
  lead              Lead?            @relation(fields: [leadId], references: [id], onDelete: SetNull)
  customer          Customer?        @relation(fields: [customerId], references: [id], onDelete: SetNull)
  assignee          AppUser?         @relation("OpportunityAssignedTo", fields: [assignedTo], references: [id])
  quotes            Quote[]

  @@map("opportunity")
}

model CatalogItem {
  id            String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  itemCode      String          @unique @map("item_code")
  name          String
  itemType      CatalogItemType @map("item_type")
  unitCode      String          @map("unit_code")
  salePrice     Decimal         @default(0) @map("sale_price") @db.Decimal(14, 2)
  costPrice     Decimal         @default(0) @map("cost_price") @db.Decimal(14, 2)
  isActive      Boolean         @default(true) @map("is_active")
  trackStock    Boolean         @default(false) @map("track_stock")
  trackSerial   Boolean         @default(false) @map("track_serial")
  isRecurring   Boolean         @default(false) @map("is_recurring")
  description   String?
  createdAt     DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime        @updatedAt @map("updated_at") @db.Timestamptz(6)
  quoteItems    QuoteItem[]
  orderItems    CustomerOrderItem[]
  contractItems ContractItem[]
  assetModels   AssetModel[]
  assets        Asset[]
  inventory     InventoryBalance[]
  movements     StockMovement[]
  materialUsage ServiceMaterialUsage[]
  boms          Bom[]
  bomComponents BomItem[]       @relation("BomComponent")
  priceBookItems PriceBookItem[]

  @@map("catalog_item")
}

model KitItem {
  kitId           String      @map("kit_id") @db.Uuid
  componentItemId String      @map("component_item_id") @db.Uuid
  quantity        Decimal     @db.Decimal(14, 4)
  kit             CatalogItem @relation("KitOwner", fields: [kitId], references: [id], onDelete: Cascade)
  component       CatalogItem @relation("KitComponent", fields: [componentItemId], references: [id], onDelete: Restrict)

  @@id([kitId, componentItemId])
  @@map("kit_item")
}

model PriceBook {
  id         String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String
  status     GenericStatus   @default(active)
  createdAt  DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime        @updatedAt @map("updated_at") @db.Timestamptz(6)
  items      PriceBookItem[]

  @@map("price_book")
}

model PriceBookItem {
  priceBookId  String     @map("price_book_id") @db.Uuid
  catalogItemId String    @map("catalog_item_id") @db.Uuid
  price        Decimal    @db.Decimal(14, 2)
  priceBook    PriceBook  @relation(fields: [priceBookId], references: [id], onDelete: Cascade)
  catalogItem  CatalogItem @relation(fields: [catalogItemId], references: [id], onDelete: Cascade)

  @@id([priceBookId, catalogItemId])
  @@map("price_book_item")
}

model Quote {
  id             String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quoteNumber    String        @unique @map("quote_number")
  customerId     String        @map("customer_id") @db.Uuid
  opportunityId  String?       @map("opportunity_id") @db.Uuid
  status         QuoteStatus   @default(draft)
  issueDate      DateTime      @default(now()) @map("issue_date") @db.Date
  validUntil     DateTime?     @map("valid_until") @db.Date
  subtotal       Decimal       @default(0) @db.Decimal(14, 2)
  discountAmount Decimal       @default(0) @map("discount_amount") @db.Decimal(14, 2)
  totalAmount    Decimal       @default(0) @map("total_amount") @db.Decimal(14, 2)
  notes          String?
  approvedAt     DateTime?     @map("approved_at") @db.Timestamptz(6)
  approvedBy     String?       @map("approved_by") @db.Uuid
  createdBy      String?       @map("created_by") @db.Uuid
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer       Customer      @relation(fields: [customerId], references: [id])
  opportunity    Opportunity?  @relation(fields: [opportunityId], references: [id])
  approver       AppUser?      @relation("QuoteApprovedBy", fields: [approvedBy], references: [id])
  creator        AppUser?      @relation("QuoteCreatedBy", fields: [createdBy], references: [id])
  items          QuoteItem[]
  orders         CustomerOrder[]

  @@map("quote")
}

model QuoteItem {
  id             String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quoteId        String      @map("quote_id") @db.Uuid
  catalogItemId  String?     @map("catalog_item_id") @db.Uuid
  itemDescription String     @map("item_description")
  itemType       String      @map("item_type")
  quantity       Decimal     @default(1) @db.Decimal(14, 4)
  unitPrice      Decimal     @default(0) @map("unit_price") @db.Decimal(14, 2)
  discountAmount Decimal     @default(0) @map("discount_amount") @db.Decimal(14, 2)
  totalAmount    Decimal     @default(0) @map("total_amount") @db.Decimal(14, 2)
  sortOrder      Int         @default(0) @map("sort_order")
  quote          Quote       @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  catalogItem    CatalogItem? @relation(fields: [catalogItemId], references: [id])

  @@map("quote_item")
}

model CustomerOrder {
  id             String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderNumber    String            @unique @map("order_number")
  quoteId        String?           @map("quote_id") @db.Uuid
  customerId     String            @map("customer_id") @db.Uuid
  status         OrderStatus       @default(open)
  orderDate      DateTime          @default(now()) @map("order_date") @db.Date
  subtotal       Decimal           @default(0) @db.Decimal(14, 2)
  discountAmount Decimal           @default(0) @map("discount_amount") @db.Decimal(14, 2)
  totalAmount    Decimal           @default(0) @map("total_amount") @db.Decimal(14, 2)
  notes          String?
  createdBy      String?           @map("created_by") @db.Uuid
  createdAt      DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime          @updatedAt @map("updated_at") @db.Timestamptz(6)
  quote          Quote?            @relation(fields: [quoteId], references: [id])
  customer       Customer          @relation(fields: [customerId], references: [id])
  creator        AppUser?          @relation("OrderCreatedBy", fields: [createdBy], references: [id])
  items          CustomerOrderItem[]
  contracts      Contract[]
  serviceOrders  ServiceOrder[]
  receivables    Receivable[]

  @@map("customer_order")
}

model CustomerOrderItem {
  id               String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId          String        @map("order_id") @db.Uuid
  catalogItemId    String?       @map("catalog_item_id") @db.Uuid
  description      String
  itemType         String        @map("item_type")
  quantity         Decimal       @default(1) @db.Decimal(14, 4)
  unitPrice        Decimal       @default(0) @map("unit_price") @db.Decimal(14, 2)
  totalAmount      Decimal       @default(0) @map("total_amount") @db.Decimal(14, 2)
  serviceStartDate DateTime?     @map("service_start_date") @db.Date
  serviceEndDate   DateTime?     @map("service_end_date") @db.Date
  order            CustomerOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  catalogItem      CatalogItem?  @relation(fields: [catalogItemId], references: [id])

  @@map("customer_order_item")
}

model Contract {
  id               String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contractNumber   String                @unique @map("contract_number")
  customerId       String                @map("customer_id") @db.Uuid
  orderId          String?               @map("order_id") @db.Uuid
  contractType     ContractType          @map("contract_type")
  status           ContractStatus        @default(active)
  startDate        DateTime              @map("start_date") @db.Date
  endDate          DateTime?             @map("end_date") @db.Date
  billingFrequency BillingFrequency?     @map("billing_frequency")
  monthlyAmount    Decimal               @default(0) @map("monthly_amount") @db.Decimal(14, 2)
  priceIndexer     String?               @map("price_indexer")
  autoRenew        Boolean               @default(false) @map("auto_renew")
  notes            String?
  createdBy        String?               @map("created_by") @db.Uuid
  createdAt        DateTime              @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime              @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer         Customer              @relation(fields: [customerId], references: [id])
  order            CustomerOrder?        @relation(fields: [orderId], references: [id])
  creator          AppUser?              @relation("ContractCreatedBy", fields: [createdBy], references: [id])
  items            ContractItem[]
  billingCycles    ContractBillingCycle[]
  deposits         Deposit[]
  assets           Asset[]
  tickets          SupportTicket[]
  serviceOrders    ServiceOrder[]
  receivables      Receivable[]

  @@map("contract")
}

model ContractItem {
  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contractId       String             @map("contract_id") @db.Uuid
  catalogItemId    String?            @map("catalog_item_id") @db.Uuid
  description      String
  quantity         Decimal            @default(1) @db.Decimal(14, 4)
  unitPrice        Decimal            @default(0) @map("unit_price") @db.Decimal(14, 2)
  billingFrequency BillingFrequency?  @map("billing_frequency")
  startDate        DateTime?          @map("start_date") @db.Date
  endDate          DateTime?          @map("end_date") @db.Date
  isRecurring      Boolean            @default(false) @map("is_recurring")
  contract         Contract           @relation(fields: [contractId], references: [id], onDelete: Cascade)
  catalogItem      CatalogItem?       @relation(fields: [catalogItemId], references: [id])

  @@map("contract_item")
}

model ContractBillingCycle {
  id           String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contractId   String         @map("contract_id") @db.Uuid
  cycleStart   DateTime       @map("cycle_start") @db.Date
  cycleEnd     DateTime       @map("cycle_end") @db.Date
  dueDate      DateTime       @map("due_date") @db.Date
  amount       Decimal        @db.Decimal(14, 2)
  status       BillingStatus  @default(open)
  receivableId String?        @map("receivable_id") @db.Uuid
  createdAt    DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)
  contract     Contract       @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@map("contract_billing_cycle")
}

model Deposit {
  id         String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contractId String      @map("contract_id") @db.Uuid
  amount     Decimal     @db.Decimal(14, 2)
  status     String      @default("held")
  receivedAt DateTime?   @map("received_at") @db.Date
  returnedAt DateTime?   @map("returned_at") @db.Date
  notes      String?
  createdAt  DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime    @updatedAt @map("updated_at") @db.Timestamptz(6)
  contract   Contract    @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@map("deposit")
}

model AssetModel {
  id            String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  catalogItemId String?     @map("catalog_item_id") @db.Uuid
  name          String
  manufacturer  String?
  assetType     String      @map("asset_type")
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime    @updatedAt @map("updated_at") @db.Timestamptz(6)
  catalogItem   CatalogItem? @relation(fields: [catalogItemId], references: [id])
  assets        Asset[]

  @@map("asset_model")
}

model Asset {
  id            String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assetTag      String        @unique @map("asset_tag")
  assetModelId  String?       @map("asset_model_id") @db.Uuid
  catalogItemId String?       @map("catalog_item_id") @db.Uuid
  serialNumber  String?       @unique @map("serial_number")
  ownerType     AssetOwnerType @default(greenlink) @map("owner_type")
  customerId    String?       @map("customer_id") @db.Uuid
  contractId    String?       @map("contract_id") @db.Uuid
  status        AssetStatus   @default(available)
  siteName      String?       @map("site_name")
  addressId     String?       @map("address_id") @db.Uuid
  installedAt   DateTime?     @map("installed_at") @db.Timestamptz(6)
  lastReadingAt DateTime?     @map("last_reading_at") @db.Timestamptz(6)
  notes         String?
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  model         AssetModel?   @relation(fields: [assetModelId], references: [id])
  catalogItem   CatalogItem?  @relation(fields: [catalogItemId], references: [id])
  customer      Customer?     @relation(fields: [customerId], references: [id])
  contract      Contract?     @relation(fields: [contractId], references: [id])
  address       Address?      @relation(fields: [addressId], references: [id])
  events        AssetEvent[]
  tickets       SupportTicket[]
  serviceOrders ServiceOrder[]

  @@map("asset")
}

model AssetEvent {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assetId        String   @map("asset_id") @db.Uuid
  eventType      String   @map("event_type")
  eventDate      DateTime @default(now()) @map("event_date") @db.Timestamptz(6)
  serviceOrderId String?  @map("service_order_id") @db.Uuid
  description    String?
  metadata       Json     @default("{}")
  createdBy      String?  @map("created_by") @db.Uuid
  asset          Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@map("asset_event")
}

model Warehouse {
  id         String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code       String             @unique
  name       String
  addressId  String?            @map("address_id") @db.Uuid
  createdAt  DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime           @updatedAt @map("updated_at") @db.Timestamptz(6)
  address    Address?           @relation(fields: [addressId], references: [id])
  inventory  InventoryBalance[]
  movementsFrom StockMovement[] @relation("MovementSourceWarehouse")
  movementsTo   StockMovement[] @relation("MovementTargetWarehouse")
  productionOrders ProductionOrder[]
  usage       ServiceMaterialUsage[]

  @@map("warehouse")
}

model InventoryBalance {
  warehouseId   String      @map("warehouse_id") @db.Uuid
  catalogItemId String      @map("catalog_item_id") @db.Uuid
  onHand        Decimal     @default(0) @map("on_hand") @db.Decimal(14, 4)
  reserved      Decimal     @default(0) @db.Decimal(14, 4)
  minimumStock  Decimal     @default(0) @map("minimum_stock") @db.Decimal(14, 4)
  warehouse     Warehouse   @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  catalogItem   CatalogItem @relation(fields: [catalogItemId], references: [id], onDelete: Cascade)

  @@id([warehouseId, catalogItemId])
  @@map("inventory_balance")
}

model StockMovement {
  id               String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  movementType     StockMovementType @map("movement_type")
  catalogItemId    String            @map("catalog_item_id") @db.Uuid
  sourceWarehouseId String?          @map("source_warehouse_id") @db.Uuid
  targetWarehouseId String?          @map("target_warehouse_id") @db.Uuid
  quantity         Decimal           @db.Decimal(14, 4)
  referenceType    String?           @map("reference_type")
  referenceId      String?           @map("reference_id") @db.Uuid
  occurredAt       DateTime          @default(now()) @map("occurred_at") @db.Timestamptz(6)
  notes            String?
  createdBy        String?           @map("created_by") @db.Uuid
  catalogItem      CatalogItem       @relation(fields: [catalogItemId], references: [id])
  sourceWarehouse  Warehouse?        @relation("MovementSourceWarehouse", fields: [sourceWarehouseId], references: [id])
  targetWarehouse  Warehouse?        @relation("MovementTargetWarehouse", fields: [targetWarehouseId], references: [id])

  @@map("stock_movement")
}

model Bom {
  id             String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  finishedItemId String          @map("finished_item_id") @db.Uuid
  version        String          @default("v1")
  isActive       Boolean         @default(true) @map("is_active")
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime        @updatedAt @map("updated_at") @db.Timestamptz(6)
  finishedItem   CatalogItem     @relation(fields: [finishedItemId], references: [id])
  items          BomItem[]
  productionOrders ProductionOrder[]

  @@map("bom")
}

model BomItem {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  bomId           String      @map("bom_id") @db.Uuid
  componentItemId String      @map("component_item_id") @db.Uuid
  quantity        Decimal     @db.Decimal(14, 4)
  bom             Bom         @relation(fields: [bomId], references: [id], onDelete: Cascade)
  component       CatalogItem @relation("BomComponent", fields: [componentItemId], references: [id])

  @@map("bom_item")
}

model ProductionOrder {
  id              String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderNumber     String                @unique @map("order_number")
  bomId           String?               @map("bom_id") @db.Uuid
  finishedItemId  String                @map("finished_item_id") @db.Uuid
  warehouseId     String?               @map("warehouse_id") @db.Uuid
  plannedQuantity Decimal               @map("planned_quantity") @db.Decimal(14, 4)
  producedQuantity Decimal              @default(0) @map("produced_quantity") @db.Decimal(14, 4)
  status          ProductionOrderStatus @default(planned)
  plannedStartDate DateTime?            @map("planned_start_date") @db.Date
  plannedEndDate  DateTime?             @map("planned_end_date") @db.Date
  actualEndAt     DateTime?             @map("actual_end_at") @db.Timestamptz(6)
  notes           String?
  createdBy       String?               @map("created_by") @db.Uuid
  createdAt       DateTime              @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime              @updatedAt @map("updated_at") @db.Timestamptz(6)
  bom             Bom?                  @relation(fields: [bomId], references: [id])
  finishedItem    CatalogItem           @relation(fields: [finishedItemId], references: [id])
  warehouse       Warehouse?            @relation(fields: [warehouseId], references: [id])

  @@map("production_order")
}

model ServiceOrder {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  osNumber        String             @unique @map("os_number")
  customerId      String             @map("customer_id") @db.Uuid
  contractId      String?            @map("contract_id") @db.Uuid
  assetId         String?            @map("asset_id") @db.Uuid
  orderId         String?            @map("order_id") @db.Uuid
  ticketId        String?            @map("ticket_id") @db.Uuid
  serviceType     ServiceType        @map("service_type")
  priority        ServicePriority    @default(medium)
  status          ServiceOrderStatus @default(open)
  scheduledStart  DateTime?          @map("scheduled_start") @db.Timestamptz(6)
  scheduledEnd    DateTime?          @map("scheduled_end") @db.Timestamptz(6)
  completedAt     DateTime?          @map("completed_at") @db.Timestamptz(6)
  siteAddressId   String?            @map("site_address_id") @db.Uuid
  description     String?
  createdBy       String?            @map("created_by") @db.Uuid
  assignedTo      String?            @map("assigned_to") @db.Uuid
  createdAt       DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime           @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer        Customer           @relation(fields: [customerId], references: [id])
  contract        Contract?          @relation(fields: [contractId], references: [id])
  asset           Asset?             @relation(fields: [assetId], references: [id])
  order           CustomerOrder?     @relation(fields: [orderId], references: [id])
  ticket          SupportTicket?     @relation(fields: [ticketId], references: [id])
  siteAddress     Address?           @relation(fields: [siteAddressId], references: [id])
  creator         AppUser?           @relation("ServiceOrderCreatedBy", fields: [createdBy], references: [id])
  assignee        AppUser?           @relation("ServiceOrderAssignedTo", fields: [assignedTo], references: [id])
  tasks           ServiceOrderTask[]
  materialUsage   ServiceMaterialUsage[]

  @@map("service_order")
}

model ServiceOrderTask {
  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serviceOrderId String     @map("service_order_id") @db.Uuid
  title          String
  status         TaskStatus @default(pending)
  sortOrder      Int        @default(0) @map("sort_order")
  completedAt    DateTime?  @map("completed_at") @db.Timestamptz(6)
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)

  @@map("service_order_task")
}

model ServiceMaterialUsage {
  id             String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serviceOrderId String      @map("service_order_id") @db.Uuid
  catalogItemId  String      @map("catalog_item_id") @db.Uuid
  warehouseId    String?     @map("warehouse_id") @db.Uuid
  quantity       Decimal     @db.Decimal(14, 4)
  notes          String?
  createdAt      DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)
  catalogItem    CatalogItem  @relation(fields: [catalogItemId], references: [id])
  warehouse      Warehouse?   @relation(fields: [warehouseId], references: [id])

  @@map("service_material_usage")
}

model SupportTicket {
  id               String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ticketNumber     String         @unique @map("ticket_number")
  customerId       String         @map("customer_id") @db.Uuid
  contractId       String?        @map("contract_id") @db.Uuid
  assetId          String?        @map("asset_id") @db.Uuid
  channel          String?
  subject          String
  description      String?
  category         String?
  priority         TicketPriority @default(medium)
  status           TicketStatus   @default(new)
  slaDueAt         DateTime?      @map("sla_due_at") @db.Timestamptz(6)
  assignedTo       String?        @map("assigned_to") @db.Uuid
  openedByContactId String?       @map("opened_by_contact_id") @db.Uuid
  createdAt        DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)
  resolvedAt       DateTime?      @map("resolved_at") @db.Timestamptz(6)
  customer         Customer       @relation(fields: [customerId], references: [id])
  contract         Contract?      @relation(fields: [contractId], references: [id])
  asset            Asset?         @relation(fields: [assetId], references: [id])
  assignee         AppUser?       @relation("TicketAssignedTo", fields: [assignedTo], references: [id])
  openedByContact  CustomerContact? @relation("TicketOpenedByContact", fields: [openedByContactId], references: [id])
  comments         TicketComment[]
  serviceOrders    ServiceOrder[]

  @@map("support_ticket")
}

model TicketComment {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ticketId        String          @map("ticket_id") @db.Uuid
  authorUserId    String?         @map("author_user_id") @db.Uuid
  authorContactId String?         @map("author_contact_id") @db.Uuid
  isInternal      Boolean         @default(true) @map("is_internal")
  body            String
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  ticket          SupportTicket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  authorUser      AppUser?        @relation(fields: [authorUserId], references: [id])
  authorContact   CustomerContact? @relation(fields: [authorContactId], references: [id])

  @@map("ticket_comment")
}

model FinancialCategory {
  id           String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code         String                @unique
  name         String
  categoryType FinancialCategoryType @map("category_type")
  createdAt    DateTime              @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime              @updatedAt @map("updated_at") @db.Timestamptz(6)
  receivables  Receivable[]
  payables     Payable[]
  expenses     Expense[]

  @@map("financial_category")
}

model CostCenter {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String       @unique
  name        String
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz(6)
  receivables Receivable[]
  payables    Payable[]
  expenses    Expense[]

  @@map("cost_center")
}

model Receivable {
  id            String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  description   String
  customerId    String         @map("customer_id") @db.Uuid
  contractId    String?        @map("contract_id") @db.Uuid
  orderId       String?        @map("order_id") @db.Uuid
  categoryId    String?        @map("category_id") @db.Uuid
  costCenterId  String?        @map("cost_center_id") @db.Uuid
  issueDate     DateTime       @default(now()) @map("issue_date") @db.Date
  dueDate       DateTime       @map("due_date") @db.Date
  amount        Decimal        @db.Decimal(14, 2)
  openAmount    Decimal        @map("open_amount") @db.Decimal(14, 2)
  status        BillingStatus  @default(open)
  originType    String?        @map("origin_type")
  originId      String?        @map("origin_id") @db.Uuid
  createdAt     DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)
  customer      Customer       @relation(fields: [customerId], references: [id])
  contract      Contract?      @relation(fields: [contractId], references: [id])
  order         CustomerOrder? @relation(fields: [orderId], references: [id])
  category      FinancialCategory? @relation(fields: [categoryId], references: [id])
  costCenter    CostCenter?    @relation(fields: [costCenterId], references: [id])
  payments      ReceivablePayment[]

  @@map("receivable")
}

model ReceivablePayment {
  id           String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  receivableId String     @map("receivable_id") @db.Uuid
  paymentDate  DateTime   @map("payment_date") @db.Date
  amount       Decimal    @db.Decimal(14, 2)
  method       String?
  reference    String?
  notes        String?
  createdAt    DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  receivable   Receivable @relation(fields: [receivableId], references: [id], onDelete: Cascade)

  @@map("receivable_payment")
}

model Payable {
  id           String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  description  String
  supplierId   String?             @map("supplier_id") @db.Uuid
  categoryId   String?             @map("category_id") @db.Uuid
  costCenterId String?             @map("cost_center_id") @db.Uuid
  issueDate    DateTime            @default(now()) @map("issue_date") @db.Date
  dueDate      DateTime            @map("due_date") @db.Date
  amount       Decimal             @db.Decimal(14, 2)
  openAmount   Decimal             @map("open_amount") @db.Decimal(14, 2)
  status       BillingStatus       @default(open)
  createdAt    DateTime            @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime            @updatedAt @map("updated_at") @db.Timestamptz(6)
  supplier     Supplier?           @relation(fields: [supplierId], references: [id])
  category     FinancialCategory?  @relation(fields: [categoryId], references: [id])
  costCenter   CostCenter?         @relation(fields: [costCenterId], references: [id])
  payments     PayablePayment[]

  @@map("payable")
}

model PayablePayment {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  payableId   String   @map("payable_id") @db.Uuid
  paymentDate DateTime @map("payment_date") @db.Date
  amount      Decimal  @db.Decimal(14, 2)
  method      String?
  reference   String?
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  payable     Payable  @relation(fields: [payableId], references: [id], onDelete: Cascade)

  @@map("payable_payment")
}

model Expense {
  id           String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  description  String
  supplierId   String?             @map("supplier_id") @db.Uuid
  categoryId   String?             @map("category_id") @db.Uuid
  costCenterId String?             @map("cost_center_id") @db.Uuid
  expenseDate  DateTime            @map("expense_date") @db.Date
  amount       Decimal             @db.Decimal(14, 2)
  notes        String?
  createdAt    DateTime            @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime            @updatedAt @map("updated_at") @db.Timestamptz(6)
  supplier     Supplier?           @relation(fields: [supplierId], references: [id])
  category     FinancialCategory?  @relation(fields: [categoryId], references: [id])
  costCenter   CostCenter?         @relation(fields: [costCenterId], references: [id])

  @@map("expense")
}

model Commission {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  referenceType    String    @map("reference_type")
  referenceId      String    @map("reference_id") @db.Uuid
  baseAmount       Decimal   @map("base_amount") @db.Decimal(14, 2)
  ratePercent      Decimal   @map("rate_percent") @db.Decimal(7, 4)
  commissionAmount Decimal   @map("commission_amount") @db.Decimal(14, 2)
  status           String    @default("pending")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  user             AppUser   @relation(fields: [userId], references: [id])

  @@map("commission")
}

model CashEntry {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  entryType    EntryType @map("entry_type")
  referenceType String?  @map("reference_type")
  referenceId  String?   @map("reference_id") @db.Uuid
  occurredAt   DateTime  @default(now()) @map("occurred_at") @db.Timestamptz(6)
  amount       Decimal   @db.Decimal(14, 2)
  description  String
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("cash_entry")
}

model Attachment {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  entityType    String   @map("entity_type")
  entityId      String   @map("entity_id") @db.Uuid
  fileName      String   @map("file_name")
  mimeType      String?  @map("mime_type")
  storagePath   String   @map("storage_path")
  fileSizeBytes BigInt?  @map("file_size_bytes")
  checksum      String?
  uploadedBy    String?  @map("uploaded_by") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("attachment")
}

model AuditLog {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  actorUserId   String?  @map("actor_user_id") @db.Uuid
  entityType    String   @map("entity_type")
  entityId      String   @map("entity_id") @db.Uuid
  action        String
  oldData       Json?    @map("old_data")
  newData       Json?    @map("new_data")
  metadata      Json     @default("{}")
  correlationId String?  @map("correlation_id") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("audit_log")
}

model OutboxEvent {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  eventName   String    @map("event_name")
  entityType  String    @map("entity_type")
  entityId    String    @map("entity_id") @db.Uuid
  payload     Json
  status      String    @default("pending")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  processedAt DateTime? @map("processed_at") @db.Timestamptz(6)

  @@map("outbox_event")
}
```
