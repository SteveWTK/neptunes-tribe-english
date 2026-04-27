"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  GraduationCap,
  Loader2,
  AlertTriangle,
  BookOpen,
  UserCheck,
  User,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const t = {
  en: {
    loading: "Loading school information...",
    notFound: "School Not Found",
    notFoundDesc: "This school link is not valid or has been deactivated.",
    goHome: "Go to Homepage",
    welcomeDefault: "Welcome to Habitat English!",
    enrollTitle: "Student Enrollment",
    yourName: "Your Full Name",
    yourNamePlaceholder: "Enter your full name",
    selectLevel: "Select Your Level",
    selectLevelPlaceholder: "Choose your course level",
    selectTeacher: "Select Your Teacher",
    selectTeacherPlaceholder: "Choose your teacher",
    optional: "(optional)",
    continueToSignup: "Continue to Create Account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    premiumIncluded: "Premium access included for students!",
    partnerSchool: "Partner School",
  },
  pt: {
    loading: "Carregando informações da escola...",
    notFound: "Escola Não Encontrada",
    notFoundDesc: "Este link da escola não é válido ou foi desativado.",
    goHome: "Ir para a Página Inicial",
    welcomeDefault: "Bem-vindo ao Habitat English!",
    enrollTitle: "Matrícula do Aluno",
    yourName: "Seu Nome Completo",
    yourNamePlaceholder: "Digite seu nome completo",
    selectLevel: "Selecione Seu Nível",
    selectLevelPlaceholder: "Escolha seu nível do curso",
    selectTeacher: "Selecione Seu Professor",
    selectTeacherPlaceholder: "Escolha seu professor",
    optional: "(opcional)",
    continueToSignup: "Continuar para Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    signIn: "Entrar",
    premiumIncluded: "Acesso premium incluído para alunos!",
    partnerSchool: "Escola Parceira",
  },
  th: {
    loading: "กำลังโหลดข้อมูลโรงเรียน...",
    notFound: "ไม่พบโรงเรียน",
    notFoundDesc: "ลิงก์โรงเรียนนี้ไม่ถูกต้องหรือถูกปิดใช้งาน",
    goHome: "ไปที่หน้าแรก",
    welcomeDefault: "ยินดีต้อนรับสู่ Habitat English!",
    enrollTitle: "การลงทะเบียนนักเรียน",
    yourName: "ชื่อเต็มของคุณ",
    yourNamePlaceholder: "กรอกชื่อเต็มของคุณ",
    selectLevel: "เลือกระดับของคุณ",
    selectLevelPlaceholder: "เลือกระดับคอร์ส",
    selectTeacher: "เลือกครูของคุณ",
    selectTeacherPlaceholder: "เลือกครู",
    optional: "(ไม่บังคับ)",
    continueToSignup: "ดำเนินการสร้างบัญชี",
    alreadyHaveAccount: "มีบัญชีแล้ว?",
    signIn: "เข้าสู่ระบบ",
    premiumIncluded: "นักเรียนได้รับสิทธิ์พรีเมียม!",
    partnerSchool: "โรงเรียนพันธมิตร",
  },
};

