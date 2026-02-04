import React, { useState, useEffect } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  Map,
  TrendingUp,
  MessageCircle,
  Crown,
  ArrowRight,
  Eye,
  Play,
} from "lucide-react";

const GuidedTour = () => {
  const { lang } = useLanguage();
  const { onboardingState, completeStep, updateOnboardingState } =
    useOnboarding();
  const router = useRouter();
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const t = {
    en: {
      // Step 1: Units Page
      step1Title: "Discover Learning Units",
      step1Content:
        "This is your learning hub! Each unit focuses on a different species, ecosystem, or environmental hero. Complete units to light up regions on your eco-map.",

      // Step 2: Unit Card
      step2Title: "Try Your First Unit",
      step2Content:
        "Click on any unit to start learning! Each unit has an engaging text with gap-fill exercises, audio, and translations. Some units are premium-only.",

      // Step 3: Eco-Map Navigation
      step3Title: "Navigate to Your Eco-Map",
      step3Content:
        "Click here to view your progress around the world! Your eco-map shows which countries and marine zones you've explored.",

      // Step 4: Eco-Map Features
      step4Title: "Track Your Global Impact",
      step4Content:
        "Watch as countries and oceans light up as you complete units! Completed areas are highlighted in green, and marine zones in purple.",

      // Step 5: Weekly Theme
      step5Title: "Join Weekly Adventures",
      step5Content:
        "Every week, the tribe explores a new ecosystem together. Premium members vote on destinations and join live conversation classes!",

      // Step 6: Pricing/Upgrade
      step6Title: "Upgrade Your Tribe Level",
      step6Content:
        "Ready to join live classes and vote on weekly themes? Upgrade to Pro or Premium to unlock the full Neptune's Tribe experience!",

      // Navigation
      nextButton: "Next",
      backButton: "Back",
      skipButton: "Skip Tour",
      finishButton: "Start Learning!",

      // Dynamic content
      weeklyThemeTitle: "This Week's Adventure",
      premiumFeatures: "Premium Features",
      tryUnit: "Try a Unit",
      exploreMap: "Explore Your Map",
    },
    pt: {
      // Step 1: Units Page
      step1Title: "Descubra as Unidades de Aprendizado",
      step1Content:
        "Este é seu centro de aprendizado! Cada unidade foca em uma espécie, ecossistema ou herói ambiental diferente. Complete unidades para iluminar regiões no seu eco-mapa.",

      // Step 2: Unit Card
      step2Title: "Experimente Sua Primeira Unidade",
      step2Content:
        "Clique em qualquer unidade para começar a aprender! Cada unidade tem um texto envolvente com exercícios de lacunas, áudio e traduções. Algumas unidades são apenas premium.",

      // Step 3: Eco-Map Navigation
      step3Title: "Navegue para Seu Eco-Mapa",
      step3Content:
        "Clique aqui para ver seu progresso ao redor do mundo! Seu eco-mapa mostra quais países e zonas marinhas você explorou.",

      // Step 4: Eco-Map Features
      step4Title: "Acompanhe Seu Impacto Global",
      step4Content:
        "Veja países e oceanos se iluminarem conforme você completa unidades! Áreas concluídas são destacadas em verde, e zonas marinhas em roxo.",

      // Step 5: Weekly Theme
      step5Title: "Participe de Aventuras Semanais",
      step5Content:
        "Toda semana, a tribo explora um novo ecossistema juntos. Membros Premium votam nos destinos e participam de aulas de conversação ao vivo!",

      // Step 6: Pricing/Upgrade
      step6Title: "Faça Upgrade do Seu Nível na Tribo",
      step6Content:
        "Pronto para participar de aulas ao vivo e votar em temas semanais? Faça upgrade para Pro ou Premium para desbloquear a experiência completa da Neptune's Tribe!",

      // Navigation
      nextButton: "Próximo",
      backButton: "Voltar",
      skipButton: "Pular Tour",
      finishButton: "Começar a Aprender!",

      // Dynamic content
      weeklyThemeTitle: "Aventura desta Semana",
      premiumFeatures: "Recursos Premium",
      tryUnit: "Experimente uma Unidade",
      exploreMap: "Explore Seu Mapa",
    },
    th: {
      // Step 1: Units Page
      step1Title: "ค้นพบบทเรียน",
      step1Content:
        "นี่คือศูนย์กลางการเรียนรู้ของคุณ! แต่ละบทเรียนเน้นเรื่องสายพันธุ์ ระบบนิเวศ หรือฮีโร่ด้านสิ่งแวดล้อมที่แตกต่างกัน เรียนจบบทเรียนเพื่อจุดสว่างภูมิภาคต่าง ๆ บนแผนที่นิเวศของคุณ",

      // Step 2: Unit Card
      step2Title: "ลองบทเรียนแรกของคุณ",
      step2Content:
        "คลิกที่บทเรียนใดก็ได้เพื่อเริ่มเรียนรู้! แต่ละบทเรียนมีเนื้อหาที่น่าสนใจพร้อมแบบฝึกหัดเติมคำ เสียง และคำแปล บางบทเรียนสำหรับสมาชิกพรีเมียมเท่านั้น",

      // Step 3: Eco-Map Navigation
      step3Title: "ไปยังแผนที่นิเวศของคุณ",
      step3Content:
        "คลิกที่นี่เพื่อดูความก้าวหน้าของคุณรอบโลก! แผนที่นิเวศแสดงประเทศและเขตทางทะเลที่คุณได้สำรวจแล้ว",

      // Step 4: Eco-Map Features
      step4Title: "ติดตามผลกระทบระดับโลกของคุณ",
      step4Content:
        "ดูประเทศและมหาสมุทรสว่างขึ้นเมื่อคุณเรียนจบบทเรียน! พื้นที่ที่เรียนจบแล้วจะไฮไลท์เป็นสีเขียว และเขตทางทะเลเป็นสีม่วง",

      // Step 5: Weekly Theme
      step5Title: "ร่วมการผจญภัยประจำสัปดาห์",
      step5Content:
        "ทุกสัปดาห์ เผ่าจะสำรวจระบบนิเวศใหม่ร่วมกัน สมาชิกพรีเมียมสามารถโหวตจุดหมายปลายทางและเข้าร่วมคลาสสนทนาสด!",

      // Step 6: Pricing/Upgrade
      step6Title: "อัปเกรดระดับเผ่าของคุณ",
      step6Content:
        "พร้อมที่จะเข้าร่วมคลาสสดและโหวตธีมประจำสัปดาห์หรือยัง? อัปเกรดเป็น Pro หรือ Premium เพื่อปลดล็อกประสบการณ์ Neptune's Tribe เต็มรูปแบบ!",

      // Navigation
      nextButton: "ถัดไป",
      backButton: "ย้อนกลับ",
      skipButton: "ข้ามทัวร์",
      finishButton: "เริ่มเรียนเลย!",

      // Dynamic content
      weeklyThemeTitle: "การผจญภัยประจำสัปดาห์นี้",
      premiumFeatures: "ฟีเจอร์พรีเมียม",
      tryUnit: "ลองบทเรียน",
      exploreMap: "สำรวจแผนที่ของคุณ",
    },
  };

  const copy = t[lang];

  // Define tour steps based on current page
  const getStepsForPage = (currentPath) => {
    if (currentPath.includes("/units")) {
      return [
        {
          target: ".units-header, h1",
          content: copy.step1Content,
          title: copy.step1Title,
          placement: "bottom",
          disableBeacon: true,
        },
        {
          target: '[data-tour="unit-card"]',
          content: copy.step2Content,
          title: copy.step2Title,
          placement: "top",
        },
        {
          target: '[data-tour="eco-map-link"], [href="/eco-map"]',
          content: copy.step3Content,
          title: copy.step3Title,
          placement: "bottom",
        },
      ];
    } else if (currentPath.includes("/eco-map")) {
      return [
        {
          target: '[data-tour="eco-map"]',
          content: copy.step4Content,
          title: copy.step4Title,
          placement: "top",
          disableBeacon: true,
        },
        {
          target: '[data-tour="weekly-theme"]',
          content: copy.step5Content,
          title: copy.step5Title,
          placement: "bottom",
        },
      ];
    } else {
      // Landing page or other pages
      return [
        {
          target: '[data-tour="hero-section"]',
          content: copy.step1Content,
          title: copy.step1Title,
          placement: "bottom",
          disableBeacon: true,
        },
        {
          target: '[data-tour="tier-section"]',
          content: copy.step6Content,
          title: copy.step6Title,
          placement: "top",
        },
      ];
    }
  };

  const steps = getStepsForPage(pathname);

  // Start tour when triggered
  useEffect(() => {
    if (onboardingState.showTour) {
      setRun(true);
      setStepIndex(0);
    }
  }, [onboardingState.showTour]);

  // Handle tour events
  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      completeStep("hasCompletedTour");
      updateOnboardingState({ showTour: false });

      // Navigate to units page if not already there
      if (!pathname.includes("/units")) {
        router.push("/units");
      }
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
  }) => (
    <div
      {...tooltipProps}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm"
    >
      {step.title && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            {index === 0 && <BookOpen className="w-5 h-5 text-white" />}
            {index === 1 && <Play className="w-5 h-5 text-white" />}
            {index === 2 && <Map className="w-5 h-5 text-white" />}
            {index === 3 && <TrendingUp className="w-5 h-5 text-white" />}
            {index === 4 && <MessageCircle className="w-5 h-5 text-white" />}
            {index === 5 && <Crown className="w-5 h-5 text-white" />}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {step.title}
          </h3>
        </div>
      )}

      <div className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        {step.content}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {copy.backButton}
            </button>
          )}

          <button
            {...skipProps}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {copy.skipButton}
          </button>

          <button
            {...primaryProps}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
          >
            {index === steps.length - 1 ? copy.finishButton : copy.nextButton}
            {index < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  if (!run) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      stepIndex={stepIndex}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#10b981",
          backgroundColor: "#ffffff",
          textColor: "#374151",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "#ffffff",
          beaconSize: 36,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
        },
        beacon: {
          backgroundColor: "#10b981",
        },
        spotlight: {
          backgroundColor: "transparent",
          border: "2px solid #10b981",
          borderRadius: "8px",
        },
      }}
      tooltipComponent={CustomTooltip}
      disableOverlayClose
      disableScrolling={false}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
};

export default GuidedTour;
