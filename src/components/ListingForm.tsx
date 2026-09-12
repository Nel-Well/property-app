import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, ImagePlus, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { createListing } from "../lib/api";

const categoryOptions = ["apartment", "house", "land", "condominium", "room", "commercial"];
const townshipOptions = ["yangon-bahan", "yangon-dagon", "yangon-kamayut", "yangon-mayangone", "yangon-sanchaung", "yangon-yankin", "mandalay-aungmyaythazan", "mandalay-chanayethazan", "mandalay-chanmyathazi", "mandalay-amarapura"];
const sampleImage = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

type Props = { onBack: () => void; onCreated: () => void };

export function ListingForm({ onBack, onCreated }: Props) {
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
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create listing"); }
    finally { setSaving(false); }
  }

  return <section className="form-page"><button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to dashboard</button><div className="form-heading"><div className="section-kicker">New listing</div><h1>Put your property in front of the right people.</h1><p>Listings are reviewed by the Thiri team before they appear publicly.</p></div><form className="listing-form" onSubmit={handleSubmit}><Card className="form-card"><div className="form-section-title"><span>01</span><div><h3>Start with the basics</h3><p>Tell people what kind of opportunity this is.</p></div></div><div className="form-grid"><label>Transaction type<select value={form.transactionType} onChange={(event) => update("transactionType", event.target.value)}><option value="sale">For sale</option><option value="rent">For rent</option></select></label><label>Property category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-wide">Listing title<input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Bright two-bedroom apartment in Bahan" /></label><label className="field-wide">Description<textarea required minLength={20} value={form.description} onChange={(event) => update("description", event.target.value)} rows={5} placeholder="Describe the property, access, and what makes it special." /></label></div></Card><Card className="form-card"><div className="form-section-title"><span>02</span><div><h3>Property details</h3><p>Give prospective buyers or renters the useful specifics.</p></div></div><div className="form-grid"><label>Price (MMK)<input required type="number" min="1" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="125000000" /></label><label>Township<select value={form.township} onChange={(event) => update("township", event.target.value)}>{townshipOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Floor area (sqft)<input type="number" min="1" value={form.floorArea} onChange={(event) => update("floorArea", event.target.value)} placeholder="1050" /></label><label>Land area (sqft)<input type="number" min="1" value={form.landArea} onChange={(event) => update("landArea", event.target.value)} placeholder="Optional" /></label><label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} /></label><label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} /></label><label>Furnished<select value={form.furnished} onChange={(event) => update("furnished", event.target.value)}><option value="true">Yes</option><option value="false">No</option></select></label></div></Card><Card className="form-card"><div className="form-section-title"><span>03</span><div><h3>Show the place</h3><p>A strong photo helps people understand the listing quickly.</p></div></div><label className="image-url-field">Image URL<input required type="url" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} /></label><div className="image-preview"><img src={form.imageUrl} alt="Listing preview" onError={(event) => { event.currentTarget.style.opacity = "0.25"; }} /><div><ImagePlus size={18} /><strong>Sample image preview</strong><span>Replace the URL with your own image when media upload is connected.</span></div></div><div className="upload-placeholder"><Upload size={18} /><span>Drag more photos here later</span><small>Multi-image upload will be enabled in the media phase.</small></div></Card>{error && <div className="auth-error">{error}</div>}{created && <div className="success-message"><Check size={16} /> Listing submitted for review.</div>}<div className="form-actions"><Button variant="ghost" type="button" onClick={onBack}>Cancel</Button><Button size="lg" type="submit" disabled={saving || created}>{saving ? "Submitting…" : created ? "Submitted" : "Submit for review"}</Button></div></form></section>;
}
