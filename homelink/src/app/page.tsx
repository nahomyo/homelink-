"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { applyToJob, createJob, saveJob, saveProfile as saveProfileToBackend } from "@/lib/homelink-data";

type Role = "worker" | "household" | "broker";
type AuthMode = "signup" | "login";
type AuthStep = "form" | "otp";
type Language = "en" | "am";

const copy = {
  en: {
    navWork: "Find work", navHow: "How it works", navStories: "Stories", login: "Log in", join: "Join HomeLink",
    eyebrow: "A trusted way to work in Addis Ababa", hero: "Good work starts with trust.", heroBody: "HomeLink connects domestic workers and households across Addis Ababa with the verification, clarity, and respect every relationship deserves.", worker: "I’m looking for work", household: "I’m hiring help", members: "people already finding their fit", community: "VERIFIED COMMUNITY", next: "Your next chapter", start: "can start here.", peopleFirst: "People first", opportunities: "OPPORTUNITIES NEAR YOU", hire: "FIND YOUR NEXT TEAM MEMBER", workTitle: "Find work that fits your life.", hireTitle: "Find someone you can trust.", allJobs: "View all jobs", less: "Show less", search: "Search by role, skill, or location", searchButton: "Search jobs", pay: "Expected pay", view: "View role", noResults: "No roles match that search yet.", built: "BUILT AROUND PEOPLE", trustTitle: "Every connection deserves a strong start.", noFee: "Workers never pay to join, apply, or get placed. HomeLink earns a transparent commission from households only after a successful hire.", verified: "Verified profiles", verifiedBody: "Know who you are meeting before the first conversation.", clear: "Clear expectations", clearBody: "Agree on role, pay, and availability from day one.", support: "Real support", supportBody: "A community that values dignity, safety, and long-term work.", footer: "Trusted work, closer to home.", signupTitle: "Join a trusted community.", loginTitle: "Welcome back.", signupBody: "Create your profile to find work or hire with confidence.", loginBody: "Sign in to manage your applications and messages.", phone: "Phone number", password: "Password", sendCode: "Send verification code", loginButton: "Log in", workerChoice: "I’m a worker", workerDesc: "Find work and grow", hiringChoice: "I’m hiring", hiringDesc: "Find trusted help", noWorkerFee: "Workers pay no registration, application, placement, or commission fees.", already: "Already have an account? Log in", newAccount: "New to HomeLink? Create an account", verification: "PHONE VERIFICATION", checkPhone: "Check your phone.", codeBody: "We sent a 6-digit code to", verify: "Verify and continue", different: "Use a different number", signedIn: "You’re signed in.", dashboard: "Your profile and applications are ready to connect.", hiringDashboard: "Your household hiring dashboard is ready."
  },
  am: {
    navWork: "ስራ ይፈልጉ", navHow: "እንዴት ይሰራል", navStories: "ታሪኮች", login: "ግባ", join: "HomeLink ይቀላቀሉ",
    eyebrow: "በአዲስ አበባ የታመነ የስራ መንገድ", hero: "ጥሩ ስራ የሚጀምረው በመተማመን ነው።", heroBody: "HomeLink የቤት ሰራተኞችን እና ቤተሰቦችን በአዲስ አበባ በማገናኘት ደህንነትንና ግልጽነትን ያመጣል።", worker: "ስራ እፈልጋለሁ", household: "ሰራተኛ እቀጥራለሁ", members: "ሰዎች የሚመጥናቸውን ስራ አግኝተዋል", community: "የተረጋገጠ ማህበረሰብ", next: "የሚቀጥለው ምዕራፍዎ", start: "እዚህ ይጀምራል።", peopleFirst: "ሰው በቅድሚያ", opportunities: "በአቅራቢያዎ ያሉ እድሎች", hire: "የሚታመን ሰው ያግኙ", workTitle: "ከህይወትዎ ጋር የሚስማማ ስራ ያግኙ።", hireTitle: "የሚታመን ሰው ያግኙ።", allJobs: "ሁሉንም ስራዎች ይመልከቱ", less: "ያነሰ አሳይ", search: "በስራ፣ ችሎታ ወይም ቦታ ይፈልጉ", searchButton: "ስራ ይፈልጉ", pay: "የሚጠበቅ ክፍያ", view: "ዝርዝር ይመልከቱ", noResults: "ይህን ፍለጋ የሚመጥን ስራ የለም።", built: "በሰዎች ዙሪያ የተገነባ", trustTitle: "እያንዳንዱ ግንኙነት ጠንካራ ጅምር ይገባዋል።", noFee: "ሰራተኞች ለመመዝገብ፣ ለማመልከት ወይም ለመቀጠር ክፍያ አይከፍሉም።", verified: "የተረጋገጡ መገለጫዎች", verifiedBody: "ከመጀመሪያው ውይይት በፊት ከማን ጋር እንደሚገናኙ ይወቁ።", clear: "ግልጽ ግንዛቤ", clearBody: "ስራውን፣ ክፍያውን እና ጊዜውን ከመጀመሪያው ይስማሙ።", support: "እውነተኛ ድጋፍ", supportBody: "ክብርን፣ ደህንነትን እና ዘላቂ ስራን የሚያከብር ማህበረሰብ።", footer: "የታመነ ስራ፣ ከቤትዎ ቅርብ።", signupTitle: "የታመነ ማህበረሰብን ይቀላቀሉ።", loginTitle: "እንኳን ደህና መጡ።", signupBody: "በመተማመን ስራ ለማግኘት ወይም ሰራተኛ ለመቅጠር መገለጫዎን ይፍጠሩ።", loginBody: "ማመልከቻዎችዎን እና መልዕክቶችዎን ለማስተዳደር ይግቡ።", phone: "ስልክ ቁጥር", password: "የይለፍ ቃል", sendCode: "የማረጋገጫ ኮድ ላክ", loginButton: "ግባ", workerChoice: "ሰራተኛ ነኝ", workerDesc: "ስራ ያግኙ እና ያድጉ", hiringChoice: "እቀጥራለሁ", hiringDesc: "የታመነ ሰው ያግኙ", noWorkerFee: "ሰራተኞች ለመመዝገብ፣ ለማመልከት ወይም ለኮሚሽን ክፍያ አይከፍሉም።", already: "መለያ አለዎት? ይግቡ", newAccount: "አዲስ ነዎት? መለያ ይፍጠሩ", verification: "የስልክ ማረጋገጫ", checkPhone: "ስልክዎን ይመልከቱ።", codeBody: "የ6 አሃዝ ኮድ ወደ ስልክዎ ተልኳል", verify: "አረጋግጠው ይቀጥሉ", different: "ሌላ ቁጥር ይጠቀሙ", signedIn: "ገብተዋል።", dashboard: "መገለጫዎ እና ማመልከቻዎችዎ ዝግጁ ናቸው።", hiringDashboard: "የቤተሰብ ቅጥር ዳሽቦርድዎ ዝግጁ ነው።"
  }
} as const;

