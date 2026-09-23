import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, ImagePlus, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { createListing } from "../lib/api";
import { useLanguage } from "../lib/i18n";

const categoryOptions = ["apartment", "house", "land", "condominium", "room", "commercial"];
const townshipOptions = ["yangon-bahan", "yangon-dagon", "yangon-kamayut", "yangon-mayangone", "yangon-sanchaung", "yangon-yankin", "mandalay-aungmyaythazan", "mandalay-chanayethazan", "mandalay-chanmyathazi", "mandalay-amarapura"];
const sampleImage = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

type Props = { onBack: () => void; onCreated: () => void };

export function ListingForm({ onBack, onCreated }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ transactionType: "sale", title: "", description: "", price: "", category: "apartment", township: "yangon-bahan", floorArea: "", landArea: "", bedrooms: "2", bathrooms: "2", furnished: "true", imageUrl: sampleImage });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await createListing({ ...form, price: Number(form.price), floorArea: form.floorArea ? Number(form.floorArea) : undefined, landArea: form.landArea ? Number(form.landArea) : undefined, bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined, bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined, furnished: form.furnished === "true" });
      setCreated(true); setTimeout(onCreated, 1200);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : t("unableCreate")); }
    finally { setSaving(false); }
  }

  return <section className="form-page"><button className="back-button" onClick={onBack}><ArrowLeft size={17} /> {t("backDashboard")}</button><div className="form-heading"><div className="section-kicker">{t("newListing")}</div><h1>{t("listingHeadline")}</h1><p>{t("listingReviewNote")}</p></div><form className="listing-form" onSubmit={handleSubmit}><Card className="form-card"><div className="form-section-title"><span>01</span><div><h3>{t("listingBasics")}</h3><p>{t("listingBasicsText")}</p></div></div><div className="form-grid"><label>{t("transactionType")}<select value={form.transactionType} onChange={(event) => update("transactionType", event.target.value)}><option value="sale">{t("sale")}</option><option value="rent">{t("forRent")}</option></select></label><label>{t("category")}<select value={form.category} onChange={(event) => update("category", event.target.value)}>{categoryOptions.map((item) => <option key={item} value={item}>{t(item as "apartment" | "house" | "land" | "condominium" | "room" | "commercial")}</option>)}</select></label><label className="field-wide">{t("listingTitle")}<input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Bright two-bedroom apartment in Bahan" /></label><label className="field-wide">{t("description")}<textarea required minLength={20} value={form.description} onChange={(event) => update("description", event.target.value)} rows={5} placeholder={t("descriptionPlaceholder")} /></label></div></Card><Card className="form-card"><div className="form-section-title"><span>02</span><div><h3>{t("propertyDetails")}</h3><p>{t("propertyDetailsText")}</p></div></div><div className="form-grid"><label>{t("price")}<input required type="number" min="1" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="125000000" /></label><label>{t("township")}<select value={form.township} onChange={(event) => update("township", event.target.value)}>{townshipOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>{t("floorArea")}<input type="number" min="1" value={form.floorArea} onChange={(event) => update("floorArea", event.target.value)} placeholder="1050" /></label><label>{t("landArea")}<input type="number" min="1" value={form.landArea} onChange={(event) => update("landArea", event.target.value)} placeholder={t("optional")} /></label><label>{t("bedrooms")}<input type="number" min="0" value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} /></label><label>{t("bathrooms")}<input type="number" min="0" value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} /></label><label>{t("furnished")}<select value={form.furnished} onChange={(event) => update("furnished", event.target.value)}><option value="true">{t("yes")}</option><option value="false">{t("no")}</option></select></label></div></Card><Card className="form-card"><div className="form-section-title"><span>03</span><div><h3>{t("showPlace")}</h3><p>{t("showPlaceText")}</p></div></div><label className="image-url-field">{t("imageUrl")}<input required type="url" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} /></label><div className="image-preview"><img src={form.imageUrl} alt={t("samplePreview")} onError={(event) => { event.currentTarget.style.opacity = "0.25"; }} /><div><ImagePlus size={18} /><strong>{t("samplePreview")}</strong><span>{t("replaceImage")}</span></div></div><div className="upload-placeholder"><Upload size={18} /><span>{t("morePhotos")}</span><small>{t("uploadNote")}</small></div></Card>{error && <div className="auth-error">{error}</div>}{created && <div className="success-message"><Check size={16} /> {t("listingSubmitted")}</div>}<div className="form-actions"><Button variant="ghost" type="button" onClick={onBack}>{t("cancel")}</Button><Button size="lg" type="submit" disabled={saving || created}>{saving ? t("submitting") : created ? t("submitted") : t("submitReview")}</Button></div></form></section>;
}
