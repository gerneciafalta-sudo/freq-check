-- Drop the problematic policy
DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can view classroom enrollments" ON public.enrollments;

-- Create security definer function to check if student is enrolled
CREATE OR REPLACE FUNCTION public.is_student_enrolled(_classroom_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments
    WHERE classroom_id = _classroom_id
    AND student_id = _student_id
  )
$$;

-- Create security definer function to check if user is classroom teacher
CREATE OR REPLACE FUNCTION public.is_classroom_teacher(_classroom_id UUID, _teacher_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms
    WHERE id = _classroom_id
    AND teacher_id = _teacher_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Students can view enrolled classrooms"
  ON public.classrooms FOR SELECT
  USING (public.is_student_enrolled(id, auth.uid()));

-- Recreate the teacher policy for viewing enrollments
CREATE POLICY "Teachers can view classroom enrollments"
  ON public.enrollments FOR SELECT
  USING (public.is_classroom_teacher(classroom_id, auth.uid()));