const workspaceCopy = {
  en: {
    memberSince: "Member since", filterNote: "Filter by work type and skill", applied: "Applied", apply: "Apply now", signOut: "Sign out", allTypes: "All types", allSkills: "All skills", fullTime: "Full-time", partTime: "Part-time", weekend: "Weekend", liveIn: "Live-in", liveOut: "Live-out", childcare: "Childcare", cooking: "Cooking", cleaning: "Cleaning", workerWorkspace: "WORKER WORKSPACE", workerTitle: "Your next opportunity, organized.", workerBody: "Complete your profile, track applications, and stay close to employers in one simple place.", noWorkerFees: "No worker fees, ever", workerProfile: "Your worker profile", verifiedReview: "Profile verified for review", completeProfile: "Complete your profile", profileComplete: "profile complete", overview: "Overview", myProfile: "My profile", applications: "Applications", messages: "Messages", thisWeek: "THIS WEEK", keepMoving: "Keep moving forward.", savedJobs: "Saved jobs", profileViews: "Profile views", interviewInvitation: "Interview invitation", interviewBody: "A household wants to meet you tomorrow at 10:00 AM.", new: "New", interviewScheduled: "Interview scheduled", scheduleInterview: "Schedule interview", messageEmployer: "Message employer", yourProfile: "YOUR PROFILE", profileTitle: "Show employers your strengths.", saved: "Saved", draft: "Draft", profilePhoto: "Profile photo", fullName: "Full name", primarySkill: "Primary skill", location: "Location", experience: "Experience", experienceDocument: "Experience document", expectedSalary: "Expected salary", availability: "Availability", availableNow: "Available now", availableNextWeek: "Available next week", partTimeOnly: "Part-time only", guarantor: "Guarantor", guarantorBody: "Add a trusted guarantor to support your verification.", guarantorName: "Guarantor name", guarantorDocument: "Guarantor document", saveProfile: "Save profile", applicationTracker: "APPLICATION TRACKER", yourApplications: "Your applications.", underReview: "Under review", noApplications: "Your applications will appear here. Apply to a role above to get started.", messagesInterviews: "MESSAGES & INTERVIEWS", conversation: "Stay in the conversation.", reply: "Reply", setInterview: "Set interview time", employerWorkspace: "EMPLOYER WORKSPACE", employerTitle: "Hire with clarity and confidence.", employerBody: "Verify your household, publish roles, compare applicants, and make a fair hiring decision.", commissionNotice: "Employer commission shown before hiring", householdProfile: "Household profile", verificationRequired: "Verification required", companyProfile: "Company profile", jobPosts: "Job posts", applicants: "Applicants", hiringHistory: "Hiring history", householdDashboard: "HOUSEHOLD DASHBOARD", trustedTeam: "Build your trusted team.", activeJobPosts: "Active job posts", shortlisted: "Shortlisted", successfulHires: "Successful hires", verifiedProfile: "Start with a verified profile", setupCompany: "Set up company profile", employerVerification: "EMPLOYER VERIFICATION", meetWorkers: "Tell workers who they’ll meet.", submitted: "Submitted", notVerified: "Not verified", householdName: "Household or company name", aboutHousehold: "About the household or company", submitVerification: "Submit for verification", jobManagement: "JOB MANAGEMENT", publishRole: "Publish a clear role.", jobTitle: "Job title", requiredSkill: "Required skill", jobType: "Job type", salaryPay: "Salary or daily pay", publishJob: "Publish job post", activePosts: "Your active posts", active: "Active", applicantReview: "APPLICANT REVIEW", meetVerified: "Meet verified workers.", shortlist: "Shortlist", chat: "Chat", messageSent: "Message sent", interviewSet: "Interview set", hireWorker: "Hire worker", hired: "Hired", commissionText: "I understand HomeLink charges a transparent commission to the household only after a successful hire. Workers pay no placement or application fees.", pastPlacements: "Your past placements.", completed: "Completed", noCompletedHires: "Completed hires will appear here.", brokerNetwork: "BROKER NETWORK", brokerTitle: "Connect trusted workers and employers.", brokerWorkspace: "DELALA / BROKER WORKSPACE", runPlacements: "Run placements professionally.", brokerBody: "Manage your worker portfolio, coordinate households, track placements, and keep every commission record transparent.", licenseNotice: "Legal business licence required", brokerProfile: "Broker profile", licenseRequired: "Licence verification required", licenseSubmitted: "Licence submitted", businessLicense: "Business licence", workerPortfolio: "Worker portfolio", employers: "Employers", placements: "Placements", commissionRecords: "Commission records", brokerDashboard: "BROKER DASHBOARD", placementDesk: "Your placement desk.", activeWorkers: "Active workers", openPlacements: "Open placements", thisMonth: "This month", verifyLicense: "Verify your legal business licence", licenseBody: "Only licensed brokers can manage placements. A verified licence builds trust with workers and households.", submitLicense: "Submit licence", legalVerification: "LEGAL BUSINESS VERIFICATION", registerBusiness: "Register your broker business.", businessName: "Business name", ownerName: "Owner or manager name", businessAddress: "Business address", licenseNumber: "Licence number", legalLicense: "Legal business licence", submitReview: "Submit for review", managedWorkers: "Your managed workers.", available: "Available", placed: "Placed", performance: "Ratings & performance history", performanceBody: "Average portfolio rating: ★ 4.8 · 18 successful placements · 92% employer satisfaction.", reliable: "Reliable", highlyRated: "Highly rated", employerNetwork: "EMPLOYER NETWORK", supportedHouseholds: "Households you support.", verifiedEmployer: "Verified employer", viewPlacements: "View placements", placementTracking: "PLACEMENT TRACKING", visiblePlacements: "Keep every placement visible.", interviewComplete: "Interview complete · Placement in progress", tracked: "Tracked", trackPlacement: "Track placement", transparentEarnings: "Transparent earnings.", commissionBody: "Record commissions only after a successful household hire. Workers never pay placement fees.", householdPaid: "Household-paid · Completed placement", accountAccess: "Account access", processing: "Processing account access...", attention: "Account access needs attention", close: "Close", verificationCode: "Verification code"
  },
  am: {
    memberSince: "አባል የሆነበት", filterNote: "በስራ አይነትና ችሎታ ይማረጡ", applied: "ተመዝግበዋል", apply: "አሁን ያመልክቱ", signOut: "ውጣ", allTypes: "ሁሉም አይነቶች", allSkills: "ሁሉም ችሎታዎች", fullTime: "ሙሉ ጊዜ", partTime: "ከፊል ጊዜ", weekend: "የሳምንት መጨረሻ", liveIn: "ከቤት ጋር", liveOut: "ከቤት ውጭ", childcare: "የህጻናት እንክብካቤ", cooking: "ምግብ ማብሰል", cleaning: "ጽዳት", workerWorkspace: "የሰራተኛ ስራ ቦታ", workerTitle: "ቀጣዩን እድልዎን ያደራጁ።", workerBody: "መገለጫዎን ያሟሉ፣ ማመልከቻዎችን ይከታተሉ እና ከቀጣሪዎች ጋር ይገናኙ።", noWorkerFees: "ለሰራተኞች ምንም ክፍያ የለም", workerProfile: "የሰራተኛ መገለጫዎ", verifiedReview: "መገለጫው ለማረጋገጥ ተዘጋጅቷል", completeProfile: "መገለጫዎን ያሟሉ", profileComplete: "የመገለጫ ማጠናቀቂያ", overview: "አጠቃላይ እይታ", myProfile: "መገለጫዬ", applications: "ማመልከቻዎች", messages: "መልዕክቶች", thisWeek: "በዚህ ሳምንት", keepMoving: "ወደፊት ይቀጥሉ።", savedJobs: "የተቀመጡ ስራዎች", profileViews: "የመገለጫ እይታዎች", interviewInvitation: "የቃለ መጠይቅ ግብዣ", interviewBody: "አንድ ቤተሰብ ነገ 10፡00 ላይ ሊያገኝዎት ይፈልጋል።", new: "አዲስ", interviewScheduled: "ቃለ መጠይቁ ተይዟል", scheduleInterview: "ቃለ መጠይቅ ይያዙ", messageEmployer: "ቀጣሪውን ያነጋግሩ", yourProfile: "መገለጫዎ", profileTitle: "ችሎታዎን ለቀጣሪዎች ያሳዩ።", saved: "ተቀምጧል", draft: "ረቂቅ", profilePhoto: "የመገለጫ ፎቶ", fullName: "ሙሉ ስም", primarySkill: "ዋና ችሎታ", location: "ቦታ", experience: "ልምድ", experienceDocument: "የልምድ ማስረጃ", expectedSalary: "የሚጠበቅ ደመወዝ", availability: "የስራ መገኘት", availableNow: "አሁን ዝግጁ", availableNextWeek: "በሚቀጥለው ሳምንት ዝግጁ", partTimeOnly: "ከፊል ጊዜ ብቻ", guarantor: "ዋስ", guarantorBody: "ማረጋገጫዎን ለመደገፍ የሚታመን ዋስ ያክሉ።", guarantorName: "የዋስ ስም", guarantorDocument: "የዋስ ሰነድ", saveProfile: "መገለጫ ያስቀምጡ", applicationTracker: "የማመልከቻ መከታተያ", yourApplications: "ማመልከቻዎችዎ።", underReview: "በግምገማ ላይ", noApplications: "ማመልከቻዎችዎ እዚህ ይታያሉ። ለመጀመር ከላይ ላለ ስራ ያመልክቱ።", messagesInterviews: "መልዕክቶችና ቃለ መጠይቆች", conversation: "ውይይቱን ይቀጥሉ።", reply: "መልስ", setInterview: "የቃለ መጠይቅ ጊዜ ይወስኑ", employerWorkspace: "የቀጣሪ ስራ ቦታ", employerTitle: "በግልጽነትና በመተማመን ይቅጠሩ።", employerBody: "ቤተሰብዎን ያረጋግጡ፣ ስራ ያትሙ፣ አመልካቾችን ያነጻጽሩ።", commissionNotice: "የቀጣሪ ኮሚሽን ከቅጥር በፊት ይታያል", householdProfile: "የቤተሰብ መገለጫ", verificationRequired: "ማረጋገጫ ያስፈልጋል", licenseNotice: "ህጋዊ የንግድ ፈቃድ ያስፈልጋል", brokerWorkspace: "የደላላ ስራ ቦታ", runPlacements: "ምደባዎችን በሙያ ያስተዳድሩ።", brokerBody: "ሰራተኞችንና ቤተሰቦችን ያስተዳድሩ፣ ምደባዎችን ይከታተሉ።"
  }
} as const;

