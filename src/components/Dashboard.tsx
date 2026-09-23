import { useEffect, useState } from "react";
import { ArrowRight, Check, ClipboardCheck, Heart, Home, MessageCircle, Plus, ShieldCheck, Users, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { fetchDashboard, moderateListing, type AuthUser, type DashboardData } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useLanguage } from "../lib/i18n";

type QueueItem = { id: string; title: string; price: number; currency: string; transactionType: string; referenceCode: string; owner: { displayName: string; email: string }; property: { category: { name: string }; location: { name: string; parent: { name: string } | null } } };
type Props = { user: AuthUser; onAddProperty: () => void; onBack: () => void };

const statLabels: Record<string, { label: string; icon: typeof Heart }> = { favorites: { label: "Saved properties", icon: Heart }, inquiries: { label: "Inquiries", icon: MessageCircle }, total: { label: "Total listings", icon: Home }, published: { label: "Published", icon: Check }, pendingReview: { label: "Pending review", icon: ClipboardCheck }, unreadNotifications: { label: "Unread alerts", icon: ShieldCheck }, users: { label: "Active users", icon: Users }, totalListings: { label: "All listings", icon: Home } };

export function Dashboard({ user, onAddProperty, onBack }: Props) {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try { const data = await fetchDashboard(); setDashboard(data); if (["staff", "admin"].includes(data.role)) { const token = localStorage.getItem("property-portal-token"); const response = await fetch("http://localhost:4000/api/v1/staff/moderation-queue", { headers: { Authorization: `Bearer ${token}` } }); const body = await response.json(); setQueue(body.data ?? []); } } catch (requestError) { setError(requestError instanceof Error ? requestError.message : t("unableDashboard")); }
  }
  useEffect(() => { void load(); }, []);

  async function handleModeration(id: string, action: "approve" | "reject") {
    try { await moderateListing(id, action, action === "reject" ? "Please add clearer property details and confirm the listing information." : undefined); await load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : t("unableUpdate")); }
  }

  const roleTitle = user.role === "buyer_renter" ? t("yourJourney") : user.role === "owner" ? t("yourProperties") : user.role === "agent" ? t("agencyDesk") : user.role === "admin" ? t("platformOverview") : t("moderationDesk");
  const translatedStatLabels: Record<string, string> = { favorites: t("savedProperties"), inquiries: t("inquiries"), total: t("totalListings"), published: t("published"), pendingReview: t("pendingReview"), unreadNotifications: t("unreadAlerts"), users: t("activeUsers"), totalListings: t("allListings") };
  const roleLabel = user.role === "buyer_renter" ? t("roleBuyer") : user.role === "owner" ? t("roleOwner") : user.role === "agent" ? t("roleAgent") : user.role === "admin" ? t("roleAdmin") : t("roleStaff");
  const statusLabel = (status: string) => status === "DRAFT" ? t("statusDraft") : status === "PENDING_REVIEW" ? t("statusPending") : status === "PUBLISHED" ? t("statusPublished") : status === "REJECTED" ? t("statusRejected") : status === "PAUSED" ? t("statusPaused") : status === "SUSPENDED" ? t("statusSuspended") : status.toLowerCase().replaceAll("_", " ");
  return <section className="dashboard-page"><button className="back-button" onClick={onBack}><ArrowRight className="back-arrow" size={17} /> {t("backMarketplace")}</button><div className="dashboard-header"><div><div className="section-kicker">{roleLabel}</div><h1>{roleTitle}</h1><p>{t("welcome")}, {user.displayName}. {t("attention")}</p></div>{["owner", "agent"].includes(user.role) && <Button size="lg" onClick={onAddProperty}><Plus size={17} /> {t("addProperty")}</Button>}</div>{error && <div className="auth-error">{error}</div>}{dashboard ? <><div className="dashboard-stats">{Object.entries(dashboard.stats).map(([key, value]) => { const config = statLabels[key] ?? { label: key, icon: Home }; const Icon = config.icon; return <Card className="stat-card" key={key}><Icon size={18} /><strong>{value.toLocaleString()}</strong><span>{translatedStatLabels[key] ?? config.label}</span></Card>; })}</div>{["staff", "admin"].includes(user.role) ? <div className="dashboard-panel"><div className="panel-heading"><div><div className="section-kicker">{t("needsReview")}</div><h2>{t("moderationQueue")}</h2></div><span className="queue-count">{queue.length} {t("waiting")}</span></div>{queue.length === 0 ? <div className="empty-panel"><Check size={20} /> {t("caughtUp")}</div> : <div className="queue-list">{queue.map((item) => <div className="queue-item" key={item.id}><div><div className="eyebrow">{item.referenceCode} · {item.property.category.name}</div><strong>{item.title}</strong><span>{item.property.location.name}, {item.property.location.parent?.name ?? "Myanmar"} · {item.owner.displayName}</span></div><div className="queue-actions"><span>{formatPrice(item.price, item.transactionType.toLowerCase())}</span><button className="approve-button" onClick={() => void handleModeration(item.id, "approve")} aria-label={t("approveListing")} title={t("approveListing")}><Check size={17} /></button><button className="reject-button" onClick={() => void handleModeration(item.id, "reject")} aria-label={t("rejectListing")} title={t("rejectListing")}><X size={17} /></button></div></div>)}</div>}</div> : <div className="dashboard-panel"><div className="panel-heading"><div><div className="section-kicker">{t("recentActivity")}</div><h2>{user.role === "buyer_renter" ? t("savedActivity") : t("listingDesk")}</h2></div>{["owner", "agent"].includes(user.role) && <button className="text-button" onClick={onAddProperty}>{t("addProperty")} <Plus size={15} /></button>}</div>{dashboard.listings.length === 0 ? <div className="empty-panel">{t("saveOrInquire")}</div> : <div className="dashboard-list">{dashboard.listings.map((listing) => <div className="dashboard-row" key={listing.id}><div><strong>{listing.title}</strong><span>{listing.referenceCode} · {statusLabel(listing.status)}</span></div><div><strong>{formatPrice(listing.price, listing.transactionType.toLowerCase())}</strong><span className={`status status-${listing.status.toLowerCase()}`}>{statusLabel(listing.status)}</span></div></div>)}</div>}</div>}</> : <div className="loading-state">{t("loadingDashboard")}<span>•••</span></div>}</section>;
}
