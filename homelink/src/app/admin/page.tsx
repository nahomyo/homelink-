"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { listAdminCommissions, listAdminJobs, listAdminPlacements, listAdminProfiles, listAdminReports, setJobActive, setProfileSuspended, setProfileVerification, updateReportStatus, type ReportStatus, type VerificationStatus } from "@/lib/homelink-data";

type Tab = "overview" | "verification" | "documents" | "jobs" | "reports" | "accounts" | "placements" | "commissions";
type AdminProfile = Awaited<ReturnType<typeof listAdminProfiles>>["data"] extends (infer Item)[] | null ? Item : never;
type AdminJob = Awaited<ReturnType<typeof listAdminJobs>>["data"] extends (infer Item)[] | null ? Item : never;
type AdminReport = Awaited<ReturnType<typeof listAdminReports>>["data"] extends (infer Item)[] | null ? Item : never;

const copy = {
  en: {
    brand: "HomeLink Admin", subtitle: "Trust and safety operations", login: "Admin login", loginBody: "Use an administrator account to manage the HomeLink community.", phone: "Phone number", password: "Password", signIn: "Sign in", signingIn: "Signing in...", forbidden: "This account is not an administrator.", configure: "Connect Supabase and assign the admin role to access this dashboard.", signOut: "Sign out", overview: "Overview", verification: "Verification", documents: "Documents", jobs: "Job posts", reports: "Reports & disputes", accounts: "Accounts", placements: "Placements", commissions: "Commissions", dashboard: "Operations dashboard", dashboardBody: "Review the queues that keep HomeLink trustworthy, fair, and safe.", pending: "Pending verification", openReports: "Open reports", activeJobs: "Active jobs", suspended: "Suspended accounts", people: "People", review: "Review", approve: "Approve", reject: "Reject", suspend: "Suspend", restore: "Restore", noProfiles: "No profiles need review.", noDocuments: "Document review is ready when users submit files.", noJobs: "No job posts found.", approveJob: "Approve job", removeJob: "Remove job", noReports: "No reports or disputes found.", investigate: "Investigate", resolve: "Resolve", dismiss: "Dismiss", noPlacements: "No placements found.", noCommissions: "No commission records found.", status: "Status", role: "Role", created: "Created", active: "Active", inactive: "Inactive", open: "Open", verified: "Verified", rejected: "Rejected", pendingStatus: "Pending", investigating: "Investigating", resolved: "Resolved", dismissed: "Dismissed", worker: "Worker", household: "Household", broker: "Broker", admin: "Admin", unknown: "Unknown", documentsBody: "Review experience, guarantor, and business licence paths from verified submissions.", moderation: "Moderation queue", accountControl: "Account control", accountBody: "Suspend accounts that violate safety or marketplace rules, and restore them after review.", placementBody: "Review active and completed worker-household placements.", commissionBody: "Review household-paid HomeLink and broker commission records.", error: "Something went wrong. Please try again." 
  },
  am: {
    brand: "የHomeLink አስተዳደር", subtitle: "የመተማመንና ደህንነት አስተዳደር", login: "የአስተዳዳሪ መግቢያ", loginBody: "የHomeLink ማህበረሰብን ለማስተዳደር የአስተዳዳሪ መለያ ይጠቀሙ።", phone: "ስልክ ቁጥር", password: "የይለፍ ቃል", signIn: "ግባ", signingIn: "በመግባት ላይ...", forbidden: "ይህ መለያ አስተዳዳሪ አይደለም።", configure: "Supabaseን ያገናኙ እና የአስተዳዳሪ ሚናን ይመድቡ።", signOut: "ውጣ", overview: "አጠቃላይ እይታ", verification: "ማረጋገጫ", documents: "ሰነዶች", jobs: "የስራ ማስታወቂያዎች", reports: "ሪፖርቶችና ክርክሮች", accounts: "መለያዎች", placements: "ምደባዎች", commissions: "ኮሚሽኖች", dashboard: "የአስተዳደር ዳሽቦርድ", dashboardBody: "HomeLinkን የታመነ፣ ፍትሃዊና ደህንነቱ የተጠበቀ ለማድረግ የሚጠብቁትን ዝርዝር ይገምግሙ።", pending: "በማረጋገጥ ላይ", openReports: "ክፍት ሪፖርቶች", activeJobs: "ንቁ ስራዎች", suspended: "የታገዱ መለያዎች", people: "ሰዎች", review: "ገምግም", approve: "አጽድቅ", reject: "አትቀበል", suspend: "አግድ", restore: "መልስ", noProfiles: "ለግምገማ መገለጫ የለም።", noDocuments: "ሰነድ ሲላክ ግምገማው ይጀምራል።", noJobs: "የስራ ማስታወቂያ የለም።", approveJob: "ስራውን አጽድቅ", removeJob: "ስራውን አስወግድ", noReports: "ሪፖርት ወይም ክርክር የለም።", investigate: "መርምር", resolve: "ፍታ", dismiss: "ዝጋ", noPlacements: "ምደባ የለም።", noCommissions: "የኮሚሽን መዝገብ የለም።", status: "ሁኔታ", role: "ሚና", created: "የተፈጠረ", active: "ንቁ", inactive: "ንቁ አይደለም", open: "ክፍት", verified: "ተረጋግጧል", rejected: "ውድቅ ተደርጓል", pendingStatus: "በመጠባበቅ ላይ", investigating: "በምርመራ ላይ", resolved: "ተፈቷል", dismissed: "ተዘግቷል", worker: "ሰራተኛ", household: "ቤተሰብ", broker: "ደላላ", admin: "አስተዳዳሪ", unknown: "ያልታወቀ", documentsBody: "የልምድ፣ የዋስና የንግድ ፈቃድ ሰነዶችን ይገምግሙ።", moderation: "የማስተካከያ ዝርዝር", accountControl: "የመለያ ቁጥጥር", accountBody: "የደህንነት ወይም የገበያ ደንብ የሚጥሱ መለያዎችን ያግዱ።", placementBody: "ንቁና የተጠናቀቁ ምደባዎችን ይገምግሙ።", commissionBody: "በቤተሰብ የተከፈሉ የHomeLinkና የደላላ ኮሚሽኖችን ይመልከቱ።", error: "ችግር ተፈጥሯል። እንደገና ይሞክሩ።"
  }
} as const;

