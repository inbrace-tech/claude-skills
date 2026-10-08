export interface Account {
  id: string;
  plan: string;
  seats: number;
}

/** Reads an account from the help-desk backend. */
export async function lookupAccount(id: string): Promise<Account> {
  const response = await fetch(`${process.env.HELPDESK_BASE_URL}/accounts/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error(`account ${id}: ${response.status}`);
  return (await response.json()) as Account;
}