const amWorkspaceCopy = {
  companyProfile: "የድርጅት መገለጫ", jobPosts: "የስራ ማስታወቂያዎች", applicants: "አመልካቾች", hiringHistory: "የቅጥር ታሪክ", householdDashboard: "የቤተሰብ ዳሽቦርድ", trustedTeam: "የሚታመን ቡድንዎን ይገንቡ።", activeJobPosts: "ንቁ የስራ ማስታወቂያዎች", shortlisted: "የተመረጡ", successfulHires: "የተሳካ ቅጥር", verifiedProfile: "በተረጋገጠ መገለጫ ይጀምሩ", setupCompany: "የድርጅት መገለጫ ያዘጋጁ", employerVerification: "የቀጣሪ ማረጋገጫ", meetWorkers: "ሰራተኞች ማንን እንደሚያገኙ ይወቁ።", submitted: "ተልኳል", notVerified: "አልተረጋገጠም", householdName: "የቤተሰብ ወይም የድርጅት ስም", aboutHousehold: "ስለ ቤተሰቡ ወይም ድርጅቱ", submitVerification: "ለማረጋገጥ ይላኩ", jobManagement: "የስራ አስተዳደር", publishRole: "ግልጽ የስራ ድርሻ ያትሙ።", jobTitle: "የስራ ርዕስ", requiredSkill: "የሚፈለግ ችሎታ", jobType: "የስራ አይነት", salaryPay: "ደመወዝ ወይም የቀን ክፍያ", publishJob: "የስራ ማስታወቂያ ያትሙ", applicantReview: "የአመልካቾች ግምገማ", meetVerified: "የተረጋገጡ ሰራተኞችን ያግኙ።", shortlist: "ይምረጡ", chat: "ውይይት", messageSent: "መልዕክት ተልኳል", interviewSet: "ቃለ መጠይቅ ተይዟል", hireWorker: "ሰራተኛ ይቅጠሩ", hired: "ተቀጥሯል", pastPlacements: "ያለፉ ምደባዎችዎ", completed: "ተጠናቋል", noCompletedHires: "የተጠናቀቁ ቅጥሮች እዚህ ይታያሉ።", brokerNetwork: "የደላላ አውታረ መረብ", brokerTitle: "የታመኑ ሰራተኞችንና ቀጣሪዎችን ያገናኙ።", brokerDashboard: "የደላላ ዳሽቦርድ", placementDesk: "የምደባ ጠረጴዛዎ", activeWorkers: "ንቁ ሰራተኞች", openPlacements: "ክፍት ምደባዎች", thisMonth: "በዚህ ወር", verifyLicense: "ህጋዊ የንግድ ፈቃድዎን ያረጋግጡ", licenseBody: "ፈቃድ ያላቸው ደላላዎች ብቻ ምደባዎችን ማስተዳደር ይችላሉ።", submitLicense: "ፈቃድ ይላኩ", legalVerification: "የህጋዊ ንግድ ማረጋገጫ", registerBusiness: "የደላላ ንግድዎን ይመዝግቡ።", businessName: "የንግድ ስም", ownerName: "የባለቤት ወይም አስተዳዳሪ ስም", businessAddress: "የንግድ አድራሻ", licenseNumber: "የፈቃድ ቁጥር", legalLicense: "ህጋዊ የንግድ ፈቃድ", submitReview: "ለግምገማ ይላኩ", managedWorkers: "የሚያስተዳድሯቸው ሰራተኞች", available: "ዝግጁ", placed: "ተመድቧል", performance: "ደረጃና የአፈጻጸም ታሪክ", employerNetwork: "የቀጣሪዎች አውታረ መረብ", supportedHouseholds: "የሚደግፏቸው ቤተሰቦች", verifiedEmployer: "የተረጋገጠ ቀጣሪ", viewPlacements: "ምደባዎችን ይመልከቱ", placementTracking: "የምደባ ክትትል", visiblePlacements: "እያንዳንዱን ምደባ ይከታተሉ።", interviewComplete: "ቃለ መጠይቅ ተጠናቋል · ምደባ በሂደት ላይ", tracked: "ተከታትሏል", trackPlacement: "ምደባ ይከታተሉ", commissionRecords: "የኮሚሽን መዝገቦች", transparentEarnings: "ግልጽ ገቢ", commissionBody: "ኮሚሽን የሚመዘገበው ቤተሰቡ በተሳካ ሁኔታ ከቀጠረ በኋላ ብቻ ነው።", householdPaid: "በቤተሰብ የተከፈለ · ምደባ ተጠናቋል"
} as const;

const jobs = [
  { id: "demo-nanny", title: "Live-in nanny for two children", location: "Bole, Addis Ababa", pay: "ETB 7,500", type: "Full-time", skill: "Childcare", posted: "2h ago", initials: "AM", verified: true, rating: "4.9" },
  { id: "demo-cook", title: "Experienced home cook", location: "Kazanchis, Addis Ababa", pay: "ETB 6,000", type: "Full-time", skill: "Cooking", posted: "5h ago", initials: "SK", verified: true, rating: "4.8" },
  { id: "demo-cleaner", title: "Weekend home cleaner", location: "CMC, Addis Ababa", pay: "ETB 1,200 / day", type: "Part-time", skill: "Cleaning", posted: "1d ago", initials: "NH", verified: false, rating: "4.6" },
];

