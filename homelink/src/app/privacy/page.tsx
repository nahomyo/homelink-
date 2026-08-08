import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-10 text-[#17231f] lg:px-10">
      <div className="mx-auto max-w-[900px]">
        <Link className="text-sm font-bold text-[#193f34]" href="/">← HomeLink</Link>
        <header className="mt-12 border-b border-[#dfe3d9] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#b45d3c]">Privacy · ግላዊነት</p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-[#193f34]">Privacy Policy</h1>
          <p className="mt-3 text-lg text-[#65736b]">የግላዊነት መመሪያ</p>
        </header>
        <div className="grid gap-10 py-10 md:grid-cols-2">
          <article className="space-y-7 text-sm leading-7 text-[#65736b]">
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">What we collect</h2><p className="mt-2">We collect information you provide when creating a profile, applying for work, posting a role, or contacting another member. This can include your name, phone number, location, skills, documents, and messages.</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">How we use it</h2><p className="mt-2">We use this information to operate HomeLink, verify profiles, match workers with households, support conversations, and keep the community safer.</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">Your choices</h2><p className="mt-2">You can request access to, correction of, or deletion of your personal information by contacting us at hello@homelink.et.</p></section>
          </article>
          <article className="space-y-7 text-sm leading-7 text-[#65736b]" lang="am">
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">የምንሰበስበው</h2><p className="mt-2">መገለጫ ሲፈጥሩ፣ ስራ ሲያመለክቱ፣ ስራ ሲያትሙ ወይም አባልን ሲያነጋግሩ የሚሰጡትን መረጃ እንሰበስባለን። ይህም ስም፣ ስልክ፣ ቦታ፣ ችሎታ፣ ሰነዶችና መልዕክቶችን ሊያካትት ይችላል።</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">እንዴት እንጠቀምበታለን</h2><p className="mt-2">መረጃውን HomeLinkን ለማስኬድ፣ መገለጫዎችን ለማረጋገጥ፣ ሰራተኞችንና ቤተሰቦችን ለማገናኘት እና ማህበረሰቡን ደህንነት ለመጠበቅ እንጠቀማለን።</p></section>
            <section><h2 className="font-serif text-2xl font-bold text-[#193f34]">መብትዎ</h2><p className="mt-2">የግል መረጃዎን ለማየት፣ ለማስተካከል ወይም ለማጥፋት hello@homelink.et ያነጋግሩን።</p></section>
          </article>
        </div>
        <p className="border-t border-[#dfe3d9] pt-6 text-xs text-[#718078]">Last updated: August 2026 · የመጨረሻ ማሻሻያ፦ ነሐሴ 2018 ዓ.ም.</p>
      </div>
    </main>
  );
}