export default function SchoolEnrollmentPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Language detection - default to Portuguese for Brazil-based schools
  const getBrowserLang = () => {
    if (typeof navigator === "undefined") return "en";
    if (navigator.language?.startsWith("th")) return "th";
    if (navigator.language?.startsWith("pt")) return "pt";
    return "en";
  };

  // Use school's country to determine default language
  const getLanguage = () => {
    // If school is from Brazil, default to Portuguese
    if (school?.country === "Brazil") return "pt";
    // If school is from Thailand, default to Thai
    if (school?.country === "Thailand") return "th";
    // Otherwise use browser language
    return getBrowserLang();
  };

  const lang = school ? getLanguage() : getBrowserLang();
  const copy = t[lang] || t.en;

  useEffect(() => {
    if (slug) {
      fetchSchool();
    }
  }, [slug]);

  const fetchSchool = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/schools/by-slug/${slug}`);
      const data = await res.json();

      if (res.ok && data.school) {
        setSchool(data.school);
      } else {
        setError("School not found");
      }
    } catch (err) {
      console.error("Error fetching school:", err);
      setError("Failed to load school");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store enrollment data in sessionStorage for use after signup
      const enrollmentData = {
        school_id: school.id,
        school_slug: school.slug,
        school_name: school.name,
        school_level_id: selectedLevel || null,
        teacher_id: selectedTeacher || null,
        full_name: fullName.trim(),
      };
      sessionStorage.setItem("school_enrollment", JSON.stringify(enrollmentData));

      // If user is already logged in, enroll them directly
      if (session?.user) {
        const res = await fetch("/api/schools/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollmentData),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          // Clear enrollment data and redirect
          sessionStorage.removeItem("school_enrollment");
          router.push("/dashboard?enrolled=true");
          return;
        }
      }

      // Redirect to signup with school context
      router.push(`/login?mode=signup&school=${school.slug}`);
    } catch (err) {
      console.error("Error during enrollment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    // Store enrollment data before redirecting
    if (fullName || selectedLevel || selectedTeacher) {
      const enrollmentData = {
        school_id: school.id,
        school_slug: school.slug,
        school_name: school.name,
        school_level_id: selectedLevel || null,
        teacher_id: selectedTeacher || null,
        full_name: fullName.trim(),
      };
      sessionStorage.setItem("school_enrollment", JSON.stringify(enrollmentData));
    }
    router.push(`/login?school=${school.slug}`);
  };

  // Get welcome message in user's language
  const getWelcomeMessage = () => {
    if (!school) return copy.welcomeDefault;
    const msg =
      lang === "th"
        ? school.welcome_message_th
        : lang === "pt"
          ? school.welcome_message_pt
          : school.welcome_message;
    return msg || copy.welcomeDefault;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200">{copy.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{copy.notFound}</h1>
          <p className="text-red-200 mb-6">{copy.notFoundDesc}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {copy.goHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* School header */}
        <div className="text-center mb-8">
          {school.logo_url ? (
            <img
              src={school.logo_url}
              alt={school.name}
              className="h-16 mx-auto mb-4"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-red-400" />
            </div>
          )}
          <span className="text-xs text-red-400 uppercase tracking-wider font-medium">
            {copy.partnerSchool}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">{school.name}</h1>
          {school.city && (
            <p className="text-blue-300 text-sm mt-1">
              {school.city}, {school.state || school.country}
            </p>
          )}
        </div>

        {/* Enrollment form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center mb-6">
            <p className="text-white text-lg">{getWelcomeMessage()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                {copy.yourName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={copy.yourNamePlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Level selection */}
            {school.levels?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  {copy.selectLevel}
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5rem' }}
                >
                  <option value="" className="bg-gray-800">
                    {copy.selectLevelPlaceholder}
                  </option>
                  {school.levels.map((level) => (
                    <option key={level.id} value={level.id} className="bg-gray-800">
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Teacher selection */}
            {school.teachers?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  <UserCheck className="w-4 h-4 inline mr-1" />
                  {copy.selectTeacher}{" "}
                  <span className="text-blue-400 text-xs">{copy.optional}</span>
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5rem' }}
                >
                  <option value="" className="bg-gray-800">
                    {copy.selectTeacherPlaceholder}
                  </option>
                  {school.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-gray-800">
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Premium badge */}
            <div className="bg-amber-500/20 rounded-xl p-3 text-center">
              <span className="text-amber-200 text-sm">
                ✨ {copy.premiumIncluded}
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || (school.levels?.length > 0 && !selectedLevel)}
              className="w-full px-6 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {copy.continueToSignup}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <span className="text-blue-300 text-sm">{copy.alreadyHaveAccount}</span>{" "}
            <button
              onClick={handleSignIn}
              className="text-white hover:text-blue-200 font-medium text-sm underline"
            >
              {copy.signIn}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-400 text-xs mt-6">
          Powered by Habitat English
        </p>
      </div>
    </div>
  );
}