export default function Home() {
  const [role, setRole] = useState<Role>("worker");
  const [language, setLanguage] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("All types");
  const [jobSkill, setJobSkill] = useState("All skills");
  const [saved, setSaved] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>("form");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [workerTab, setWorkerTab] = useState<"overview" | "profile" | "applications" | "messages">("overview");
  const [profile, setProfile] = useState({ name: "", skill: "Childcare", location: "Bole, Addis Ababa", experience: "", salary: "", availability: "Available now" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(false);
  const [employerTab, setEmployerTab] = useState<"overview" | "company" | "jobs" | "applicants" | "history">("overview");
  const [company, setCompany] = useState({ name: "", address: "Addis Ababa", phone: "", description: "" });
  const [companySaved, setCompanySaved] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", skill: "Childcare", location: "Bole, Addis Ababa", pay: "", type: "Full-time" });
  const [postedJobs, setPostedJobs] = useState<string[]>([]);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [hired, setHired] = useState<string[]>([]);
  const [employerMessage, setEmployerMessage] = useState(false);
  const [commissionConfirmed, setCommissionConfirmed] = useState(false);
  const [brokerTab, setBrokerTab] = useState<"overview" | "business" | "workers" | "employers" | "placements" | "commissions">("overview");
  const [broker, setBroker] = useState({ businessName: "", ownerName: "", phone: "", address: "Addis Ababa", licenseNumber: "" });
  const [brokerSaved, setBrokerSaved] = useState(false);
  const [brokerPlacement, setBrokerPlacement] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const t = copy[language];
  const w = language === "am" ? { ...workspaceCopy.en, ...workspaceCopy.am, ...amWorkspaceCopy } : workspaceCopy.en;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        setUserId(data.user.id);
        setIsSignedIn(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setIsSignedIn(Boolean(session?.user));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter((job) => `${job.title} ${job.location} ${job.skill}`.toLowerCase().includes(query.toLowerCase()) && (jobType === "All types" || job.type === jobType) && (jobSkill === "All skills" || job.skill === jobSkill));
    return showAll ? filtered : filtered.slice(0, 3);
  }, [query, jobType, jobSkill, showAll]);

  async function toggleSaved(title: string) {
    setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
    const job = jobs.find((item) => item.title === title);
    if (!job || !userId || job.id.startsWith("demo-")) return;
    const { error } = await saveJob(job.id, userId);
    if (error) setAuthError(error.message);
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthStep("form");
    setPassword("");
    setOtp("");
    setAuthError("");
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    setAuthBusy(true);
    setAuthError("");
    try {
      if (authMode === "signup") {
        if (supabase) {
          const { error } = await supabase.auth.signUp({ phone, password, options: { data: { role } } });
          if (error) throw error;
        }
        setAuthStep("otp");
        return;
      }
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ phone, password });
        if (error) throw error;
      }
      setIsSignedIn(true);
      setAuthMode(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to complete account access.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    setAuthBusy(true);
    setAuthError("");
    try {
      if (supabase) {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        if (error) throw error;
      }
      setIsSignedIn(true);
      setAuthMode(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "That verification code could not be accepted.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function applyForJob(title: string) {
    if (!appliedJobs.includes(title)) setAppliedJobs((current) => [...current, title]);
    const job = jobs.find((item) => item.title === title);
    if (!job || !userId || job.id.startsWith("demo-")) return;
    const { error } = await applyToJob(job.id, userId);
    if (error) setAuthError(error.message);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (userId) {
      const { error } = await saveProfileToBackend({
        id: userId,
        role: "worker",
        fullName: profile.name,
        location: profile.location,
        skills: [profile.skill],
        experienceYears: Number.parseInt(profile.experience, 10) || undefined,
        expectedSalary: Number.parseInt(profile.salary.replace(/[^0-9]/g, ""), 10) || undefined,
        availability: profile.availability,
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
    }
    setProfileSaved(true);
  }

  function saveCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanySaved(true);
  }

  function postJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (jobForm.title) {
      setPostedJobs((current) => [...current, jobForm.title]);
      if (userId) {
        void createJob({
          employerId: userId,
          title: jobForm.title,
          skill: jobForm.skill,
          location: jobForm.location,
          jobType: jobForm.type.toLowerCase().replace("-", "_") as "full_time" | "part_time" | "weekend" | "live_in" | "live_out",
          salary: Number.parseInt(jobForm.pay.replace(/[^0-9]/g, ""), 10) || 0,
        }).then(({ error }) => {
          if (error) setAuthError(error.message);
        });
      }
    }
    setJobForm({ ...jobForm, title: "", pay: "" });
  }

  function toggleShortlist(name: string) {
    setShortlisted((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function hireWorker(name: string) {
    if (!commissionConfirmed) return;
    setHired((current) => current.includes(name) ? current : [...current, name]);
  }

  function saveBroker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBrokerSaved(true);
  }

  function trackPlacement(name: string) {
    setBrokerPlacement((current) => current.includes(name) ? current : [...current, name]);
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#17231f]">
      <div className="city-strip"><div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 lg:px-10"><span>● Addis Ababa · Ethiopia</span><span>Trusted domestic employment, made simple</span></div></div>
      <nav className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="brand-mark">H</div>
          <span className="font-serif text-xl font-bold tracking-tight">HomeLink</span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#65706b] md:flex">
          <a className="text-[#17231f]" href="#jobs">{t.navWork}</a>
          <a href="#trust">{t.navHow}</a>
          <a href="#stories">{t.navStories}</a>
        </div>
        <div className="flex items-center gap-3">
          <div className="language-switch" aria-label="Language switcher"><button onClick={() => setLanguage("en")} className={language === "en" ? "active" : ""}>EN</button><button onClick={() => setLanguage("am")} className={language === "am" ? "active" : ""}>አማ</button></div>
          {isSignedIn ? <button onClick={() => setIsSignedIn(false)} className="rounded-full border border-[#d4d7ce] bg-white px-4 py-2.5 text-sm font-semibold text-[#193f34]">{w.signOut}</button> : <><button onClick={() => openAuth("login")} className="hidden px-3 py-2 text-sm font-semibold text-[#65706b] sm:block">{t.login}</button><button onClick={() => openAuth("signup")} className="rounded-full bg-[#193f34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#28594b]">{t.join}</button></>}
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1320px] gap-12 px-6 pb-14 pt-12 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-20 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#b45d3c]"><span className="h-2 w-2 rounded-full bg-[#d77b54]" />{t.eyebrow}</div>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[.98] tracking-[-.04em] text-[#193f34] sm:text-7xl">{language === "en" ? <>Good work starts with <em className="font-normal text-[#cc6b47]">trust.</em></> : t.hero}</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#63706a]">{t.heroBody}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button onClick={() => { setRole("worker"); openAuth("signup"); }} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${role === "worker" ? "bg-[#d97952] text-white" : "border border-[#d4d7ce] bg-white text-[#54635d]"}`}>{t.worker}</button>
            <button onClick={() => { setRole("household"); openAuth("signup"); }} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${role === "household" ? "bg-[#193f34] text-white" : "border border-[#d4d7ce] bg-white text-[#54635d]"}`}>{t.household}</button>
          </div>
          <div className="mt-12 flex items-center gap-4 border-t border-[#dfe0d8] pt-5 text-sm text-[#63706a]">
            <div className="avatar-stack"><span>AM</span><span>FN</span><span>TK</span></div><span><strong className="text-[#193f34]">2,400+</strong> {t.members}</span>
          </div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#d7e0d4] p-7 shadow-[0_24px_60px_rgba(45,67,52,.12)] lg:min-h-[480px]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#bed0bd]" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#e8b690] opacity-70" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between"><span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#466256]">{t.community}</span><span className="text-2xl text-[#466256]">↗</span></div>
            <div className="self-center text-center"><div className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-[#f8f4ea] bg-[#b97558] text-6xl">☺</div><p className="font-serif text-2xl font-bold text-[#193f34]">{t.next}<br />{t.start}</p></div>
            <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#63766d]">{w.memberSince}</p><p className="mt-1 font-serif text-lg font-bold text-[#193f34]">2024</p></div><span className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-semibold text-white">{t.peopleFirst}</span></div>
          </div>
        </div>
      </section>

      <section id="jobs" className="bg-[#193f34] px-6 py-14 text-white lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold text-[#e89a75]">{role === "worker" ? t.opportunities : role === "broker" ? w.brokerNetwork : t.hire}</p><h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">{role === "worker" ? t.workTitle : role === "broker" ? w.brokerTitle : t.hireTitle}</h2></div><button onClick={() => setShowAll(!showAll)} className="self-start rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 md:self-auto">{showAll ? t.less : t.allJobs} <span className="ml-2">→</span></button></div>
          <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-[#285448] p-3"><div className="flex flex-col gap-4 sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#193f34]"><span className="text-lg">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-[#8c9890]" placeholder={t.search} /></div><button className="rounded-xl bg-[#e28b66] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ee9b78]">{t.searchButton}</button></div><div className="flex flex-wrap gap-2"><select value={jobType} onChange={(event) => setJobType(event.target.value)} className="filter-select"><option value="All types">{w.allTypes}</option><option value="Full-time">{w.fullTime}</option><option value="Part-time">{w.partTime}</option><option value="Weekend">{w.weekend}</option><option value="Live-in">{w.liveIn}</option><option value="Live-out">{w.liveOut}</option></select><select value={jobSkill} onChange={(event) => setJobSkill(event.target.value)} className="filter-select"><option value="All skills">{w.allSkills}</option><option value="Childcare">{w.childcare}</option><option value="Cooking">{w.cooking}</option><option value="Cleaning">{w.cleaning}</option></select><span className="filter-note">{w.filterNote}</span></div></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">{visibleJobs.map((job) => <article key={job.title} className="group rounded-2xl bg-[#f8f6f0] p-5 text-[#193f34] transition hover:-translate-y-1"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4b8a0] text-xs font-bold text-[#754c3d]">{job.initials}</div><div><p className="text-sm font-bold">{job.title}</p><p className="mt-1 text-xs text-[#718078]">{job.location} · {job.posted}</p></div></div><button aria-label={`Save ${job.title}`} onClick={() => toggleSaved(job.title)} className="text-xl text-[#9ca9a0] transition hover:text-[#d97952]">{saved.includes(job.title) ? "♥" : "♡"}</button></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-[#e6eee4] px-3 py-1.5 text-[#42705c]">{job.skill}</span><span className="rounded-full bg-[#f0e6d9] px-3 py-1.5 text-[#9b6045]">{job.type}</span><span className="ml-auto text-[#b87843]">★ {job.rating}</span></div><div className="mt-5 flex items-end justify-between border-t border-[#e2e2d8] pt-4"><div><p className="text-xs text-[#87928b]">{t.pay}</p><p className="mt-1 font-serif text-xl font-bold">{job.pay}</p></div><div className="flex items-center gap-3"><button onClick={() => applyForJob(job.title)} disabled={appliedJobs.includes(job.title)} className="rounded-full bg-[#d97952] px-3 py-2 text-xs font-bold text-white disabled:bg-[#9db4a2]">{appliedJobs.includes(job.title) ? w.applied : w.apply}</button><button className="text-sm font-bold text-[#cc6b47]">{t.view} →</button></div></div></article>)}</div>
          {visibleJobs.length === 0 && <p className="py-10 text-center text-[#b4c3ba]">{t.noResults}</p>}
        </div>
      </section>

      {role === "worker" && isSignedIn && <section id="worker-space" className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold text-[#b45d3c]">{w.workerWorkspace}</p><h2 className="font-serif text-4xl font-bold text-[#193f34]">{w.workerTitle}</h2><p className="mt-3 max-w-2xl text-[#718078]">{w.workerBody}</p></div><div className="rounded-xl bg-[#eaf0e8] px-4 py-3 text-sm font-semibold text-[#42705c]">✓ {w.noWorkerFees}</div></div>
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <aside className="rounded-2xl bg-[#193f34] p-5 text-white shadow-lg"><div className="flex items-center gap-4 border-b border-white/15 pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d97952] text-lg font-bold">{profile.name ? profile.name.slice(0, 2).toUpperCase() : "AM"}</div><div><p className="font-bold">{profile.name || w.workerProfile}</p><p className="mt-1 text-xs text-[#b5cabc]">{profileSaved ? w.verifiedReview : w.completeProfile}</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className={`h-full rounded-full bg-[#e28b66] ${profileSaved ? "w-full" : "w-2/5"}`} /></div><p className="mt-2 text-xs text-[#b5cabc]">{profileSaved ? `100% ${w.profileComplete}` : `40% ${w.profileComplete}`}</p><div className="mt-6 space-y-1"><button onClick={() => setWorkerTab("overview")} className={`workspace-nav ${workerTab === "overview" ? "selected" : ""}`}>▦ {w.overview} <span>{appliedJobs.length}</span></button><button onClick={() => setWorkerTab("profile")} className={`workspace-nav ${workerTab === "profile" ? "selected" : ""}`}>◎ {w.myProfile}</button><button onClick={() => setWorkerTab("applications")} className={`workspace-nav ${workerTab === "applications" ? "selected" : ""}`}>✓ {w.applications} <span>{appliedJobs.length}</span></button><button onClick={() => setWorkerTab("messages")} className={`workspace-nav ${workerTab === "messages" ? "selected" : ""}`}>✉ {w.messages} <span>2</span></button></div></aside>
          <div className="rounded-2xl border border-[#dfe3d9] bg-white p-6 shadow-[0_14px_40px_rgba(45,67,52,.06)]">
            {workerTab === "overview" && <div><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-[#b45d3c]">{w.thisWeek}</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">{w.keepMoving}</h3></div><button onClick={() => setWorkerTab("profile")} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{w.completeProfile}</button></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="stat-card"><span>{w.savedJobs}</span><strong>{saved.length}</strong></div><div className="stat-card"><span>{w.applications}</span><strong>{appliedJobs.length}</strong></div><div className="stat-card"><span>{w.profileViews}</span><strong>12</strong></div></div><div className="mt-7 rounded-xl bg-[#f6f4ef] p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[#193f34]">{w.interviewInvitation}</p><p className="mt-1 text-xs text-[#718078]">{w.interviewBody}</p></div><span className="rounded-full bg-[#f0e6d9] px-3 py-1 text-xs font-bold text-[#9b6045]">{w.new}</span></div><div className="mt-4 flex gap-2"><button onClick={() => setInterviewScheduled(true)} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{interviewScheduled ? w.interviewScheduled : w.scheduleInterview}</button><button onClick={() => setWorkerTab("messages")} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{w.messageEmployer}</button></div></div></div>}
            {workerTab === "profile" && <form onSubmit={saveProfile}><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-[#b45d3c]">YOUR PROFILE</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Show employers your strengths.</h3></div><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-bold text-[#42705c]">{profileSaved ? "✓ Saved" : "Draft"}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label sm:col-span-2">Profile photo<input type="file" accept="image/*" className="file-input" /></label><label className="field-label">Full name<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="e.g. Abeba Mekonnen" /></label><label className="field-label">Primary skill<select value={profile.skill} onChange={(event) => setProfile({ ...profile, skill: event.target.value })}><option>Childcare</option><option>Cooking</option><option>Cleaning</option><option>Caregiving</option><option>Laundry</option><option>Security</option><option>Labor worker</option></select></label><label className="field-label">Location<input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} /></label><div><label className="field-label">Experience<input required value={profile.experience} onChange={(event) => setProfile({ ...profile, experience: event.target.value })} placeholder="e.g. 3 years" /></label><label className="field-label mt-3">Experience document / የልምድ ማስረጃ<input required type="file" accept="image/*,.pdf" className="file-input" /></label></div><label className="field-label">Expected salary<input value={profile.salary} onChange={(event) => setProfile({ ...profile, salary: event.target.value })} placeholder="e.g. ETB 7,500 / month" /></label><label className="field-label">Availability<select value={profile.availability} onChange={(event) => setProfile({ ...profile, availability: event.target.value })}><option>Available now</option><option>Available next week</option><option>Part-time only</option></select></label><div className="guarantor-panel sm:col-span-2"><p className="text-sm font-bold text-[#193f34]">Guarantor / ተያዥ (ዋስ)</p><p className="mt-1 text-xs text-[#718078]">Add a trusted guarantor to support your verification.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="field-label">Guarantor name / የዋስ ስም<input required placeholder="Full name / ሙሉ ስም" /></label><label className="field-label">Guarantor document / የዋስ ሰነድ<input required type="file" accept="image/*,.pdf" className="file-input" /></label></div></div></div><button className="mt-6 rounded-full bg-[#193f34] px-5 py-3 text-sm font-bold text-white">Save profile</button></form>}
            {workerTab === "applications" && <div><p className="text-sm font-semibold text-[#b45d3c]">APPLICATION TRACKER</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Your applications.</h3><div className="mt-6 space-y-3">{appliedJobs.length ? appliedJobs.map((title) => <div key={title} className="flex items-center justify-between rounded-xl bg-[#f6f4ef] p-4"><div><p className="text-sm font-bold text-[#193f34]">{title}</p><p className="mt-1 text-xs text-[#718078]">Applied today · Bole, Addis Ababa</p></div><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-bold text-[#42705c]">Under review</span></div>) : <p className="rounded-xl bg-[#f6f4ef] p-5 text-sm text-[#718078]">Your applications will appear here. Apply to a role above to get started.</p>}</div></div>}
            {workerTab === "messages" && <div><p className="text-sm font-semibold text-[#b45d3c]">MESSAGES & INTERVIEWS</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Stay in the conversation.</h3><div className="mt-6 rounded-xl border border-[#dfe3d9] p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[#193f34]">Mekdes household</p><p className="mt-1 text-xs text-[#718078]">“Are you available for a short interview tomorrow?”</p></div><span className="h-2 w-2 rounded-full bg-[#d97952]" /></div><div className="mt-4 flex gap-2"><button onClick={() => setMessageSent(true)} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{messageSent ? "Message sent" : "Reply"}</button><button onClick={() => setInterviewScheduled(true)} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{interviewScheduled ? "Scheduled" : "Set interview time"}</button></div></div></div>}
          </div>
        </div>
      </section>}

      {role === "household" && isSignedIn && <section id="employer-space" className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold text-[#b45d3c]">EMPLOYER WORKSPACE</p><h2 className="font-serif text-4xl font-bold text-[#193f34]">Hire with clarity and confidence.</h2><p className="mt-3 max-w-2xl text-[#718078]">Verify your household, publish roles, compare applicants, and make a fair hiring decision.</p></div><div className="rounded-xl bg-[#fff0e9] px-4 py-3 text-sm font-semibold text-[#a34f35]">Employer commission shown before hiring</div></div>
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <aside className="rounded-2xl bg-[#193f34] p-5 text-white shadow-lg"><div className="flex items-center gap-4 border-b border-white/15 pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e28b66] text-lg font-bold">{company.name ? company.name.slice(0, 2).toUpperCase() : "HH"}</div><div><p className="font-bold">{company.name || "Household profile"}</p><p className="mt-1 text-xs text-[#b5cabc]">{companySaved ? "✓ Verified for hiring" : "Verification required"}</p></div></div><div className="mt-6 space-y-1"><button onClick={() => setEmployerTab("overview")} className={`workspace-nav ${employerTab === "overview" ? "selected" : ""}`}>▦ Overview <span>{postedJobs.length}</span></button><button onClick={() => setEmployerTab("company")} className={`workspace-nav ${employerTab === "company" ? "selected" : ""}`}>◎ Company profile</button><button onClick={() => setEmployerTab("jobs")} className={`workspace-nav ${employerTab === "jobs" ? "selected" : ""}`}>＋ Job posts <span>{postedJobs.length}</span></button><button onClick={() => setEmployerTab("applicants")} className={`workspace-nav ${employerTab === "applicants" ? "selected" : ""}`}>♧ Applicants <span>{shortlisted.length}</span></button><button onClick={() => setEmployerTab("history")} className={`workspace-nav ${employerTab === "history" ? "selected" : ""}`}>↺ Hiring history <span>{hired.length}</span></button></div></aside>
          <div className="rounded-2xl border border-[#dfe3d9] bg-white p-6 shadow-[0_14px_40px_rgba(45,67,52,.06)]">
            {employerTab === "overview" && <div><p className="text-sm font-semibold text-[#b45d3c]">HOUSEHOLD DASHBOARD</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Build your trusted team.</h3><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="stat-card"><span>Active job posts</span><strong>{postedJobs.length}</strong></div><div className="stat-card"><span>Shortlisted</span><strong>{shortlisted.length}</strong></div><div className="stat-card"><span>Successful hires</span><strong>{hired.length}</strong></div></div><div className="mt-7 rounded-xl bg-[#f6f4ef] p-4"><p className="text-sm font-bold text-[#193f34]">Start with a verified profile</p><p className="mt-1 text-xs leading-5 text-[#718078]">A complete household profile helps workers feel confident before they apply. Your address and contact information remain protected.</p><button onClick={() => setEmployerTab("company")} className="mt-4 rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">Set up company profile</button></div></div>}
            {employerTab === "company" && <form onSubmit={saveCompany}><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-[#b45d3c]">EMPLOYER VERIFICATION</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Tell workers who they’ll meet.</h3></div><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-bold text-[#42705c]">{companySaved ? "✓ Submitted" : "Not verified"}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label">Household or company name<input required value={company.name} onChange={(event) => setCompany({ ...company, name: event.target.value })} placeholder="e.g. Bekele family" /></label><label className="field-label">Phone number<input required value={company.phone} onChange={(event) => setCompany({ ...company, phone: event.target.value })} placeholder="+251 9XX XXX XXX" /></label><label className="field-label">Address<input required value={company.address} onChange={(event) => setCompany({ ...company, address: event.target.value })} /></label><label className="field-label">Verification document<input required type="file" accept="image/*,.pdf" className="file-input" /></label><label className="field-label sm:col-span-2">About the household or company<textarea value={company.description} onChange={(event) => setCompany({ ...company, description: event.target.value })} placeholder="Describe your household, values, and workplace" rows={3} /></label></div><button className="mt-6 rounded-full bg-[#193f34] px-5 py-3 text-sm font-bold text-white">Submit for verification</button></form>}
            {employerTab === "jobs" && <form onSubmit={postJob}><p className="text-sm font-semibold text-[#b45d3c]">JOB MANAGEMENT</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Publish a clear role.</h3><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label sm:col-span-2">Job title<input required value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} placeholder="e.g. Live-in nanny for two children" /></label><label className="field-label">Required skill<select value={jobForm.skill} onChange={(event) => setJobForm({ ...jobForm, skill: event.target.value })}><option>Childcare</option><option>Cooking</option><option>Cleaning</option><option>Caregiving</option><option>Laundry</option><option>Security</option><option>Labor worker</option></select></label><label className="field-label">Job type / የስራ አይነት<select value={jobForm.type} onChange={(event) => setJobForm({ ...jobForm, type: event.target.value })}><option>Full-time</option><option>Part-time</option><option>Weekend</option><option>Live-in</option><option>Live-out</option></select></label><label className="field-label">Location<input required value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} /></label><label className="field-label">Salary or daily pay<input required value={jobForm.pay} onChange={(event) => setJobForm({ ...jobForm, pay: event.target.value })} placeholder="e.g. ETB 7,500 / month" /></label></div><button className="mt-6 rounded-full bg-[#193f34] px-5 py-3 text-sm font-bold text-white">Publish job post</button>{postedJobs.length > 0 && <div className="mt-6 border-t border-[#e2e5dc] pt-4"><p className="text-xs font-bold uppercase tracking-wider text-[#718078]">Your active posts</p>{postedJobs.map((title) => <p key={title} className="mt-2 rounded-lg bg-[#f6f4ef] px-3 py-2 text-sm font-semibold text-[#193f34]">{title} · Active</p>)}</div>}</form>}
            {employerTab === "applicants" && <div><p className="text-sm font-semibold text-[#b45d3c]">APPLICANT REVIEW</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Meet verified workers.</h3><div className="mt-6 space-y-3">{[{ name: "Abeba Mekonnen", skill: "Childcare", location: "Bole", experience: "4 years", rating: "4.9" }, { name: "Selamawit Kassa", skill: "Cooking", location: "Kazanchis", experience: "6 years", rating: "4.8" }].map((worker) => <div key={worker.name} className="rounded-xl bg-[#f6f4ef] p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[#193f34]">{worker.name} <span className="ml-1 text-[#42705c]">✓</span></p><p className="mt-1 text-xs text-[#718078]">{worker.skill} · {worker.experience} · {worker.location}</p></div><span className="text-sm font-bold text-[#b87843]">★ {worker.rating}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => toggleShortlist(worker.name)} className="rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">{shortlisted.includes(worker.name) ? "Shortlisted" : "Shortlist"}</button><button onClick={() => setEmployerMessage(true)} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{employerMessage ? "Message sent" : "Chat"}</button><button onClick={() => setInterviewScheduled(true)} className="rounded-full border border-[#d7ded4] px-4 py-2 text-xs font-bold text-[#193f34]">{interviewScheduled ? "Interview set" : "Schedule interview"}</button><button onClick={() => hireWorker(worker.name)} className="rounded-full bg-[#d97952] px-4 py-2 text-xs font-bold text-white disabled:bg-[#b8c8bb]" disabled={!commissionConfirmed || hired.includes(worker.name)}>{hired.includes(worker.name) ? "Hired" : "Hire worker"}</button></div></div>)}</div><div className="mt-5 rounded-xl border border-[#e8c4b2] bg-[#fff7f2] p-4"><label className="flex gap-3 text-xs leading-5 text-[#754c3d]"><input type="checkbox" checked={commissionConfirmed} onChange={(event) => setCommissionConfirmed(event.target.checked)} className="mt-1" />I understand HomeLink charges a transparent commission to the household only after a successful hire. Workers pay no placement or application fees.</label></div></div>}
            {employerTab === "history" && <div><p className="text-sm font-semibold text-[#b45d3c]">HIRING HISTORY</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Your past placements.</h3>{hired.length ? <div className="mt-6 space-y-3">{hired.map((name) => <div key={name} className="flex items-center justify-between rounded-xl bg-[#eaf0e8] p-4"><div><p className="text-sm font-bold text-[#193f34]">{name}</p><p className="mt-1 text-xs text-[#718078]">Hired through HomeLink · Addis Ababa</p></div><span className="text-xs font-bold text-[#42705c]">Completed</span></div>)}</div> : <p className="mt-6 rounded-xl bg-[#f6f4ef] p-5 text-sm text-[#718078]">Completed hires will appear here.</p>}</div>}
          </div>
        </div>
      </section>}

      {role === "broker" && isSignedIn && <section id="broker-space" className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold text-[#b45d3c]">DELALA / BROKER WORKSPACE</p><h2 className="font-serif text-4xl font-bold text-[#193f34]">Run placements professionally.</h2><p className="mt-3 max-w-2xl text-[#718078]">Manage your worker portfolio, coordinate households, track placements, and keep every commission record transparent.</p></div><div className="rounded-xl bg-[#fff4df] px-4 py-3 text-sm font-semibold text-[#8b5a27]">Legal business licence required</div></div>
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><aside className="rounded-2xl bg-[#193f34] p-5 text-white shadow-lg"><div className="flex items-center gap-4 border-b border-white/15 pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d6a35d] text-lg font-bold">{broker.businessName ? broker.businessName.slice(0, 2).toUpperCase() : "DB"}</div><div><p className="font-bold">{broker.businessName || "Broker profile"}</p><p className="mt-1 text-xs text-[#b5cabc]">{brokerSaved ? "✓ Licence submitted" : "Licence verification required"}</p></div></div><div className="mt-6 space-y-1"><button onClick={() => setBrokerTab("overview")} className={`workspace-nav ${brokerTab === "overview" ? "selected" : ""}`}>▦ Overview <span>4</span></button><button onClick={() => setBrokerTab("business")} className={`workspace-nav ${brokerTab === "business" ? "selected" : ""}`}>◎ Business licence</button><button onClick={() => setBrokerTab("workers")} className={`workspace-nav ${brokerTab === "workers" ? "selected" : ""}`}>♙ Worker portfolio <span>24</span></button><button onClick={() => setBrokerTab("employers")} className={`workspace-nav ${brokerTab === "employers" ? "selected" : ""}`}>⌂ Employers <span>8</span></button><button onClick={() => setBrokerTab("placements")} className={`workspace-nav ${brokerTab === "placements" ? "selected" : ""}`}>↔ Placements <span>{brokerPlacement.length}</span></button><button onClick={() => setBrokerTab("commissions")} className={`workspace-nav ${brokerTab === "commissions" ? "selected" : ""}`}>◆ Commission records</button></div></aside><div className="rounded-2xl border border-[#dfe3d9] bg-white p-6 shadow-[0_14px_40px_rgba(45,67,52,.06)]">
          {brokerTab === "overview" && <div><p className="text-sm font-semibold text-[#b45d3c]">BROKER DASHBOARD</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Your placement desk.</h3><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="stat-card"><span>Active workers</span><strong>24</strong></div><div className="stat-card"><span>Open placements</span><strong>4</strong></div><div className="stat-card"><span>This month</span><strong>ETB 18k</strong></div></div><div className="mt-7 rounded-xl bg-[#fff7f2] p-4"><p className="text-sm font-bold text-[#193f34]">Verify your legal business licence</p><p className="mt-1 text-xs leading-5 text-[#718078]">Only licensed brokers can manage placements. A verified licence builds trust with workers and households.</p><button onClick={() => setBrokerTab("business")} className="mt-4 rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white">Submit licence</button></div></div>}
          {brokerTab === "business" && <form onSubmit={saveBroker}><p className="text-sm font-semibold text-[#b45d3c]">LEGAL BUSINESS VERIFICATION</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Register your broker business.</h3><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label">Business name<input required value={broker.businessName} onChange={(event) => setBroker({ ...broker, businessName: event.target.value })} placeholder="e.g. Abebe Placement Services" /></label><label className="field-label">Owner or manager name<input required value={broker.ownerName} onChange={(event) => setBroker({ ...broker, ownerName: event.target.value })} placeholder="Full legal name" /></label><label className="field-label">Phone number<input required value={broker.phone} onChange={(event) => setBroker({ ...broker, phone: event.target.value })} placeholder="+251 9XX XXX XXX" /></label><label className="field-label">Business address<input required value={broker.address} onChange={(event) => setBroker({ ...broker, address: event.target.value })} /></label><label className="field-label">Licence number<input required value={broker.licenseNumber} onChange={(event) => setBroker({ ...broker, licenseNumber: event.target.value })} placeholder="Licence number" /></label><label className="field-label">Legal business licence / የንግድ ፈቃድ<input required type="file" accept="image/*,.pdf" className="file-input" /></label></div><button className="mt-6 rounded-full bg-[#193f34] px-5 py-3 text-sm font-bold text-white">Submit for review</button></form>}
          {brokerTab === "workers" && <div><p className="text-sm font-semibold text-[#b45d3c]">WORKER PORTFOLIO</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Your managed workers.</h3><div className="mt-6 space-y-3">{[{ name: "Abeba Mekonnen", skill: "Childcare", status: "Available", rating: "4.9" }, { name: "Selamawit Kassa", skill: "Cooking", status: "Placed", rating: "4.8" }, { name: "Nuru Hailu", skill: "Cleaning", status: "Available", rating: "4.6" }].map((worker) => <div key={worker.name} className="flex items-center justify-between rounded-xl bg-[#f6f4ef] p-4"><div><p className="text-sm font-bold text-[#193f34]">{worker.name} <span className="text-[#42705c]">✓</span></p><p className="mt-1 text-xs text-[#718078]">{worker.skill} · ★ {worker.rating}</p></div><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-bold text-[#42705c]">{worker.status}</span></div>)}</div><div className="mt-6 rounded-xl border border-[#dfe3d9] p-4"><p className="text-sm font-bold text-[#193f34]">Ratings & performance history</p><p className="mt-1 text-xs leading-5 text-[#718078]">Average portfolio rating: ★ 4.8 · 18 successful placements · 92% employer satisfaction.</p><div className="mt-3 flex gap-2"><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-bold text-[#42705c]">Reliable</span><span className="rounded-full bg-[#f0e6d9] px-3 py-1 text-xs font-bold text-[#9b6045]">Highly rated</span></div></div></div>}
          {brokerTab === "employers" && <div><p className="text-sm font-semibold text-[#b45d3c]">EMPLOYER NETWORK</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Households you support.</h3><div className="mt-6 space-y-3">{["Mekdes household", "Bekele family", "Selam home"].map((name) => <div key={name} className="flex items-center justify-between rounded-xl bg-[#f6f4ef] p-4"><div><p className="text-sm font-bold text-[#193f34]">{name}</p><p className="mt-1 text-xs text-[#718078]">Addis Ababa · Verified employer</p></div><button onClick={() => setBrokerTab("placements")} className="rounded-full border border-[#d7ded4] px-3 py-2 text-xs font-bold text-[#193f34]">View placements</button></div>)}</div></div>}
          {brokerTab === "placements" && <div><p className="text-sm font-semibold text-[#b45d3c]">PLACEMENT TRACKING</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Keep every placement visible.</h3><div className="mt-6 space-y-3">{["Abeba Mekonnen · Mekdes household", "Selamawit Kassa · Bekele family"].map((placement) => <div key={placement} className="flex items-center justify-between rounded-xl bg-[#f6f4ef] p-4"><div><p className="text-sm font-bold text-[#193f34]">{placement}</p><p className="mt-1 text-xs text-[#718078]">Interview complete · Placement in progress</p></div><button onClick={() => trackPlacement(placement)} className="rounded-full bg-[#193f34] px-3 py-2 text-xs font-bold text-white">{brokerPlacement.includes(placement) ? "Tracked" : "Track placement"}</button></div>)}</div></div>}
          {brokerTab === "commissions" && <div><p className="text-sm font-semibold text-[#b45d3c]">COMMISSION RECORDS</p><h3 className="mt-1 font-serif text-3xl font-bold text-[#193f34]">Transparent earnings.</h3><p className="mt-3 text-sm leading-6 text-[#718078]">Record commissions only after a successful household hire. Workers never pay placement fees.</p><div className="mt-6 rounded-xl bg-[#eaf0e8] p-5"><div className="flex items-center justify-between"><span className="text-sm text-[#718078]">May 2024 · Bekele family</span><strong className="font-serif text-2xl text-[#193f34]">ETB 4,500</strong></div><p className="mt-2 text-xs text-[#42705c]">Household-paid · Completed placement</p></div></div>}
        </div></div>
      </section>}

      <section id="trust" className="mx-auto grid max-w-[1320px] gap-8 px-6 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24"><div><p className="mb-3 text-sm font-semibold text-[#b45d3c]">{t.built}</p><h2 className="max-w-md font-serif text-4xl font-bold leading-tight text-[#193f34]">{t.trustTitle}</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#6e7a72]">{t.noFee}</p></div><div className="grid gap-4 sm:grid-cols-3"><div className="border-t-2 border-[#d97952] pt-4"><span className="text-2xl">◉</span><h3 className="mt-5 font-bold">{t.verified}</h3><p className="mt-2 text-sm leading-6 text-[#6e7a72]">{t.verifiedBody}</p></div><div className="border-t-2 border-[#d97952] pt-4"><span className="text-2xl">↔</span><h3 className="mt-5 font-bold">{t.clear}</h3><p className="mt-2 text-sm leading-6 text-[#6e7a72]">{t.clearBody}</p></div><div className="border-t-2 border-[#d97952] pt-4"><span className="text-2xl">♡</span><h3 className="mt-5 font-bold">{t.support}</h3><p className="mt-2 text-sm leading-6 text-[#6e7a72]">{t.supportBody}</p></div></div></section>

      <footer id="stories" className="border-t border-[#dedfd7] bg-[#edf1e9] px-6 pb-8 pt-14 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 border-b border-[#d4dbd1] pb-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3"><div className="brand-mark">H</div><span className="font-serif text-xl font-bold tracking-tight text-[#193f34]">HomeLink</span></div>
              <p className="mt-5 max-w-xs text-sm leading-6 text-[#65736b]">{t.footer}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[.16em] text-[#b45d3c]">Addis Ababa · Ethiopia</p>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#193f34]">{language === "am" ? "መድረኩ" : "Platform"}</h2>
              <div className="mt-4 space-y-3 text-sm text-[#65736b]"><a className="block transition hover:text-[#b45d3c]" href="#jobs">{t.navWork}</a><a className="block transition hover:text-[#b45d3c]" href="#trust">{t.navHow}</a><a className="block transition hover:text-[#b45d3c]" href="#stories">{t.navStories}</a></div>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#193f34]">{language === "am" ? "ይጀምሩ" : "Get started"}</h2>
              <div className="mt-4 space-y-3 text-sm text-[#65736b]"><button className="block text-left transition hover:text-[#b45d3c]" onClick={() => { setRole("worker"); openAuth("signup"); }}>{t.worker}</button><button className="block text-left transition hover:text-[#b45d3c]" onClick={() => { setRole("household"); openAuth("signup"); }}>{t.household}</button><button className="block text-left transition hover:text-[#b45d3c]" onClick={() => { setRole("broker"); openAuth("signup"); }}>{language === "am" ? "ደላላ ይሁኑ" : "Join as a broker"}</button></div>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#193f34]">{language === "am" ? "እንገናኝ" : "Stay connected"}</h2>
              <p className="mt-4 text-sm leading-6 text-[#65736b]">{language === "am" ? "ለጥያቄዎች እና ድጋፍ እዚህ ነን።" : "We are here for questions, support, and better work."}</p>
              <a className="mt-4 inline-block text-sm font-bold text-[#193f34] transition hover:text-[#b45d3c]" href="mailto:hello@homelink.et?subject=HomeLink%20support%20request">hello@homelink.et</a>
              <a className="mt-2 block text-sm text-[#65736b] transition hover:text-[#b45d3c]" href="tel:+251900000000">+251 900 000 000</a>
              <a className="mt-4 inline-flex rounded-full bg-[#193f34] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#28594b]" href="mailto:hello@homelink.et?subject=HomeLink%20support%20request">{language === "am" ? "ድጋፍ ይጠይቁ" : "Contact support"}</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-7 text-xs text-[#718078] sm:flex-row"><span>© 2026 HomeLink</span><span>{language === "am" ? "በክብር የተገነባ ለአዲስ አበባ ማህበረሰብ" : "Built with care for the Addis Ababa community."}</span><span className="flex gap-3"><a className="transition hover:text-[#b45d3c]" href="/privacy">{language === "am" ? "ግላዊነት" : "Privacy"}</a><span>·</span><a className="transition hover:text-[#b45d3c]" href="/terms">{language === "am" ? "ደንብ" : "Terms"}</a></span></div>
        </div>
      </footer>

          {authMode && <div className="fixed inset-0 z-10 grid place-items-center bg-[#193f34]/60 p-4" role="dialog" aria-modal="true" aria-label="HomeLink account access"><div className="relative w-full max-w-md rounded-3xl bg-[#f8f6f0] p-7 shadow-2xl"><button onClick={() => setAuthMode(null)} className="absolute right-5 top-4 text-2xl text-[#718078]" aria-label="Close">×</button>{authStep === "form" ? <><p className="text-sm font-semibold text-[#b45d3c]">HOMELINK ACCOUNT</p><h2 className="mt-2 font-serif text-3xl font-bold text-[#193f34]">{authMode === "signup" ? t.signupTitle : t.loginTitle}</h2><p className="mt-2 text-sm leading-6 text-[#718078]">{authMode === "signup" ? t.signupBody : t.loginBody}</p>{authMode === "signup" && <div className="mt-5 grid grid-cols-3 gap-2"><button onClick={() => setRole("worker")} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${role === "worker" ? "border-[#d97952] bg-[#fff0e9] text-[#a34f35]" : "border-[#dedfd7] text-[#718078]"}`}>{t.workerChoice}<span className="mt-1 block text-xs font-normal">{t.workerDesc}</span></button><button onClick={() => setRole("household")} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${role === "household" ? "border-[#193f34] bg-[#eaf0e8] text-[#193f34]" : "border-[#dedfd7] text-[#718078]"}`}>{t.hiringChoice}<span className="mt-1 block text-xs font-normal">{t.hiringDesc}</span></button><button onClick={() => setRole("broker")} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${role === "broker" ? "border-[#b87843] bg-[#fff4df] text-[#8b5a27]" : "border-[#dedfd7] text-[#718078]"}`}>Delala / Broker<span className="mt-1 block text-xs font-normal">Manage placements</span></button></div>}<p className="mt-4 rounded-xl bg-[#eaf0e8] px-3 py-2 text-xs leading-5 text-[#42705c]">{t.noWorkerFee}</p><form onSubmit={submitAuth} className="mt-5 space-y-3"><label className="block text-sm font-semibold text-[#193f34]">{t.phone}<input required value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="+251 9XX XXX XXX" className="mt-1.5 w-full rounded-xl border border-[#d8dcd3] bg-white px-4 py-3 font-normal outline-none focus:border-[#d97952]" /></label><label className="block text-sm font-semibold text-[#193f34]">{t.password}<input required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 6 characters" className="mt-1.5 w-full rounded-xl border border-[#d8dcd3] bg-white px-4 py-3 font-normal outline-none focus:border-[#d97952]" /></label><button className="w-full rounded-xl bg-[#193f34] py-3.5 text-sm font-bold text-white">{authMode === "signup" ? t.sendCode : t.loginButton}</button></form><button onClick={() => openAuth(authMode === "signup" ? "login" : "signup")} className="mt-5 w-full text-center text-sm text-[#718078]">{authMode === "signup" ? t.already : t.newAccount}</button></> : <><p className="text-sm font-semibold text-[#b45d3c]">{t.verification}</p><h2 className="mt-2 font-serif text-3xl font-bold text-[#193f34]">{t.checkPhone}</h2><p className="mt-2 text-sm leading-6 text-[#718078]">{t.codeBody} {phone || "your phone number"}.</p><form onSubmit={verifyOtp} className="mt-6 space-y-4"><input required minLength={4} maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" placeholder="000000" className="w-full rounded-xl border border-[#d8dcd3] bg-white px-4 py-4 text-center text-2xl tracking-[.4em] outline-none focus:border-[#d97952]" aria-label="Verification code" /><button className="w-full rounded-xl bg-[#193f34] py-3.5 text-sm font-bold text-white">{t.verify}</button></form><button onClick={() => setAuthStep("form")} className="mt-4 w-full text-center text-sm text-[#718078]">{t.different}</button></>}</div></div>}

      {authBusy && <div className="fixed bottom-5 left-5 z-20 rounded-2xl bg-[#193f34] px-5 py-4 text-sm text-white shadow-xl">{w.processing}</div>}
      {authError && <div className="fixed bottom-5 left-5 z-20 max-w-sm rounded-2xl border border-[#e8b7a4] bg-[#fff7f2] px-5 py-4 text-sm text-[#8b4d35] shadow-xl"><p className="font-bold">{w.attention}</p><p className="mt-1">{authError}</p></div>}
      {isSignedIn && <div className="fixed bottom-5 right-5 z-5 max-w-xs rounded-2xl bg-[#193f34] px-5 py-4 text-sm text-white shadow-xl"><p className="font-bold">{t.signedIn}</p><p className="mt-1 text-[#c5d7ca]">{role === "worker" ? t.dashboard : t.hiringDashboard}</p></div>}
    </main>
  );
}

