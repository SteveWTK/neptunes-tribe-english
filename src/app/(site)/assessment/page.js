"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Volume2,
  Crown,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Loader,
} from "lucide-react";

export default function AssessmentPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Assessment states
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");

  // Recording refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const t = {
    en: {
      title: "Find Your Perfect Tribe Level",
      subtitle:
        "Quick English assessment to recommend your ideal learning tier",
      introTitle: "Let's Find Your Perfect Fit",
      introDesc:
        "Our conversation classes work best when everyone is at a similar English level. This quick assessment helps us recommend the right tier for you.",
      introPrompt:
        "You'll read a short text about environmental conservation. Don't worry about being perfect - we want to hear your natural speaking level!",
      emailLabel: "Your email address",
      emailPlaceholder: "Enter your email to get started",
      startAssessment: "Start Assessment",
      recordingTitle: "Record Yourself",
      recordingDesc:
        "Introduce yourself and talk about your interest in the environment, or read this text naturally at your own pace. Take your time!",
      readingText:
        "Marine protected areas are essential for ocean conservation. These underwater sanctuaries provide safe spaces where fish populations can recover and coral reefs can flourish. Scientists have discovered that well-managed marine reserves not only protect biodiversity but also benefit local fishing communities through improved fish stocks in surrounding waters.",
      recordingInstructions: "Tips for best results:",
      tip1: "Find a quiet space",
      tip2: "Speak clearly and naturally",
      tip3: "Don't rush - take your time",
      tip4: "It's okay to pause between sentences",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      playRecording: "Play Recording",
      pauseRecording: "Pause",
      tryAgain: "Try Again",
      submitAssessment: "Submit Assessment",
      recording: "Recording",
      seconds: "seconds",
      resultsTitle: "Your Assessment Results",
      analyzingTitle: "Analyzing Your English...",
      analyzingDesc:
        "Our AI is evaluating your pronunciation, fluency, and comprehension. This takes about 30 seconds.",
      recommendedTier: "Recommended Tier",
      overallScore: "Overall Score",
      pronunciation: "Pronunciation",
      fluency: "Fluency",
      explorerResultTitle: "Explorer - Perfect for You!",
      explorerResultDesc:
        "Start your journey by accessing all our learning units and listening to live conversation classes. When you're ready, you can always upgrade!",
      proResultTitle: "Pro - Ready for Live Classes!",
      proResultDesc:
        "Your English level is perfect for participating in our weekly live conversation classes with other learners from around the world.",
      premiumResultTitle: "Premium - Shape the Journey!",
      premiumResultDesc:
        "Your excellent English skills qualify you for our top tier. Join live classes AND vote on weekly destinations for the entire tribe!",
      signupTitle: "Create Your Neptune's Tribe Account",
      signupDesc:
        "Your assessment is complete! Create your account to start your eco-journey.",
      createAccount: "Create Account & Join Tribe",
      orSignInGoogle: "Or sign in with Google",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      strengths: "Your Strengths",
      improvements: "Areas to Develop",
      error: "Something went wrong. Please try again.",
      emailRequired: "Please enter your email address",
      invalidEmail: "Please enter a valid email address",
      microphoneError:
        "Could not access microphone. Please check your permissions.",
    },
    pt: {
      title: "Encontre Seu Nível Perfeito na Tribo",
      subtitle:
        "Avaliação rápida de inglês para recomendar seu nível ideal de aprendizado",
      introTitle: "Vamos Encontrar Seu Encaixe Perfeito",
      introDesc:
        "Nossas aulas de conversação funcionam melhor quando todos estão em um nível similar de inglês. Esta avaliação rápida nos ajuda a recomendar o nível certo para você.",
      introPrompt:
        "Você lerá um texto curto sobre conservação ambiental. Não se preocupe em ser perfeito - queremos ouvir seu nível natural de fala!",
      emailLabel: "Seu endereço de email",
      emailPlaceholder: "Digite seu email para começar",
      startAssessment: "Iniciar Avaliação",
      recordingTitle: "Grave-se",
      recordingDesc:
        "Se apresente e fale um pouco sobre você - ou leia este texto naturalmente no seu próprio ritmo. Não tenha pressa!",
      readingText:
        "Marine protected areas are essential for ocean conservation. These underwater sanctuaries provide safe spaces where fish populations can recover and coral reefs can flourish. Scientists have discovered that well-managed marine reserves not only protect biodiversity but also benefit local fishing communities through improved fish stocks in surrounding waters.",
      recordingInstructions: "Dicas para melhores resultados:",
      tip1: "Encontre um local silencioso",
      tip2: "Fale claramente e naturalmente",
      tip3: "Não tenha pressa - vá no seu tempo",
      tip4: "Pode pausar entre as frases",
      startRecording: "Começar Gravação",
      stopRecording: "Parar Gravação",
      playRecording: "Reproduzir Gravação",
      pauseRecording: "Pausar",
      tryAgain: "Tentar Novamente",
      submitAssessment: "Enviar Avaliação",
      recording: "Gravando",
      seconds: "segundos",
      resultsTitle: "Seus Resultados da Avaliação",
      analyzingTitle: "Analisando Seu Inglês...",
      analyzingDesc:
        "Nossa IA está avaliando sua pronúncia, fluência e compreensão. Isso leva cerca de 30 segundos.",
      recommendedTier: "Nível Recomendado",
      overallScore: "Pontuação Geral",
      pronunciation: "Pronúncia",
      fluency: "Fluência",
      explorerResultTitle: "Explorer - Perfeito para Você!",
      explorerResultDesc:
        "Comece sua jornada acessando todas nossas unidades de aprendizado e ouvindo aulas de conversação ao vivo. Quando estiver pronto, sempre pode fazer upgrade!",
      proResultTitle: "Pro - Pronto para Aulas ao Vivo!",
      proResultDesc:
        "Seu nível de inglês é perfeito para participar de nossas aulas semanais de conversação ao vivo com outros estudantes do mundo todo.",
      premiumResultTitle: "Premium - Molde a Jornada!",
      premiumResultDesc:
        "Suas excelentes habilidades em inglês te qualificam para nosso nível mais alto. Participe de aulas ao vivo E vote nos destinos semanais para toda a tribo!",
      signupTitle: "Crie Sua Conta Neptune's Tribe",
      signupDesc:
        "Sua avaliação está completa! Crie sua conta para começar sua jornada ecológica.",
      createAccount: "Criar Conta & Entrar na Tribo",
      orSignInGoogle: "Ou entre com Google",
      alreadyHaveAccount: "Já tem uma conta?",
      signIn: "Entrar",
      strengths: "Seus Pontos Fortes",
      improvements: "Áreas para Desenvolver",
      error: "Algo deu errado. Tente novamente.",
      emailRequired: "Por favor digite seu endereço de email",
      invalidEmail: "Por favor digite um email válido",
      microphoneError:
        "Não foi possível acessar o microfone. Verifique suas permissões.",
    },
    th: {
      title: "ค้นหาระดับที่เหมาะกับคุณที่สุด",
      subtitle:
        "การประเมินภาษาอังกฤษอย่างรวดเร็วเพื่อแนะนำระดับการเรียนรู้ที่เหมาะสม",
      introTitle: "มาหาระดับที่เหมาะกับคุณกันเถอะ",
      introDesc:
        "ชั้นเรียนสนทนาของเราจะได้ผลดีที่สุดเมื่อทุกคนมีระดับภาษาอังกฤษใกล้เคียงกัน การประเมินอย่างรวดเร็วนี้ช่วยให้เราแนะนำระดับที่เหมาะสมสำหรับคุณ",
      introPrompt:
        "คุณจะอ่านข้อความสั้นๆ เกี่ยวกับการอนุรักษ์สิ่งแวดล้อม ไม่ต้องกังวลเรื่องความสมบูรณ์แบบ - เราต้องการฟังระดับการพูดตามธรรมชาติของคุณ!",
      emailLabel: "ที่อยู่อีเมลของคุณ",
      emailPlaceholder: "กรอกอีเมลของคุณเพื่อเริ่มต้น",
      startAssessment: "เริ่มการประเมิน",
      recordingTitle: "บันทึกเสียงของคุณ",
      recordingDesc:
        "แนะนำตัวเองและพูดเกี่ยวกับความสนใจในสิ่งแวดล้อมของคุณ หรืออ่านข้อความนี้อย่างเป็นธรรมชาติตามจังหวะของคุณเอง ค่อยๆ ทำไม่ต้องรีบ!",
      readingText:
        "Marine protected areas are essential for ocean conservation. These underwater sanctuaries provide safe spaces where fish populations can recover and coral reefs can flourish. Scientists have discovered that well-managed marine reserves not only protect biodiversity but also benefit local fishing communities through improved fish stocks in surrounding waters.",
      recordingInstructions: "เคล็ดลับเพื่อผลลัพธ์ที่ดีที่สุด:",
      tip1: "หาสถานที่เงียบๆ",
      tip2: "พูดชัดเจนและเป็นธรรมชาติ",
      tip3: "ไม่ต้องรีบ - ค่อยๆ ทำ",
      tip4: "หยุดพักระหว่างประโยคได้",
      startRecording: "เริ่มบันทึกเสียง",
      stopRecording: "หยุดบันทึกเสียง",
      playRecording: "เล่นเสียงที่บันทึก",
      pauseRecording: "หยุดชั่วคราว",
      tryAgain: "ลองอีกครั้ง",
      submitAssessment: "ส่งการประเมิน",
      recording: "กำลังบันทึก",
      seconds: "วินาที",
      resultsTitle: "ผลการประเมินของคุณ",
      analyzingTitle: "กำลังวิเคราะห์ภาษาอังกฤษของคุณ...",
      analyzingDesc:
        "AI ของเรากำลังประเมินการออกเสียง ความคล่องแคล่ว และความเข้าใจของคุณ ใช้เวลาประมาณ 30 วินาที",
      recommendedTier: "ระดับที่แนะนำ",
      overallScore: "คะแนนรวม",
      pronunciation: "การออกเสียง",
      fluency: "ความคล่องแคล่ว",
      explorerResultTitle: "Explorer - เหมาะสำหรับคุณ!",
      explorerResultDesc:
        "เริ่มต้นการเดินทางของคุณด้วยการเข้าถึงบทเรียนทั้งหมดและฟังชั้นเรียนสนทนาสด เมื่อคุณพร้อม คุณสามารถอัปเกรดได้ตลอดเวลา!",
      proResultTitle: "Pro - พร้อมสำหรับชั้นเรียนสด!",
      proResultDesc:
        "ระดับภาษาอังกฤษของคุณเหมาะสำหรับการเข้าร่วมชั้นเรียนสนทนาสดประจำสัปดาห์กับผู้เรียนคนอื่นๆ จากทั่วโลก",
      premiumResultTitle: "Premium - กำหนดทิศทางการเดินทาง!",
      premiumResultDesc:
        "ทักษะภาษาอังกฤษที่ยอดเยี่ยมของคุณทำให้คุณมีสิทธิ์เข้าถึงระดับสูงสุดของเรา เข้าร่วมชั้นเรียนสดและโหวตจุดหมายปลายทางประจำสัปดาห์สำหรับทั้งกลุ่ม!",
      signupTitle: "สร้างบัญชี Neptune's Tribe ของคุณ",
      signupDesc:
        "การประเมินของคุณเสร็จสมบูรณ์แล้ว! สร้างบัญชีเพื่อเริ่มต้นการเดินทางเชิงนิเวศของคุณ",
      createAccount: "สร้างบัญชีและเข้าร่วมกลุ่ม",
      orSignInGoogle: "หรือเข้าสู่ระบบด้วย Google",
      alreadyHaveAccount: "มีบัญชีอยู่แล้ว?",
      signIn: "เข้าสู่ระบบ",
      strengths: "จุดแข็งของคุณ",
      improvements: "ด้านที่ควรพัฒนา",
      error: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
      emailRequired: "กรุณากรอกที่อยู่อีเมลของคุณ",
      invalidEmail: "กรุณากรอกที่อยู่อีเมลที่ถูกต้อง",
      microphoneError:
        "ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการอนุญาตของคุณ",
    },
  };

  const copy = t[lang];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError(copy.microphoneError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setError("");
  };

  const submitAssessment = async () => {
    if (!audioBlob || !email) return;

    setLoading(true);
    setStep(3); // Move to analyzing step

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "assessment.wav");
      formData.append("email", email);
      formData.append("expectedText", copy.readingText);
      formData.append("language", lang);
      formData.append("type", "assessment");

      const response = await fetch("/api/assessment", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Assessment failed");
      }

      setAssessment(result);
      setTimeout(() => setStep(4), 2000);
    } catch (error) {
      console.error("Assessment failed:", error);
      setError(copy.error);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email) {
      setError(copy.emailRequired);
      return;
    }
    if (!validateEmail(email)) {
      setError(copy.invalidEmail);
      return;
    }
    setError("");
    setStep(2);
  };

  const getTierInfo = (recommendedTier) => {
    const tierInfo = {
      explorer: {
        title: copy.explorerResultTitle,
        desc: copy.explorerResultDesc,
        icon: <BookOpen className="w-8 h-8" />,
        bgColor: "bg-blue-100 dark:bg-blue-900",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-600",
        gradientClasses: "from-blue-600 to-blue-700",
        features: [
          lang === "th"
            ? "เข้าถึงบทเรียนทั้งหมด"
            : lang === "en"
              ? "Access all learning units"
              : "Acesso a todas as unidades",
          lang === "th"
            ? "ฟังคลาสสด"
            : lang === "en"
              ? "Listen to live classes"
              : "Ouça aulas ao vivo",
          lang === "th"
            ? "ติดตามความก้าวหน้าของคุณ"
            : lang === "en"
              ? "Track your progress"
              : "Acompanhe seu progresso",
        ],
      },
      pro: {
        title: copy.proResultTitle,
        desc: copy.proResultDesc,
        icon: <MessageCircle className="w-8 h-8" />,
        bgColor: "bg-green-100 dark:bg-green-900",
        textColor: "text-green-600 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-600",
        gradientClasses: "from-green-600 to-green-700",
        features: [
          lang === "th"
            ? "เข้าร่วมคลาสสนทนาสด"
            : lang === "en"
              ? "Join live conversation classes"
              : "Participe de aulas de conversação",
          lang === "th"
            ? "ติดตามความก้าวหน้าขั้นสูง"
            : lang === "en"
              ? "Advanced progress tracking"
              : "Acompanhamento avançado",
          lang === "th"
            ? "การสนับสนุนแบบเร่งด่วน"
            : lang === "en"
              ? "Priority support"
              : "Suporte prioritário",
        ],
      },
      premium: {
        title: copy.premiumResultTitle,
        desc: copy.premiumResultDesc,
        icon: <Crown className="w-8 h-8" />,
        bgColor: "bg-purple-100 dark:bg-purple-900",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-300 dark:border-purple-600",
        gradientClasses: "from-purple-600 to-purple-700",
        features: [
          lang === "th"
            ? "โหวตเลือกจุดหมายประจำสัปดาห์"
            : lang === "en"
              ? "Vote on weekly destinations"
              : "Vote nos destinos semanais",
          lang === "th"
            ? "เข้าร่วมพอดแคสต์พิเศษ"
            : lang === "en"
              ? "Join special podcasts"
              : "Participe de podcasts especiais",
          lang === "th"
            ? "เข้าถึงเนื้อหา Premium"
            : lang === "en"
              ? "Premium content access"
              : "Acesso a conteúdo premium",
        ],
      },
    };
    return tierInfo[recommendedTier] || tierInfo.explorer;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/units");
    }
  }, [status, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Step 1: Introduction & Email Collection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {copy.subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{copy.introTitle}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {copy.introDesc}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  {copy.introPrompt}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {copy.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <Button
                onClick={handleEmailSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-4 text-lg font-semibold"
              >
                {copy.startAssessment}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Recording
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{copy.recordingTitle}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {copy.recordingDesc}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Reading Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {lang === "th"
                  ? "อ่านข้อความนี้:"
                  : lang === "pt"
                    ? "Leia Este Texto:"
                    : "Read This Text:"}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed">{copy.readingText}</p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">
                  {copy.recordingInstructions}
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {[copy.tip1, copy.tip2, copy.tip3, copy.tip4].map(
                    (tip, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {tip}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-center">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </p>
                  </div>
                )}

                {!audioBlob && (
                  <div>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white shadow-lg`}
                    >
                      {isRecording ? (
                        <MicOff className="w-12 h-12" />
                      ) : (
                        <Mic className="w-12 h-12" />
                      )}
                    </button>

                    <p className="text-lg font-medium mb-2">
                      {isRecording
                        ? `${copy.recording}... ${recordingTime} ${copy.seconds}`
                        : copy.startRecording}
                    </p>

                    {isRecording && (
                      <div className="mt-4">
                        <div className="w-48 h-3 bg-gray-200 rounded-full mx-auto">
                          <div
                            className="h-3 bg-red-500 rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min(
                                (recordingTime / 60) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {lang === "th"
                            ? "สูงสุด 60 วินาที"
                            : lang === "pt"
                              ? "Máximo 60 segundos"
                              : "Maximum 60 seconds"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {audioBlob && (
                  <div>
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <div className="flex justify-center space-x-3 mb-6">
                      <button
                        onClick={playRecording}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                        <span>
                          {isPlaying ? copy.pauseRecording : copy.playRecording}
                        </span>
                      </button>

                      <button
                        onClick={resetRecording}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{copy.tryAgain}</span>
                      </button>
                    </div>

                    <Button
                      onClick={submitAssessment}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
                    >
                      {loading ? "Submitting..." : copy.submitAssessment}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Analyzing
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Loader className="w-16 h-16 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{copy.analyzingTitle}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {copy.analyzingDesc}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Results & Signup
  if (step === 4 && assessment) {
    const tierInfo = getTierInfo(assessment.recommendedTier);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{copy.resultsTitle}</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Assessment Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div
                  className={`w-20 h-20 ${tierInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <div className={tierInfo.textColor}>{tierInfo.icon}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {copy.recommendedTier}
                </h2>
                <h3 className="text-3xl font-bold text-green-600">
                  {tierInfo.title.split(" - ")[0]}
                </h3>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      assessment.scores?.overall >= 80
                        ? "text-green-500"
                        : assessment.scores?.overall >= 60
                        ? "text-yellow-500"
                        : "text-orange-500"
                    }`}
                  >
                    {assessment.scores?.overall || 75}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {copy.overallScore}
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      assessment.scores?.pronunciation >= 80
                        ? "text-green-500"
                        : assessment.scores?.pronunciation >= 60
                        ? "text-yellow-500"
                        : "text-orange-500"
                    }`}
                  >
                    {assessment.scores?.pronunciation || 73}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {copy.pronunciation}
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              {assessment.feedback?.strengths && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {copy.strengths}
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {assessment.feedback.strengths.map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.feedback?.improvements && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {copy.improvements}
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {assessment.feedback.improvements.map((improvement, i) => (
                      <li key={i}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tier Recommendation & Signup */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div
                className={`border-2 ${tierInfo.borderColor} rounded-xl p-6 mb-8`}
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 ${tierInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <div className={tierInfo.textColor}>{tierInfo.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tierInfo.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {tierInfo.desc}
                  </p>
                </div>

                <ul className="space-y-3">
                  {tierInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${tierInfo.textColor} flex-shrink-0`}
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Creation */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">{copy.signupTitle}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {copy.signupDesc}
                </p>

                <Button
                  onClick={() =>
                    router.push(
                      `/pricing?recommended=${
                        assessment.recommendedTier
                      }&email=${encodeURIComponent(email)}`
                    )
                  }
                  className={`w-full bg-gradient-to-r ${tierInfo.gradientClasses} text-white py-4 text-lg font-semibold`}
                >
                  {copy.createAccount}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="text-center">
                  <span className="text-gray-500">{copy.orSignInGoogle}</span>
                </div>

                <Button
                  onClick={() =>
                    signIn("google", {
                      callbackUrl: `/pricing?recommended=${
                        assessment.recommendedTier
                      }&email=${encodeURIComponent(email)}`,
                    })
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 bg-white dark:bg-gray-800"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center text-sm text-gray-500">
                  {copy.alreadyHaveAccount}{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {copy.signIn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// // app/(site)/assessment/page.js
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import { Button } from "@/components/ui/button";
// import {
//   Mic,
//   MicOff,
//   Play,
//   Pause,
//   RotateCcw,
//   CheckCircle,
//   AlertCircle,
//   Volume2,
//   Users,
//   Crown,
//   BookOpen,
//   MessageCircle,
//   ArrowRight,
//   Loader,
// } from "lucide-react";

// export default function AssessmentPage() {
//   const { lang } = useLanguage();
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   // Assessment states
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [audioUrl, setAudioUrl] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [assessment, setAssessment] = useState(null);
//   const [error, setError] = useState("");

//   // Recording refs
//   const mediaRecorderRef = useRef(null);
//   const streamRef = useRef(null);
//   const intervalRef = useRef(null);
//   const audioRef = useRef(null);

//   const t = {
//     en: {
//       title: "Find Your Perfect Tribe Level",
//       subtitle: "Quick English assessment to recommend your ideal learning tier",
//       introTitle: "Let's Find Your Perfect Fit",
//       introDesc: "Our conversation classes work best when everyone is at a similar English level. This quick assessment helps us recommend the right tier for you.",
//       introPrompt: "You'll read a short text about environmental conservation. Don't worry about being perfect - we want to hear your natural speaking level!",
//       emailLabel: "Your email address",
//       emailPlaceholder: "Enter your email to get started",
//       startAssessment: "Start Assessment",
//       recordingTitle: "Record Yourself Reading This Text",
//       recordingDesc: "Read this text naturally at your own pace. Take your time!",
//       readingText: "Marine protected areas are essential for ocean conservation. These underwater sanctuaries provide safe spaces where fish populations can recover and coral reefs can flourish. Scientists have discovered that well-managed marine reserves not only protect biodiversity but also benefit local fishing communities through improved fish stocks in surrounding waters.",
//       recordingInstructions: "Tips for best results:",
//       tip1: "Find a quiet space",
//       tip2: "Speak clearly and naturally",
//       tip3: "Don't rush - take your time",
//       tip4: "It's okay to pause between sentences",
//       startRecording: "Start Recording",
//       stopRecording: "Stop Recording",
//       playRecording: "Play Recording",
//       pauseRecording: "Pause",
//       tryAgain: "Try Again",
//       submitAssessment: "Submit Assessment",
//       recording: "Recording",
//       seconds: "seconds",
//       resultsTitle: "Your Assessment Results",
//       analyzingTitle: "Analyzing Your English...",
//       analyzingDesc: "Our AI is evaluating your pronunciation, fluency, and comprehension. This takes about 30 seconds.",
//       recommendedTier: "Recommended Tier",
//       overallScore: "Overall Score",
//       pronunciation: "Pronunciation",
//       fluency: "Fluency",
//       explorerResultTitle: "Explorer - Perfect for You!",
//       explorerResultDesc: "Start your journey by accessing all our learning units and listening to live conversation classes. When you're ready, you can always upgrade!",
//       proResultTitle: "Pro - Ready for Live Classes!",
//       proResultDesc: "Your English level is perfect for participating in our weekly live conversation classes with other learners from around the world.",
//       premiumResultTitle: "Premium - Shape the Journey!",
//       premiumResultDesc: "Your excellent English skills qualify you for our top tier. Join live classes AND vote on weekly destinations for the entire tribe!",
//       signupTitle: "Create Your Neptune's Tribe Account",
//       signupDesc: "Your assessment is complete! Create your account to start your eco-journey.",
//       createAccount: "Create Account & Join Tribe",
//       orSignInGoogle: "Or sign in with Google",
//       alreadyHaveAccount: "Already have an account?",
//       signIn: "Sign In",
//       strengths: "Your Strengths",
//       improvements: "Areas to Develop",
//       error: "Something went wrong. Please try again.",
//       emailRequired: "Please enter your email address",
//       invalidEmail: "Please enter a valid email address",
//     },
//     pt: {
//       title: "Encontre Seu Nível Perfeito na Tribo",
//       subtitle: "Avaliação rápida de inglês para recomendar seu nível ideal de aprendizado",
//       introTitle: "Vamos Encontrar Seu Encaixe Perfeito",
//       introDesc: "Nossas aulas de conversação funcionam melhor quando todos estão em um nível similar de inglês. Esta avaliação rápida nos ajuda a recomendar o nível certo para você.",
//       introPrompt: "Você lerá um texto curto sobre conservação ambiental. Não se preocupe em ser perfeito - queremos ouvir seu nível natural de fala!",
//       emailLabel: "Seu endereço de email",
//       emailPlaceholder: "Digite seu email para começar",
//       startAssessment: "Iniciar Avaliação",
//       recordingTitle: "Grave-se Lendo Este Texto",
//       recordingDesc: "Leia este texto naturalmente no seu próprio ritmo. Não tenha pressa!",
//       readingText: "Marine protected areas are essential for ocean conservation. These underwater sanctuaries provide safe spaces where fish populations can recover and coral reefs can flourish. Scientists have discovered that well-managed marine reserves not only protect biodiversity but also benefit local fishing communities through improved fish stocks in surrounding waters.",
//       recordingInstructions: "Dicas para melhores resultados:",
//       tip1: "Encontre um local silencioso",
//       tip2: "Fale claramente e naturalmente",
//       tip3: "Não tenha pressa - vá no seu tempo",
//       tip4: "Pode pausar entre as frases",
//       startRecording: "Começar Gravação",
//       stopRecording: "Parar Gravação",
//       playRecording: "Reproduzir Gravação",
//       pauseRecording: "Pausar",
//       tryAgain: "Tentar Novamente",
//       submitAssessment: "Enviar Avaliação",
//       recording: "Gravando",
//       seconds: "segundos",
//       resultsTitle: "Seus Resultados da Avaliação",
//       analyzingTitle: "Analisando Seu Inglês...",
//       analyzingDesc: "Nossa IA está avaliando sua pronúncia, fluência e compreensão. Isso leva cerca de 30 segundos.",
//       recommendedTier: "Nível Recomendado",
//       overallScore: "Pontuação Geral",
//       pronunciation: "Pronúncia",
//       fluency: "Fluência",
//       explorerResultTitle: "Explorer - Perfeito para Você!",
//       explorerResultDesc: "Comece sua jornada acessando todas nossas unidades de aprendizado e ouvindo aulas de conversação ao vivo. Quando estiver pronto, sempre pode fazer upgrade!",
//       proResultTitle: "Pro - Pronto para Aulas ao Vivo!",
//       proResultDesc: "Seu nível de inglês é perfeito para participar de nossas aulas semanais de conversação ao vivo com outros estudantes do mundo todo.",
//       premiumResultTitle: "Premium - Molde a Jornada!",
//       premiumResultDesc: "Suas excelentes habilidades em inglês te qualificam para nosso nível mais alto. Participe de aulas ao vivo E vote nos destinos semanais para toda a tribo!",
//       signupTitle: "Crie Sua Conta Neptune's Tribe",
//       signupDesc: "Sua avaliação está completa! Crie sua conta para começar sua jornada ecológica.",
//       createAccount: "Criar Conta & Entrar na Tribo",
//       orSignInGoogle: "Ou entre com Google",
//       alreadyHaveAccount: "Já tem uma conta?",
//       signIn: "Entrar",
//       strengths: "Seus Pontos Fortes",
//       improvements: "Áreas para Desenvolver",
//       error: "Algo deu errado. Tente novamente.",
//       emailRequired: "Por favor digite seu endereço de email",
//       invalidEmail: "Por favor digite um email válido",
//     }
//   };

//   const copy = t[lang];

//   const validateEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;

//       const audioChunks = [];

//       mediaRecorder.ondataavailable = (event) => {
//         audioChunks.push(event.data);
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//         setAudioBlob(audioBlob);

//         const url = URL.createObjectURL(audioBlob);
//         setAudioUrl(url);
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingTime(0);

//       intervalRef.current = setInterval(() => {
//         setRecordingTime((prev) => prev + 1);
//       }, 1000);
//     } catch (error) {
//       console.error("Failed to start recording:", error);
//       setError("Could not access microphone. Please check your permissions.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       streamRef.current?.getTracks().forEach((track) => track.stop());
//       setIsRecording(false);
//       clearInterval(intervalRef.current);
//     }
//   };

//   const playRecording = () => {
//     if (!audioUrl) return;

//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//         setIsPlaying(false);
//       } else {
//         audioRef.current.play();
//         setIsPlaying(true);
//       }
//     } else {
//       const audio = new Audio(audioUrl);
//       audioRef.current = audio;

//       audio.onended = () => {
//         setIsPlaying(false);
//       };

//       audio.play();
//       setIsPlaying(true);
//     }
//   };

//   const resetRecording = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current = null;
//     }
//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//     }

//     setAudioBlob(null);
//     setAudioUrl(null);
//     setIsPlaying(false);
//     setRecordingTime(0);
//   };

//   const submitAssessment = async () => {
//     if (!audioBlob || !email) return;

//     setLoading(true);
//     setStep(3); // Move to analyzing step

//     try {
//       const formData = new FormData();
//       formData.append("audio", audioBlob, "assessment.wav");
//       formData.append("email", email);
//       formData.append("expectedText", copy.readingText);
//       formData.append("language", lang);
//       formData.append("type", "assessment");

//       const response = await fetch("/api/assessment", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Assessment failed");
//       }

//       setAssessment(result);
//       setTimeout(() => setStep(4), 2000);
//     } catch (error) {
//       console.error("Assessment failed:", error);
//       setError(copy.error);
//       setStep(2);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEmailSubmit = () => {
//     if (!email) {
//       setError(copy.emailRequired);
//       return;
//     }
//     if (!validateEmail(email)) {
//       setError(copy.invalidEmail);
//       return;
//     }
//     setError("");
//     setStep(2);
//   };

//   const getTierInfo = (recommendedTier) => {
//     const tierInfo = {
//       explorer: {
//         title: copy.explorerResultTitle,
//         desc: copy.explorerResultDesc,
//         icon: <BookOpen className="w-8 h-8" />,
//         bgColor: "bg-blue-100 dark:bg-blue-900",
//         textColor: "text-blue-600 dark:text-blue-400",
//         borderColor: "border-blue-300 dark:border-blue-600",
//         gradientFrom: "from-blue-600",
//         gradientTo: "to-blue-700",
//         features: [
//           lang === "en" ? "Access all learning units" : "Acesso a todas as unidades",
//           lang === "en" ? "Listen to live classes" : "Ouça aulas ao vivo",
//           lang === "en" ? "Track your progress" : "Acompanhe seu progresso",
//         ]
//       },
//       pro: {
//         title: copy.proResultTitle,
//         desc: copy.proResultDesc,
//         icon: <MessageCircle className="w-8 h-8" />,
//         bgColor: "bg-green-100 dark:bg-green-900",
//         textColor: "text-green-600 dark:text-green-400",
//         borderColor: "border-green-300 dark:border-green-600",
//         gradientFrom: "from-green-600",
//         gradientTo: "to-green-700",
//         features: [
//           lang === "en" ? "Join live conversation classes" : "Participe de aulas de conversação",
//           lang === "en" ? "Advanced progress tracking" : "Acompanhamento avançado",
//           lang === "en" ? "Priority support" : "Suporte prioritário",
//         ]
//       },
//       premium: {
//         title: copy.premiumResultTitle,
//         desc: copy.premiumResultDesc,
//         icon: <Crown className="w-8 h-8" />,
//         bgColor: "bg-purple-100 dark:bg-purple-900",
//         textColor: "text-purple-600 dark:text-purple-400",
//         borderColor: "border-purple-300 dark:border-purple-600",
//         gradientFrom: "from-purple-600",
//         gradientTo: "to-purple-700",
//         features: [
//           lang === "en" ? "Vote on weekly destinations" : "Vote nos destinos semanais",
//           lang === "en" ? "Join special podcasts" : "Participe de podcasts especiais",
//           lang === "en" ? "Premium content access" : "Acesso a conteúdo premium",
//         ]
//       }
//     };
//     return tierInfo[recommendedTier] || tierInfo.explorer;
//   };

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (status === "authenticated") {
//       router.push("/units");
//     }
//   }, [status, router]);

//   // Step 1: Introduction & Email Collection
//   if (step === 1) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
//               {copy.title}
//             </h1>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               {copy.subtitle}
//             </p>
//           </div>

//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
//             <div className="text-center mb-8">
//               <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Mic className="w-10 h-10 text-white" />
//               </div>
//               <h2 className="text-2xl font-bold mb-4">{copy.introTitle}</h2>
//               <p className="text-gray-600 dark:text-gray-300 mb-6">
//                 {copy.introDesc}
//               </p>
//               <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
//                 <p className="text-blue-800 dark:text-blue-200">
//                   {copy.introPrompt}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   {copy.emailLabel}
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder={copy.emailPlaceholder}
//                   className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                 />
//                 {error && (
//                   <p className="text-red-500 text-sm mt-2">{error}</p>
//                 )}
//               </div>

//               <Button
//                 onClick={handleEmailSubmit}
//                 className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-4 text-lg font-semibold"
//               >
//                 {copy.startAssessment}
//                 <ArrowRight className="w-5 h-5 ml-2" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Step 2: Recording
//   if (step === 2) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold mb-4">{copy.recordingTitle}</h1>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               {copy.recordingDesc}
//             </p>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Reading Text */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold mb-4">Read This Text:</h3>
//               <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border-l-4 border-blue-500">
//                 <p className="text-lg leading-relaxed">
//                   {copy.readingText}
//                 </p>
//               </div>

//               <div className="mt-6">
//                 <h4 className="font-semibold mb-3">{copy.recordingInstructions}</h4>
//                 <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
//                   <li className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                     {copy.tip1}
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                     {copy.tip2}
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                     {copy.tip3}
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                     {copy.tip4}
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Recording Controls */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
//               <div className="text-center">
//                 {!audioBlob && (
//                   <div>
//                     <button
//                       onClick={isRecording ? stopRecording : startRecording}
//                       className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
//                         isRecording
//                           ? "bg-red-500 hover:bg-red-600 animate-pulse"
//                           : "bg-blue-500 hover:bg-blue-600"
//                       } text-white shadow-lg`}
//                     >
//                       {isRecording ? (
//                         <MicOff className="w-12 h-12" />
//                       ) : (
//                         <Mic className="w-12 h-12" />
//                       )}
//                     </button>

//                     <p className="text-lg font-medium mb-2">
//                       {isRecording
//                         ? `${copy.recording}... ${recordingTime} ${copy.seconds}`
//                         : copy.startRecording}
//                     </p>

//                     {isRecording && (
//                       <div className="mt-4">
//                         <div className="w-48 h-3 bg-gray-200 rounded-full mx-auto">
//                           <div
//                             className="h-3 bg-red-500 rounded-full transition-all duration-1000"
//                             style={{
//                               width: `${Math.min((recordingTime / 60) * 100, 100)}%`,
//                             }}
//                           ></div>
//                         </div>
//                         <p className="text-sm text-gray-500 mt-2">Maximum 60 seconds</p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {audioBlob && (
//                   <div>
//                     <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <CheckCircle className="w-12 h-12 text-white" />
//                     </div>

//                     <div className="flex justify-center space-x-3 mb-6">
//                       <button
//                         onClick={playRecording}
//                         className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
//                       >
//                         {isPlaying ? (
//                           <Pause className="w-5 h-5" />
//                         ) : (
//                           <Volume2 className="w-5 h-5" />
//                         )}
//                         <span>{isPlaying ? copy.pauseRecording : copy.playRecording}</span>
//                       </button>

//                       <button
//                         onClick={resetRecording}
//                         className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
//                       >
//                         <RotateCcw className="w-4 h-4" />
//                         <span>{copy.tryAgain}</span>
//                       </button>
//                     </div>

//                     <Button
//                       onClick={submitAssessment}
//                       disabled={loading}
//                       className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
//                     >
//                       {loading ? "Submitting..." : copy.submitAssessment}
//                       <ArrowRight className="w-5 h-5 ml-2" />
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Step 3: Analyzing
//   if (step === 3) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
//             <Loader className="w-16 h-16 text-white animate-spin" />
//           </div>
//           <h2 className="text-3xl font-bold mb-4">{copy.analyzingTitle}</h2>
//           <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
//             {copy.analyzingDesc}
//           </p>
//           <div className="mt-8 flex justify-center">
//             <div className="flex space-x-2">
//               {[0, 1, 2].map((i) => (
//                 <div
//                   key={i}
//                   className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
//                   style={{ animationDelay: `${i * 0.2}s` }}
//                 ></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Step 4: Results & Signup
//   if (step === 4 && assessment) {
//     const tierInfo = getTierInfo(assessment.recommendedTier);

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold mb-4">{copy.resultsTitle}</h1>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Assessment Results */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
//               <div className="text-center mb-8">
//                 <div className={`w-20 h-20 ${tierInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
//                   <div className={tierInfo.textColor}>
//                     {tierInfo.icon}
//                   </div>
//                 </div>
//                 <h2 className="text-2xl font-bold mb-2">{copy.recommendedTier}</h2>
//                 <h3 className="text-3xl font-bold text-green-600">{tierInfo.title.split(' - ')[0]}</h3>
//               </div>

//               {/* Score Breakdown */}
//               <div className="grid grid-cols-2 gap-4 mb-8">
//                 <div className="text-center">
//                   <div className={`text-3xl font-bold ${
//                     assessment.scores?.overall >= 80 ? "text-green-500" :
//                     assessment.scores?.overall >= 60 ? "text-yellow-500" : "text-orange-500"
//                   }`}>
//                     {assessment.scores?.overall || 75}
//                   </div>
//                   <div className="text-sm text-gray-600 dark:text-gray-300">{copy.overallScore}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className={`text-3xl font-bold ${
//                     assessment.scores?.pronunciation >= 80 ? "text-green-500" :
//                     assessment.scores?.pronunciation >= 60 ? "text-yellow-500" : "text-orange-500"
//                   }`}>
//                     {assessment.scores?.pronunciation || 73}
//                   </div>
//                   <div className="text-sm text-gray-600 dark:text-gray-300">{copy.pronunciation}</div>
//                 </div>
//               </div>

//               {/* Detailed Feedback */}
//               {assessment.feedback?.strengths && (
//                 <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
//                   <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
//                     <CheckCircle className="w-5 h-5" />
//                     {copy.strengths}
//                   </h4>
//                   <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
//                     {assessment.feedback.strengths.map((strength, i) => (
//                       <li key={i}>• {strength}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {assessment.feedback?.improvements && (
//                 <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
//                   <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
//                     <AlertCircle className="w-5 h-5" />
//                     {copy.improvements}
//                   </h4>
//                   <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
//                     {assessment.feedback.improvements.map((improvement, i) => (
//                       <li key={i}>• {improvement}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>

//             {/* Tier Recommendation & Signup */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
//               <div className={`border-2 ${tierInfo.borderColor} rounded-xl p-6 mb-8`}>
//                 <div className="text-center mb-6">
//                   <div className={`w-16 h-16 ${tierInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
//                     <div className={tierInfo.textColor}>
//                       {tierInfo.icon}
//                     </div>
//                   </div>
//                   <h3 className="text-2xl font-bold mb-2">{tierInfo.title}</h3>
//                   <p className="text-gray-600 dark:text-gray-300">{tierInfo.desc}</p>
//                 </div>

//                 <ul className="space-y-3">
//                   {tierInfo.features.map((feature, i) => (
//                     <li key={i} className="flex items-center gap-2">
//                       <CheckCircle className={`w-4 h-4 ${tierInfo.textColor} flex-shrink-0`} />
//                       <span className="text-sm">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Account Creation */}
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold mb-4">{copy.signupTitle}</h3>
//                 <p className="text-gray-600 dark:text-gray-300 mb-6">
//                   {copy.signupDesc}
//                 </p>

//                 <Button
//                   onClick={() => router.push(`/pricing?recommended=${assessment.recommendedTier}&email=${encodeURIComponent(email)}`)}
//                   className={`w-full bg-gradient-to-r ${tierInfo.gradientFrom} ${tierInfo.gradientTo} text-white py-4 text-lg font-semibold`}
//                 >
//                   {copy.createAccount}
//                   <ArrowRight className="w-5 h-5 ml-2" />
//                 </Button>

//                 <div className="text-center">
//                   <span className="text-gray-500">{copy.orSignInGoogle}</span>
//                 </div>

//                 <Button
//                   onClick={() => signIn("google")}
//                   className="w-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-3"
//                 >
//                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                   </svg>
//                   Continue with Google
//                 </Button>

//                 <div className="text-center text-sm text-gray-500">
//                   {copy.alreadyHaveAccount}{" "}
//                   <button
//                     onClick={() => router.push("/login")}
//                     className="text-blue-600 hover:text-blue-700 font-medium"
//                   >
//                     {copy.signIn}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }
