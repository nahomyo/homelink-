import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-10 text-[#17231f] lg:px-10">
      <div className="mx-auto max-w-[900px]">
        <Link className="text-sm font-bold text-[#193f34]" href="/">← HomeLink</Link>
        <header className="mt-12 border-b border-[#dfe3d9] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#b45d3c]">Terms · የአጠቃቀም ደንብ</p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-[#193f34]">Terms of Use</h1>
          <p className="mt-3 text-lg text-[#65736b]">የአጠቃቀም ደንብ</p>
        </header>
        <div className="grid gap-10 py-10 md:grid-cols-2">
          <article className="space-y-7 text-sm leading-7 text-[#65736b]">
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">Use HomeLink respectfully</h2><p className="mt-2">Provide accurate information, communicate honestly, and treat workers, households, and brokers with dignity. Do not impersonate another person or misuse documents.</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">Work and hiring</h2><p className="mt-2">HomeLink helps members connect. Members are responsible for agreeing on role details, pay, schedules, safety, and legal requirements before work begins.</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">Fees and account safety</h2><p className="mt-2">Workers do not pay registration, application, placement, or commission fees. Keep your login details private and tell us about suspicious activity.</p></section>
          </article>
          <article className="space-y-7 text-sm leading-7 text-[#65736b]" lang="am">
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">HomeLinkን በክብር ይጠቀሙ</h2><p className="mt-2">ትክክለኛ መረጃ ይስጡ፣ በታማኝነት ይገናኙ እና ሰራተኞችን፣ ቤተሰቦችንና ደላላዎችን በክብር ይያዙ። ሌላ ሰውን አይመስሉ ወይም ሰነዶችን አላግባብ አይጠቀሙ።</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">ስራና ቅጥር</h2><p className="mt-2">HomeLink አባላትን ለማገናኘት ይረዳል። ስራ ከመጀመሩ በፊት በስራ ድርሻ፣ ክፍያ፣ ጊዜ፣ ደህንነትና ህጋዊ መስፈርቶች ላይ መስማማት የአባላት ኃላፊነት ነው።</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">ክፍያና የመለያ ደህንነት</h2><p className="mt-2">ሰራተኞች ለመመዝገብ፣ ለማመልከት፣ ለምደባ ወይም ለኮሚሽን ክፍያ አይከፍሉም። የመግቢያ መረጃዎን በሚስጥር ይጠብቁ።</p></section>
          </article>
        </div>
        <p className="border-t border-[#dfe3d9] pt-6 text-xs text-[#718078]">Last updated: August 2026 · የመጨረሻ ማሻሻያ፦ ነሐሴ 2018 ዓ.ም.</p>
      </div>
    </main>
  );
}
