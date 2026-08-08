import { createSupabaseBrowserClient } from "./supabase";

export type JobType = "full_time" | "part_time" | "weekend" | "live_in" | "live_out";

export interface JobInput {
  employerId: string;
  brokerId?: string;
  title: string;
  description?: string;
  skill: string;
  location: string;
  jobType: JobType;
  salary: number;
}

export interface JobRecord extends JobInput {
  id: string;
  createdAt: string;
  isActive: boolean;
}

export interface ProfileInput {
  id: string;
  role: "worker" | "household" | "broker" | "admin";
  fullName: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experienceYears?: number;
  expectedSalary?: number;
  availability?: string;
  experienceDocumentPath?: string;
  guarantorName?: string;
  guarantorDocumentPath?: string;
}

export interface BusinessProfileInput {
  id: string;
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  licenseNumber: string;
  licenseDocumentPath: string;
}

export type VerificationStatus = "pending" | "verified" | "rejected";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export async function listAdminProfiles() {
  const client = getClient();
  return client.from("profiles").select("id, role, full_name, phone, location, verification_status, is_suspended, created_at").order("created_at", { ascending: false });
}

export async function setProfileVerification(profileId: string, verificationStatus: VerificationStatus) {
  const client = getClient();
  return client.from("profiles").update({ verification_status: verificationStatus, updated_at: new Date().toISOString() }).eq("id", profileId);
}

export async function setProfileSuspended(profileId: string, isSuspended: boolean) {
  const client = getClient();
  return client.from("profiles").update({ is_suspended: isSuspended, updated_at: new Date().toISOString() }).eq("id", profileId);
}

export async function listAdminJobs() {
  const client = getClient();
  return client.from("jobs").select("id, title, skill, location, salary, is_active, created_at, employer_id").order("created_at", { ascending: false });
}

export async function setJobActive(jobId: string, isActive: boolean) {
  const client = getClient();
  return client.from("jobs").update({ is_active: isActive }).eq("id", jobId);
}

export async function listAdminReports() {
  const client = getClient();
  return client.from("reports").select("*").order("created_at", { ascending: false });
}

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  const client = getClient();
  return client.from("reports").update({ status, resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null }).eq("id", reportId);
}

export async function listAdminPlacements() {
  const client = getClient();
  return client.from("placements").select("*").order("created_at", { ascending: false });
}

export async function listAdminCommissions() {
  const client = getClient();
  return client.from("commissions").select("*").order("created_at", { ascending: false });
}

function getClient() {
  const client = createSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return client;
}

export async function saveProfile(input: ProfileInput) {
  const client = getClient();
  return client.from("profiles").upsert({
    id: input.id,
    role: input.role,
    full_name: input.fullName,
    phone: input.phone,
    location: input.location,
    skills: input.skills ?? [],
    experience_years: input.experienceYears,
    expected_salary: input.expectedSalary,
    availability: input.availability,
    experience_document_path: input.experienceDocumentPath,
    guarantor_name: input.guarantorName,
    guarantor_document_path: input.guarantorDocumentPath,
    updated_at: new Date().toISOString(),
  });
}

export async function createJob(input: JobInput) {
  const client = getClient();
  return client.from("jobs").insert({
    employer_id: input.employerId,
    broker_id: input.brokerId,
    title: input.title,
    description: input.description ?? "",
    skill: input.skill,
    location: input.location,
    job_type: input.jobType,
    salary: input.salary,
  }).select().single();
}

export async function listJobs(filters?: { skill?: string; location?: string; jobType?: JobType }) {
  const client = getClient();
  let query = client.from("jobs").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (filters?.skill) query = query.eq("skill", filters.skill);
  if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters?.jobType) query = query.eq("job_type", filters.jobType);
  return query;
}

export async function listSavedJobIds(workerId: string) {
  const client = getClient();
  return client.from("saved_jobs").select("job_id").eq("worker_id", workerId);
}

export async function listApplicationJobIds(workerId: string) {
  const client = getClient();
  return client.from("applications").select("job_id").eq("worker_id", workerId);
}

export async function getProfile(userId: string) {
  const client = getClient();
  return client.from("profiles").select("*").eq("id", userId).maybeSingle();
}

export async function applyToJob(jobId: string, workerId: string, coverMessage = "") {
  const client = getClient();
  return client.from("applications").insert({ job_id: jobId, worker_id: workerId, cover_message: coverMessage }).select().single();
}

export async function saveJob(jobId: string, workerId: string) {
  const client = getClient();
  return client.from("saved_jobs").upsert({ job_id: jobId, worker_id: workerId });
}

export async function removeSavedJob(jobId: string, workerId: string) {
  const client = getClient();
  return client.from("saved_jobs").delete().eq("job_id", jobId).eq("worker_id", workerId);
}

export async function saveBusinessProfile(input: BusinessProfileInput) {
  const client = getClient();
  return client.from("business_profiles").upsert({
    id: input.id,
    business_name: input.businessName,
    owner_name: input.ownerName,
    address: input.address,
    phone: input.phone,
    license_number: input.licenseNumber,
    license_document_path: input.licenseDocumentPath,
    verification_status: "pending",
  });
}

export async function updateApplicationStatus(applicationId: string, status: "submitted" | "shortlisted" | "interview" | "hired" | "rejected" | "withdrawn") {
  const client = getClient();
  return client.from("applications").update({ status }).eq("id", applicationId);
}

export async function createMessage(senderId: string, recipientId: string, body: string, applicationId?: string) {
  const client = getClient();
  return client.from("messages").insert({ sender_id: senderId, recipient_id: recipientId, body, application_id: applicationId }).select().single();
}

export async function listMessages(userId: string) {
  const client = getClient();
  return client.from("messages").select("*").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: true });
}

export async function scheduleInterview(applicationId: string, scheduledAt: string, meetingNote = "") {
  const client = getClient();
  return client.from("interviews").insert({ application_id: applicationId, scheduled_at: scheduledAt, meeting_note: meetingNote }).select().single();
}

export async function createReview(authorId: string, subjectId: string, rating: number, comment: string, placementId?: string) {
  const client = getClient();
  return client.from("reviews").insert({ author_id: authorId, subject_id: subjectId, rating, comment, placement_id: placementId }).select().single();
}

export async function listNotifications(userId: string) {
  const client = getClient();
  return client.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const client = getClient();
  return client.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("user_id", userId);
}
