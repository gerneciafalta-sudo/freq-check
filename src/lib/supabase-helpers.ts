// @ts-nocheck
// Temporary helpers until Supabase types are regenerated
import { supabase } from "@/integrations/supabase/client";

export const getProfile = (id: string) =>
  supabase.from("profiles").select("*").eq("id", id).single();

export const getProfiles = () =>
  supabase.from("profiles").select("*");

export const insertProfile = (data: any) =>
  supabase.from("profiles").insert(data);

export const getClassrooms = () =>
  supabase.from("classrooms").select("*");

export const getClassroomByCode = (code: string) =>
  supabase.from("classrooms").select("id").eq("code", code).single();

export const insertClassroom = (data: any) =>
  supabase.from("classrooms").insert(data);

export const getEnrollments = () =>
  supabase.from("enrollments").select(`
    id,
    classroom:classrooms (
      id,
      name,
      code,
      period,
      schedule,
      max_absences,
      total_classes
    )
  `);

export const insertEnrollment = (data: any) =>
  supabase.from("enrollments").insert(data);