const BASE_URL = process.env.HELPDESK_BASE_URL ?? "https://sandbox.help.example.com";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v2${path}`);
  if (!res.ok) throw new Error(`help desk ${path}: ${res.status}`);
  return (await res.json()) as T;
}

export const helpdesk = {
  thread: (ticketId: string) => get<unknown[]>(`/tickets/${ticketId}/messages`),
  searchKb: (query: string) => get<unknown[]>(`/kb/search?q=${encodeURIComponent(query)}`),
  refunds: (customerId: string) => get<unknown[]>(`/customers/${customerId}/refunds`),
};
