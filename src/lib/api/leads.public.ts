/**
 * Public lead API — no authentication required.
 * Used by the tokenized registration and deposit form pages.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    const message =
      json?.message || json?.error || "Something went wrong. Please try again.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return json as T;
}

async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    // No Content-Type — browser sets multipart boundary automatically
  });

  const json = await res.json();
  if (!res.ok) {
    const message =
      json?.message || json?.error || "Something went wrong. Please try again.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return json as T;
}

export interface SubmitRegistrationPayload {
  registrationToken: string;
  email?: string;
  hfmBrokerId?: string;
  phoneNumber?: string;
}

export interface SubmitDepositPayload {
  depositToken: string;
  depositBalance: string;
  hfmBrokerId?: string;
  notes?: string;
  files?: File[];
}

export async function submitRegistration(
  payload: SubmitRegistrationPayload,
): Promise<{ message: string }> {
  return postJson("/leads/submit-info", payload);
}

export async function submitDeposit(
  payload: SubmitDepositPayload,
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("depositToken", payload.depositToken);
  formData.append("depositBalance", payload.depositBalance);
  if (payload.hfmBrokerId) formData.append("hfmBrokerId", payload.hfmBrokerId);
  if (payload.notes) formData.append("notes", payload.notes);
  if (payload.files?.length) {
    payload.files.forEach((f) => formData.append("receipts", f));
  }
  return postForm("/leads/submit-deposit", formData);
}

// ── Combined form endpoints ──────────────────────────────────────────────────

export interface TokenInfo {
  type: "register" | "deposit";
  displayName: string | null;
  status: string;
  hfmBrokerId: string | null;
}

export async function getTokenInfo(token: string): Promise<{ data: TokenInfo }> {
  const res = await fetch(`${API_BASE}/leads/token-info?token=${encodeURIComponent(token)}`);
  const json = await res.json();
  if (!res.ok) {
    const message = json?.message || json?.error || "Invalid or expired link.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return json;
}

export interface SubmitFormPayload {
  token: string;
  hfmBrokerId?: string;
  email?: string;
  phoneNumber?: string;
  depositBalance?: string;
  notes?: string;
  files?: File[];
}

export async function submitForm(
  payload: SubmitFormPayload,
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("token", payload.token);
  if (payload.hfmBrokerId) formData.append("hfmBrokerId", payload.hfmBrokerId);
  if (payload.email) formData.append("email", payload.email);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.depositBalance) formData.append("depositBalance", payload.depositBalance);
  if (payload.notes) formData.append("notes", payload.notes);
  if (payload.files?.length) {
    payload.files.forEach((f) => formData.append("receipts", f));
  }
  return postForm("/leads/submit", formData);
}

export interface LeadStatusData {
  status: string;
  displayName: string | null;
  hfmBrokerId: string | null;
  depositBalance: string | null;
  createdAt: string;
  registeredAt: string | null;
  depositReportedAt: string | null;
  verifiedAt: string | null;
}

export async function getLeadStatus(token: string): Promise<{ data: LeadStatusData }> {
  const res = await fetch(`${API_BASE}/leads/status?token=${encodeURIComponent(token)}`);
  const json = await res.json();
  if (!res.ok) {
    const message = json?.message || json?.error || "Invalid or expired link.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return json;
}

