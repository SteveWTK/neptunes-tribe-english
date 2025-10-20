import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";
import { useSession } from "next-auth/react";
import {
  Play,
  MapPin,
  BookOpen,
  Users,
  Globe,
  Award,
  ArrowRight,
  CheckCircle,
  Fish,
  Calendar,
  Crown,
  MessageCircle,
  X,
} from "lucide-react";

const WelcomeModal = () => {
  const { lang } = useLanguage();
  const { onboardingState, dismissWelcome, startTour } = useOnboarding();
  const { data: session } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);

  const t = {
    en: {
      welcomeTitle: "Welcome to Neptune's Tribe!",
      welcomeSubtitle: "Your Global English Learning Adventure Begins",
      slide1Title: "Learn English Through Environmental Action",
      slide1Text:
        "Every week, our tribe explores a new ecosystem together. Practice English while discovering amazing species and supporting conservation.",
      slide2Title: "Weekly Eco-Adventures",
      slide2Text:
        "Join live conversation classes, complete engaging units, and follow our interactive world map as we journey from ecosystem to ecosystem.",
      slide3Title: "Choose Your Tribe Level",
      slide3Text:
        "Start as an Explorer and upgrade to Pro or Premium for live conversation classes and voting rights on weekly destinations.",
      slide4Title: "Make a Real Impact",
      slide4Text:
        "20% of all revenue goes directly to environmental NGOs. Your learning helps protect the planet!",
      exploreButton: "Start Exploring",
      takeTourButton: "Take the Tour",
      skipForNow: "Skip for now",
      explorerFeatures: [
        "Access to weekly learning units",
        "Listen to conversation classes",
        "Interactive eco-map access",
        "Environmental news updates",
      ],
      proFeatures: [
        "All Explorer features",
        "Participate in live classes",
        "Progress certificates",
        "Priority support",
      ],
      premiumFeatures: [
        "All Pro features",
        "Vote on weekly themes",
        "Special guest podcasts",
        "Shape the tribe's journey",
      ],
      thisWeek: "This Week's Adventure",
      joinTribe: "Join the Tribe Movement",
    },
    pt: {
      welcomeTitle: "Bem-vindo à Neptune's Tribe!",
      welcomeSubtitle: "Sua Aventura Global de Aprendizado de Inglês Começa",
      slide1Title: "Aprenda Inglês Através da Ação Ambiental",
      slide1Text:
        "Toda semana, nossa tribo explora um novo ecossistema juntos. Pratique inglês descobrindo espécies incríveis e apoiando a conservação.",
      slide2Title: "Aventuras Ecológicas Semanais",
      slide2Text:
        "Participe de aulas de conversação ao vivo, complete unidades envolventes e siga nosso mapa mundial interativo enquanto viajamos de ecossistema em ecossistema.",
      slide3Title: "Escolha Seu Nível na Tribo",
      slide3Text:
        "Comece como Explorer e faça upgrade para Pro ou Premium para aulas de conversação ao vivo e direito de voto nos destinos semanais.",
      slide4Title: "Cause um Impacto Real",
      slide4Text:
        "20% de toda a receita vai diretamente para ONGs ambientais. Seu aprendizado ajuda a proteger o planeta!",
      exploreButton: "Começar a Explorar",
      takeTourButton: "Fazer o Tour",
      skipForNow: "Pular por agora",
      explorerFeatures: [
        "Acesso a unidades de aprendizagem semanais",
        "Ouvir aulas de conversação",
        "Acesso ao eco-mapa interativo",
        "Atualizações de notícias ambientais",
      ],
      proFeatures: [
        "Todos os recursos Explorer",
        "Participar de aulas ao vivo",
        "Certificados de progresso",
        "Suporte prioritário",
      ],
      premiumFeatures: [
        "Todos os recursos Pro",
        "Votar em temas semanais",
        "Podcasts com convidados especiais",
        "Moldar a jornada da tribo",
      ],
      thisWeek: "Aventura desta Semana",
      joinTribe: "Junte-se ao Movimento da Tribo",
    },
  };

  const copy = t[lang];

  const slides = [
    {
      title: copy.slide1Title,
      content: copy.slide1Text,
      icon: <Globe className="w-16 h-16 text-green-500" />,
      bgGradient: "from-green-400 to-blue-500",
    },
    {
      title: copy.slide2Title,
      content: copy.slide2Text,
      icon: <Calendar className="w-16 h-16 text-blue-500" />,
      bgGradient: "from-blue-400 to-cyan-500",
    },
    {
      title: copy.slide3Title,
      content: copy.slide3Text,
      icon: <Users className="w-16 h-16 text-purple-500" />,
      bgGradient: "from-purple-400 to-pink-500",
    },
    {
      title: copy.slide4Title,
      content: copy.slide4Text,
      icon: <Fish className="w-16 h-16 text-teal-500" />,
      bgGradient: "from-teal-400 to-green-500",
    },
  ];

  const handleGetStarted = () => {
    dismissWelcome();
    startTour();
  };

  const handleSkip = () => {
    dismissWelcome();
  };

  if (!onboardingState.showWelcomeModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div
            className={`bg-gradient-to-r ${slides[currentSlide].bgGradient} p-8 text-white text-center relative overflow-hidden`}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
              <div
                className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>

            <div className="relative z-10">
              <motion.div
                key={currentSlide}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                {slides[currentSlide].icon}
                <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">
                  {currentSlide === 0
                    ? copy.welcomeTitle
                    : slides[currentSlide].title}
                </h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  {currentSlide === 0
                    ? copy.welcomeSubtitle
                    : slides[currentSlide].content}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {currentSlide === 2 && (
              /* Tier Comparison Slide */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-6 mb-8"
              >
                {/* Explorer */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Explorer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Follow the journey
                  </p>
                  <ul className="space-y-2 text-sm">
                    {copy.explorerFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-6 text-center border-2 border-green-300 dark:border-green-600 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Pro</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Speak in classes
                  </p>
                  <ul className="space-y-2 text-sm">
                    {copy.proFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 text-center border-2 border-purple-300 dark:border-purple-600">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Premium</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Shape the journey
                  </p>
                  <ul className="space-y-2 text-sm">
                    {copy.premiumFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {currentSlide === 3 && (
              /* Impact Slide */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
                    {copy.joinTribe}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        20%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        To Conservation
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        170+
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Learning Units
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        Global
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Community
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {/* Slide indicators */}
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {copy.skipForNow}
                </button>

                {currentSlide < slides.length - 1 ? (
                  <button
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleGetStarted}
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                    >
                      {copy.takeTourButton}
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSkip}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {copy.exploreButton}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
