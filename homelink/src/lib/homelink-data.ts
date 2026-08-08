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

export async function applyToJob(jobId: string, workerId: string, coverMessage = "") {
  const client = getClient();
  return client.from("applications").insert({ job_id: jobId, worker_id: workerId, cover_message: coverMessage }).select().single();
}

export async function saveJob(jobId: string, workerId: string) {
  const client = getClient();
  return client.from("saved_jobs").upsert({ job_id: jobId, worker_id: workerId });
}

export async function createMessage(senderId: string, recipientId: string, body: string, applicationId?: string) {
  const client = getClient();
  return client.from("messages").insert({ sender_id: senderId, recipient_id: recipientId, body, application_id: applicationId }).select().single();
}

export async function scheduleInterview(applicationId: string, scheduledAt: string, meetingNote = "") {
  const client = getClient();
  return client.from("interviews").insert({ application_id: applicationId, scheduled_at: scheduledAt, meeting_note: meetingNote }).select().single();
}