export default function AdminPage() {
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [tab, setTab] = useState<Tab>("overview");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [placements, setPlacements] = useState<Record<string, unknown>[]>([]);
  const [commissions, setCommissions] = useState<Record<string, unknown>[]>([]);
  const t = copy[language];

  async function loadDashboard() {
    setBusy(true);
    const [profilesResult, jobsResult, reportsResult, placementsResult, commissionsResult] = await Promise.all([listAdminProfiles(), listAdminJobs(), listAdminReports(), listAdminPlacements(), listAdminCommissions()]);
    if (profilesResult.error || jobsResult.error || reportsResult.error || placementsResult.error || commissionsResult.error) setError(t.error);
    setProfiles((profilesResult.data ?? []) as AdminProfile[]);
    setJobs((jobsResult.data ?? []) as AdminJob[]);
    setReports((reportsResult.data ?? []) as AdminReport[]);
    setPlacements((placementsResult.data ?? []) as Record<string, unknown>[]);
    setCommissions((commissionsResult.data ?? []) as Record<string, unknown>[]);
    setBusy(false);
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      const { data: profile } = await supabase.from("profiles").select("role, is_suspended").eq("id", data.user.id).maybeSingle();
      if (profile?.role === "admin" && !profile.is_suspended) {
        setAuthorized(true);
        void loadDashboard();
      } else setError(t.forbidden);
    });
    return () => { active = false; };
  // Session bootstrap intentionally runs once when the admin route mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError(t.configure); return; }
    setBusy(true); setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ phone, password });
    if (authError || !data.user) { setError(authError?.message ?? t.error); setBusy(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role, is_suspended").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin" || profile.is_suspended) { await supabase.auth.signOut(); setError(t.forbidden); setBusy(false); return; }
    setAuthorized(true); await loadDashboard();
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setAuthorized(false);
  }

  async function updateVerification(id: string, status: VerificationStatus) {
    const { error: actionError } = await setProfileVerification(id, status);
    if (actionError) setError(actionError.message); else setProfiles((current) => current.map((profile) => profile.id === id ? { ...profile, verification_status: status } : profile));
  }

  async function updateSuspension(id: string, isSuspended: boolean) {
    const { error: actionError } = await setProfileSuspended(id, isSuspended);
    if (actionError) setError(actionError.message); else setProfiles((current) => current.map((profile) => profile.id === id ? { ...profile, is_suspended: isSuspended } : profile));
  }

  async function updateJob(id: string, isActive: boolean) {
    const { error: actionError } = await setJobActive(id, isActive);
    if (actionError) setError(actionError.message); else setJobs((current) => current.map((job) => job.id === id ? { ...job, is_active: isActive } : job));
  }

  async function updateReport(id: string, status: ReportStatus) {
    const { error: actionError } = await updateReportStatus(id, status);
    if (actionError) setError(actionError.message); else setReports((current) => current.map((report) => report.id === id ? { ...report, status } : report));
  }

  const roleLabel = (role: string) => ({ worker: t.worker, household: t.household, broker: t.broker, admin: t.admin }[role] ?? t.unknown);
  const statusLabel = (status: string) => ({ pending: t.pendingStatus, verified: t.verified, rejected: t.rejected, open: t.open, investigating: t.investigating, resolved: t.resolved, dismissed: t.dismissed }[status] ?? status);
  const pendingProfiles = profiles.filter((profile) => profile.verification_status === "pending");
  const activeJobs = jobs.filter((job) => job.is_active);
  const openReports = reports.filter((report) => report.status === "open" || report.status === "investigating");
  const suspendedProfiles = profiles.filter((profile) => profile.is_suspended);

  if (!authorized) return <main className="min-h-screen bg-[#f6f4ef] px-6 py-10 text-[#17231f] lg:px-10"><div className="mx-auto max-w-md"><div className="flex items-center justify-between"><a className="font-serif text-xl font-bold text-[#193f34]" href="/">HomeLink</a><div className="language-switch"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "am" ? "active" : ""} onClick={() => setLanguage("am")}>አማ</button></div></div><div className="mt-20 rounded-3xl bg-white p-8 shadow-[0_14px_40px_rgba(45,67,52,.08)]"><p className="text-sm font-semibold uppercase tracking-[.16em] text-[#b45d3c]">{t.brand}</p><h1 className="mt-3 font-serif text-4xl font-bold text-[#193f34]">{t.login}</h1><p className="mt-3 text-sm leading-6 text-[#718078]">{t.loginBody}</p><form onSubmit={signIn} className="mt-7 space-y-4"><label className="field-label">{t.phone}<input required value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="+251 9XX XXX XXX" /></label><label className="field-label">{t.password}<input required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></label><button disabled={busy} className="w-full rounded-xl bg-[#193f34] py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy ? t.signingIn : t.signIn}</button></form>{error && <p className="mt-4 rounded-xl bg-[#fff0e9] p-3 text-sm text-[#8b4d35]">{error}</p>}<a className="mt-6 block text-center text-sm font-semibold text-[#65736b]" href="/">← HomeLink</a></div></div></main>;

  const nav: [Tab, string][] = [["overview", t.overview], ["verification", t.verification], ["documents", t.documents], ["jobs", t.jobs], ["reports", t.reports], ["accounts", t.accounts], ["placements", t.placements], ["commissions", t.commissions]];
  return <main className="min-h-screen bg-[#f6f4ef] text-[#17231f]"><header className="border-b border-[#dfe3d9] bg-white px-6 py-5 lg:px-10"><div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4"><div><p className="font-serif text-xl font-bold text-[#193f34]">{t.brand}</p><p className="text-xs text-[#718078]">{t.subtitle}</p></div><div className="flex items-center gap-3"><div className="language-switch"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "am" ? "active" : ""} onClick={() => setLanguage("am")}>አማ</button></div><button onClick={() => void signOut()} className="rounded-full border border-[#d4d7ce] px-4 py-2 text-sm font-bold text-[#193f34]">{t.signOut}</button></div></div></header><div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-8 lg:grid-cols-[230px_1fr] lg:px-10"><aside className="h-fit rounded-2xl bg-[#193f34] p-3 text-white">{nav.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`workspace-nav ${tab === key ? "selected" : ""}`}>{label}</button>)}</aside><section><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[.16em] text-[#b45d3c]">{t.moderation}</p><h1 className="mt-2 font-serif text-4xl font-bold text-[#193f34]">{tab === "overview" ? t.dashboard : nav.find(([key]) => key === tab)?.[1]}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#718078]">{tab === "overview" ? t.dashboardBody : tab === "documents" ? t.documentsBody : tab === "accounts" ? t.accountBody : tab === "placements" ? t.placementBody : tab === "commissions" ? t.commissionBody : ""}</p></div>{error && <p className="mb-5 rounded-xl bg-[#fff0e9] p-3 text-sm text-[#8b4d35]">{error}</p>}{tab === "overview" && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[t.pending, pendingProfiles.length], [t.openReports, openReports.length], [t.activeJobs, activeJobs.length], [t.suspended, suspendedProfiles.length]].map(([label, value]) => <div key={String(label)} className="stat-card"><span>{label}</span><strong>{value}</strong></div>)}</div>}{tab === "verification" && <div className="space-y-3">{pendingProfiles.length ? pendingProfiles.map((profile) => <div key={profile.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-[#193f34]">{profile.full_name || t.unknown}</p><p className="mt-1 text-sm text-[#718078]">{roleLabel(profile.role)} · {profile.location || "Addis Ababa"}</p><p className="mt-1 text-xs text-[#b45d3c]">{statusLabel(profile.verification_status)}</p></div><div className="flex gap-2"><button onClick={() => void updateVerification(profile.id, "verified")} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{t.approve}</button><button onClick={() => void updateVerification(profile.id, "rejected")} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{t.reject}</button></div></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noProfiles}</p>}</div>}{tab === "documents" && <div className="rounded-2xl bg-white p-6"><p className="text-sm leading-6 text-[#718078]">{t.documentsBody}</p><div className="mt-5 space-y-3">{pendingProfiles.map((profile) => <div key={profile.id} className="flex items-center justify-between rounded-xl bg-[#f6f4ef] p-4"><div><p className="text-sm font-bold text-[#193f34]">{profile.full_name || t.unknown}</p><p className="mt-1 text-xs text-[#718078]">{roleLabel(profile.role)}</p></div><span className="text-xs font-bold text-[#b45d3c]">{statusLabel(profile.verification_status)}</span></div>)}{!pendingProfiles.length && <p className="text-sm text-[#718078]">{t.noDocuments}</p>}</div></div>}{tab === "jobs" && <div className="space-y-3">{jobs.length ? jobs.map((job) => <div key={job.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-[#193f34]">{job.title}</p><p className="mt-1 text-sm text-[#718078]">{job.skill} · {job.location} · ETB {Number(job.salary).toLocaleString()}</p><p className="mt-1 text-xs text-[#b45d3c]">{job.is_active ? t.active : t.inactive}</p></div><button onClick={() => void updateJob(job.id, !job.is_active)} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{job.is_active ? t.removeJob : t.approveJob}</button></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noJobs}</p>}</div>}{tab === "reports" && <div className="space-y-3">{reports.length ? reports.map((report) => <div key={report.id} className="rounded-2xl bg-white p-5"><div className="flex flex-col justify-between gap-3 md:flex-row"><div><p className="font-bold text-[#193f34]">{report.reason}</p><p className="mt-1 text-sm text-[#718078]">{report.details || t.unknown}</p><p className="mt-1 text-xs text-[#b45d3c]">{statusLabel(report.status)}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void updateReport(report.id, "investigating")} className="rounded-full border border-[#d7ded4] px-3 py-2 text-xs font-bold text-[#193f34]">{t.investigate}</button><button onClick={() => void updateReport(report.id, "resolved")} className="rounded-full bg-[#193f34] px-3 py-2 text-xs font-bold text-white">{t.resolve}</button><button onClick={() => void updateReport(report.id, "dismissed")} className="rounded-full border border-[#d7ded4] px-3 py-2 text-xs font-bold text-[#193f34]">{t.dismiss}</button></div></div></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noReports}</p>}</div>}{tab === "accounts" && <div className="space-y-3">{profiles.length ? profiles.map((profile) => <div key={profile.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-[#193f34]">{profile.full_name || t.unknown}</p><p className="mt-1 text-sm text-[#718078]">{roleLabel(profile.role)} · {statusLabel(profile.verification_status)}</p></div><button onClick={() => void updateSuspension(profile.id, !profile.is_suspended)} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{profile.is_suspended ? t.restore : t.suspend}</button></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noProfiles}</p>}</div>}{tab === "placements" && <div className="space-y-3">{placements.length ? placements.map((placement) => <div key={String(placement.id)} className="rounded-2xl bg-white p-5"><p className="font-bold text-[#193f34]">{String(placement.worker_id)} → {String(placement.employer_id)}</p><p className="mt-1 text-sm text-[#718078]">{t.status}: {String(placement.status)} · {t.created}: {String(placement.created_at)}</p></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noPlacements}</p>}</div>}{tab === "commissions" && <div className="space-y-3">{commissions.length ? commissions.map((commission) => <div key={String(commission.id)} className="flex items-center justify-between rounded-2xl bg-white p-5"><div><p className="font-bold text-[#193f34]">{t.status}: {String(commission.status)}</p><p className="mt-1 text-sm text-[#718078]">HomeLink: ETB {String(commission.homelink_amount)} · Broker: ETB {String(commission.broker_amount)}</p></div><span className="font-serif text-xl font-bold text-[#193f34]">ETB {String(commission.homelink_amount)}</span></div>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#718078]">{t.noCommissions}</p>}</div>}</section></div></main>;
}
