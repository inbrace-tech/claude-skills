export interface Ticket {
  id: string;
  subject: string;
  customerId: string;
  plan: "starter" | "team" | "enterprise";
  locale: string;
}

export type TicketLike = Pick<Ticket, "id" | "plan" | "locale"> & { openedAt: string; timezone: string };
