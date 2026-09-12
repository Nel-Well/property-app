export type Listing = {
  id: string;
  slug: string;
  referenceCode: string;
  title: string;
  description: string;
  transactionType: "sale" | "rent";
  price: number;
  currency: string;
  rentFrequency: string | null;
  featured: boolean;
  publishedAt: string | null;
  property: {
    addressText: string | null;
    landmark: string | null;
    floorArea: number | null;
    floorAreaUnit: string;
    landArea: number | null;
    landAreaUnit: string;
    bedrooms: number | null;
    bathrooms: number | null;
    floorNumber: number | null;
    totalFloors: number | null;
    furnished: boolean | null;
    category: { name: string; slug: string };
    location: { name: string; slug: string; city: string };
  };
  media: { url: string; altText: string | null; primary: boolean }[];
  amenities: { name: string; slug: string }[];
  contact: { owner: string | null; agent: string | null };
};

type ListingResponse = { data: Listing[]; meta: { total: number; totalPages: number; page: number; pageSize: number } };

export type AuthUser = { id: string; email: string; displayName: string; role: string; avatarUrl: string | null };
export type DashboardData = { role: string; stats: Record<string, number>; listings: { id: string; title: string; slug?: string; status: string; price: number; currency: string; transactionType: string; referenceCode: string; updatedAt?: string }[] };

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export async function fetchListings(params: Record<string, string>) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value));
  const response = await fetch(`${API_URL}/listings?${query.toString()}`);
  if (!response.ok) throw new Error("Unable to load listings");
  return (await response.json()) as ListingResponse;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Unable to sign in");
  return body.data as { token: string; user: AuthUser };
}

async function authorizedRequest(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("property-portal-token");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed");
  return body.data;
}

export function fetchDashboard() {
  return authorizedRequest("/dashboard/") as Promise<DashboardData>;
}

export function createListing(input: Record<string, unknown>) {
  return authorizedRequest("/listings", { method: "POST", body: JSON.stringify(input) }) as Promise<{ id: string; slug: string; title: string; status: string; referenceCode: string }>;
}

export function submitInquiry(listingId: string, message: string) {
  return authorizedRequest(`/listings/${listingId}/inquiries`, { method: "POST", body: JSON.stringify({ message, contactMethod: "phone" }) });
}

export function saveListing(listingId: string, saved: boolean) {
  return authorizedRequest(`/listings/${listingId}/favorite`, { method: saved ? "POST" : "DELETE" });
}

export function moderateListing(listingId: string, action: "approve" | "reject", reason?: string) {
  return authorizedRequest(`/staff/listings/${listingId}/${action}`, { method: "POST", body: JSON.stringify(reason ? { reason } : {}) });
}
