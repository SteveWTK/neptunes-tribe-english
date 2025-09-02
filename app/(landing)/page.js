"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
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
  Library,
  MessageCircle,
  Calendar,
  Vote,
  Mic,
  Map,
  Star,
  Crown,
} from "lucide-react";

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const { lang } = useLanguage();

  const t = {
    en: {
      heroTitle: "Join Neptune's Tribe",
      heroSubtitle: "Learn English through global environmental adventures",
      heroDescription:
        "Every week, our tribe explores a new ecosystem together. Join live conversation classes, discover amazing species, and help save the planet while mastering English.",
      startFree: "Start now",
      upgradePro: "Start now",
      exploreDemoButton: "Explore Our Interactive Map",

      // Community Focus
      communityTitle: "Learn Together, Make an Impact Together",
      communitySubtitle:
        "Join hundreds of learners on a synchronised global journey",
      weeklyTheme: "New ecosystem every week",
      liveClasses: "Live conversation classes",
      globalCommunity: "Learn with the tribe",
      realImpact: "Support conservation",

      // Features
      featuresTitle: "Your Weekly Eco-Adventure Includes",
      feature1Title: "Live Conversation Classes",
      feature1Desc:
        "Join weekly English conversation sessions focussed on that week's ecosystem with max 8 participants",

      feature2Title: "Interactive Learning Journey",
      feature2Desc:
        "A rich selection of units about species and environments from the region you're exploring each week",

      feature3Title: "Community Exploration",
      feature3Desc:
        "Follow our interactive world map as the tribe moves together from ecosystem to ecosystem",

      feature4Title: "Premium Member Voting",
      feature4Desc:
        "Premium members vote on next week's destination - help shape the tribe's journey",

      // Tiers
      tiersTitle: "Choose Your Tribe Level",
      tiersSubtitle:
        "All members explore the same ecosystem each week, but at different levels of participation",

      explorerTitle: "Explorer",
      explorerSub: "Follow the journey",
      explorerFeatures: [
        "Access to all weekly learning units and challenges",
        "Access to weekly conversation lessons as a listener",
        "Eco Map access",
        // "Progress tracking",
        "Access to eco-news",
      ],

      proTitle: "Pro",
      proSub: "Speak in the classes",
      proFeatures: [
        "All Explorer features, plus:",
        "Full Access to weekly converstation lessons as a participant",
        // "Advanced progress analytics",
        // "Priority support",
        "Certificate generation",
      ],

      premiumTitle: "Premium",
      premiumSub: "Shape the journey",
      premiumFeatures: [
        "All Pro features, plus:",
        "Voting rights on weekly topics",
        "Participation in podcasts with special guests",
      ],
      viewAllTiers: "View all tiers and pricing",

      // How It Works
      howItWorksTitle: "How Neptune's Tribe Works",
      step1Title: "Join the Tribe",
      step1Desc:
        "Sign up and take a quick English assessment to find your perfect tier",
      step2Title: "Weekly Adventures",
      step2Desc:
        "Every Monday, discover a new ecosystem with fresh content and live classes",
      step3Title: "Learn & Connect",
      step3Desc:
        "Practise English while learning about conservation with fellow tribe members",
      step4Title: "Make an Impact",
      step4Desc:
        "20% of revenue supports real environmental protection projects",

      // Social Proof
      testimonialTitle: "What Our Tribe Says",
      testimonial1:
        "The live classes are incredible! I'm learning about rainforests while improving my English with people from around the world.",
      testimonial1Author: "Carlos Silva, Pro Member",
      testimonial2:
        "My students love following the weekly journey. They can't wait to see which ecosystem we'll explore next!",
      testimonial2Author: "Dr. Sarah Chen, Educator",
      testimonial3:
        "Being able to vote on our destinations makes me feel like I'm really part of shaping this community.",
      testimonial3Author: "Anna Kowalski, Premium Member",

      // For Schools
      schoolsTitle: "Transform Your English Curriculum",
      schoolsSubtitle:
        "Give your students a synchronized global learning experience",
      schoolBenefit1: "Weekly structured curriculum",
      schoolBenefit2: "Student engagement tracking",
      schoolBenefit3: "Professional conversation facilitation",
      schoolBenefit4: "Real environmental impact",
      schoolsCTA: "Schedule School Demo",

      // Mission
      missionTitle: "Learning That Changes the World",
      missionText:
        "Every conversation class helps fund real conservation. Join a community where learning English means protecting our planet.",
      oceanTitle: "Environmental conservation",
      oceanSubtitle:
        "20% of all revenue goes directly to verified environmental NGOs.",

      // CTA
      ctaTitle: "Ready to Join the Tribe?",
      ctaSubtitle: "Start your weekly eco-journey with learners worldwide",
      ctaFree: "Start as an Explorer",
      ctaPremium: "Join Pro Classes",

      // FAQ
      faq: "Frequently Asked Questions",
      faq1: "How do the live classes work?",
      faq1Answer:
        "Every week we focus on a new ecosystem. Pro and Premium members join live conversation classes (max 8 people) while Explorer members can listen in.",
      faq2: "What if my English isn't ready for live classes?",
      faq2Answer:
        "Perfect! Start as an Explorer to access all content and listen to classes. When you're ready, upgrade to Pro to participate actively.",
      faq3: "How do Premium members vote?",
      faq3Answer:
        "Premium members vote each Thursday on the following week's ecosystem destination. Democracy in action!",
    },
    pt: {
      heroTitle: "Junte-se à Neptune's Tribe",
      heroSubtitle: "Aprenda inglês através de aventuras ambientais globais",
      heroDescription:
        "Toda semana, nossa tribo explora um novo ecossistema juntos. Participe de aulas de conversação ao vivo, descubra espécies incríveis e ajude a salvar o planeta enquanto domina o inglês.",
      startFree: "Comece agora",
      upgradePro: "Comece agora",
      exploreDemoButton: "Explore Nosso Mapa Interativo",

      // Community Focus
      communityTitle: "Aprenda Juntos, Cause Impacto Juntos",
      communitySubtitle:
        "Junte-se a centenas de estudantes numa jornada global sincronizada",
      weeklyTheme: "Novo ecossistema toda semana",
      liveClasses: "Aulas de conversação ao vivo",
      globalCommunity: "Aprenda com a tribo",
      realImpact: "Apoie a conservação",

      // Features
      featuresTitle: "Sua Aventura Ecológica Semanal Inclui",
      feature1Title: "Aulas de Conversação ao Vivo",
      feature1Desc:
        "Participe de sessões semanais de conversação em inglês focadas no ecossistema da semana com máx. 8 participantes",

      feature2Title: "Jornada de Aprendizado Interativa",
      feature2Desc:
        "Uma grande seleção de unidades ricas sobre espécies e ambientes da região que você está explorando cada semana",

      feature3Title: "Exploração Comunitária",
      feature3Desc:
        "Siga nosso mapa mundial interativo enquanto a tribo se move junta de ecossistema em ecossistema",

      feature4Title: "Votação de Membros Premium",
      feature4Desc:
        "Membros Premium votam no destino da próxima semana - ajude a moldar a jornada da tribo",

      // Tiers
      tiersTitle: "Escolha Seu Nível na Tribo",
      tiersSubtitle:
        "Todos os membros exploram o mesmo ecossistema cada semana, mas em diferentes níveis de participação",

      explorerTitle: "Explorer",
      explorerSub: "Siga a jornada",
      explorerFeatures: [
        "Acesso a todas as unidades de aprendizagem e desafios semanais",
        "Acesso às aulas semanais de conversação como ouvinte",
        "Acesso ao Mapa Ecológico",
        // "Acompanhamento de progresso",
        "Acesso ao Eco News",
      ],

      proTitle: "Pro",
      proSub: "Fale nas aulas",
      proFeatures: [
        "Todos os recursos do Explorer, mais:",
        "Acesso total às aulas semanais de conversação como participante",
        // "Análise avançada de progresso",
        // "Suporte prioritário",
        "Geração de certificados",
      ],

      premiumTitle: "Premium",
      premiumSub: "Molde a jornada",
      premiumFeatures: [
        "Todos os recursos do Pro, mais:",
        "Direito de voto em tópicos semanais",
        "Participação em podcasts com convidados especiais",
      ],
      viewAllTiers: "Ver todos os níveis e preços",

      // How It Works
      howItWorksTitle: "Como Funciona a Neptune's Tribe",
      step1Title: "Entre na Tribo",
      step1Desc:
        "Cadastre-se e faça uma avaliação rápida de inglês para encontrar seu nível perfeito",
      step2Title: "Aventuras Semanais",
      step2Desc:
        "Toda segunda-feira, descubra um novo ecossistema com conteúdo fresco e aulas ao vivo",
      step3Title: "Aprenda e Conecte",
      step3Desc:
        "Pratique inglês enquanto aprende sobre conservação com outros membros da tribo",
      step4Title: "Cause um Impacto",
      step4Desc: "20% da receita apoia projetos reais de proteção ambiental",

      // Social Proof
      testimonialTitle: "O Que Nossa Tribo Diz",
      testimonial1:
        "As aulas ao vivo são incríveis! Estou aprendendo sobre florestas tropicais enquanto melhoro meu inglês com pessoas do mundo todo.",
      testimonial1Author: "Carlos Silva, Membro Pro",
      testimonial2:
        "Meus alunos adoram seguir a jornada semanal. Mal podem esperar para ver qual ecossistema vamos explorar!",
      testimonial2Author: "Dra. Sarah Chen, Educadora",
      testimonial3:
        "Poder votar nos nossos destinos me faz sentir que realmente faço parte de moldar esta comunidade.",
      testimonial3Author: "Anna Kowalski, Membro Premium",

      // For Schools
      schoolsTitle: "Transforme Seu Currículo de Inglês",
      schoolsSubtitle:
        "Dê aos seus alunos uma experiência global sincronizada de aprendizado",
      schoolBenefit1: "Currículo estruturado semanal",
      schoolBenefit2: "Acompanhamento de engajamento dos alunos",
      schoolBenefit3: "Facilitação profissional de conversação",
      schoolBenefit4: "Impacto ambiental real",
      schoolsCTA: "Agende Demo para Escola",

      // Mission
      missionTitle: "Aprendizado Que Muda o Mundo",
      missionText:
        "Cada aula de conversação ajuda a financiar conservação real. Junte-se a uma comunidade onde aprender inglês significa proteger nosso planeta.",
      oceanTitle: "Proteção ambiental",
      oceanSubtitle:
        "20% de toda a receita vai diretamente para ONGs ambientais verificadas que se dedicam à conservação dos oceanos.",

      // CTA
      ctaTitle: "Pronto para Se Juntar à Tribo?",
      ctaSubtitle:
        "Comece sua jornada ecológica semanal com estudantes do mundo todo",
      ctaFree: "Comece como Explorer",
      ctaPremium: "Participe das Aulas Pro",

      // FAQ
      faq: "Perguntas Frequentes",
      faq1: "Como funcionam as aulas ao vivo?",
      faq1Answer:
        "Toda semana focamos num novo ecossistema. Membros Pro e Premium participam de aulas de conversação ao vivo (máx. 8 pessoas) enquanto membros Explorer podem ouvir.",
      faq2: "E se meu inglês não estiver pronto para aulas ao vivo?",
      faq2Answer:
        "Perfeito! Comece como Explorer para acessar todo conteúdo e ouvir as aulas. Quando estiver pronto, faça upgrade para Pro para participar ativamente.",
      faq3: "Como os membros Premium votam?",
      faq3Answer:
        "Membros Premium votam toda quinta-feira no destino ecossistêmico da semana seguinte. Democracia em ação!",
    },
  };

  const copy = t[lang];

  const heroImages = [
    {
      // src: "/landing-top/new-guinea-people-paddling.jpg",
      src: "/landing-top/marcus-woodbridge-campfire.jpg",
      caption: lang === "en" ? "Join the tribe!" : "Junte-se à tribo",
    },
    {
      src: "/landing-top/augustin-basabose.avif",
      caption:
        lang === "en"
          ? "Meet conservation heroes"
          : "Conheça heróis da conservação",
    },
    {
      src: "/landing-top/manu-national-park-peru.jpg",
      caption:
        lang === "en"
          ? "This Week: Amazon Rainforest"
          : "Esta Semana: Floresta Amazônica",
    },
    {
      src: "/landing-top/king-penguin.jpg",
      caption:
        lang === "en"
          ? "Next Week: Antarctic Waters"
          : "Próxima Semana: Águas Antárticas",
    },
  ];

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: copy.feature1Title,
      description: copy.feature1Desc,
      image: "/screenshots/conversation-class.png",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: copy.feature2Title,
      description: copy.feature2Desc,
      image: "/screenshots/units.png",
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: copy.feature3Title,
      description: copy.feature3Desc,
      image: "/screenshots/eco-map-preview.png",
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: copy.feature4Title,
      description: copy.feature4Desc,
      image: "/screenshots/voting-interface.png",
    },
  ];

  const steps = [
    {
      icon: <Users className="w-12 h-12" />,
      title: copy.step1Title,
      description: copy.step1Desc,
    },
    {
      icon: <Calendar className="w-12 h-12" />,
      title: copy.step2Title,
      description: copy.step2Desc,
    },
    {
      icon: <MessageCircle className="w-12 h-12" />,
      title: copy.step3Title,
      description: copy.step3Desc,
    },
    {
      icon: <Fish className="w-12 h-12" />,
      title: copy.step4Title,
      description: copy.step4Desc,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(featureInterval);
  }, [features.length]);

  return (
    <div className="font-sans min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              {/* Community Badge */}
              {/* bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 */}
              <div className="inline-flex items-center gap-2 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <Users className="w-4 h-4" />
                {copy.weeklyTheme} • {copy.liveClasses}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">
                  {copy.heroTitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-200 mb-4 max-w-2xl">
                {copy.heroSubtitle}
              </p>

              <p className="text-lg text-gray-500 dark:text-gray-200 mb-8 max-w-2xl">
                {copy.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center">
                  {copy.startFree}
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center">
                  <Mic className="w-5 h-5" />
                  {copy.upgradePro}
                </button> */}
              </div>

              {/* Demo Link */}
              {/* <div className="mt-6">
                <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Play className="w-4 h-4" />
                  {copy.exploreDemoButton}
                </button>
              </div> */}
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative w-full max-w-xl mx-auto">
                <img
                  src={heroImages[currentImageIndex].src}
                  alt="Hero"
                  className="w-full h-96 rounded-3xl object-cover shadow-2xl transition-opacity duration-1000"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3">
                  <p className="text-sm font-medium text-center">
                    {heroImages[currentImageIndex].caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{copy.communityTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {copy.communitySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                text: copy.weeklyTheme,
                color: "blue",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                text: copy.liveClasses,
                color: "green",
              },
              {
                icon: <Users className="w-8 h-8" />,
                text: copy.globalCommunity,
                color: "purple",
              },
              {
                icon: <Fish className="w-8 h-8" />,
                text: copy.realImpact,
                color: "cyan",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-full flex items-center justify-center mx-auto mb-3 text-${item.color}-600 dark:text-${item.color}-400`}
                >
                  {item.icon}
                </div>
                <p className="font-semibold">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.howItWorksTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white relative">
                  {step.icon}
                  {/* <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 dark:text-white">
                    {i + 1}
                  </div> */}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.featuresTitle}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 shadow-lg border-l-4 border-green-500"
                      : "bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        activeFeature === index
                          ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Image */}
            <div className="relative">
              <img
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                className="w-full h-96 rounded-xl object-cover shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Overview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.tiersTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {copy.tiersSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Explorer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">{copy.explorerTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {copy.explorerSub}
                </p>
              </div>
              <ul className="space-y-3">
                {copy.explorerFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-300 dark:border-green-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">{copy.proTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {copy.proSub}
                </p>
              </div>
              <ul className="space-y-3">
                {copy.proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 shadow-lg border-2 border-purple-300 dark:border-purple-600">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">{copy.premiumTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {copy.premiumSub}
                </p>
              </div>
              <ul className="space-y-3">
                {copy.premiumFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl flex items-center gap-2 mx-auto">
              {copy.viewAllTiers}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.testimonialTitle}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: copy.testimonial1, author: copy.testimonial1Author },
              { text: copy.testimonial2, author: copy.testimonial2Author },
              { text: copy.testimonial3, author: copy.testimonial3Author },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section className="py-20 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">{copy.schoolsTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {copy.schoolsSubtitle}
              </p>

              <div className="space-y-4 mb-8">
                {[
                  copy.schoolBenefit1,
                  copy.schoolBenefit2,
                  copy.schoolBenefit3,
                  copy.schoolBenefit4,
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
                {copy.schoolsCTA}
              </button>
            </div>

            <div className="relative">
              <img
                src="/classroom.jpeg"
                alt="Classroom using Neptune's Tribe"
                className="w-full h-96 rounded-xl object-cover shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Impact Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">{copy.missionTitle}</h2>
            <p className="text-xl mb-12 opacity-90">{copy.missionText}</p>

            <div className="grid md:grid-cols-1 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Fish className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {copy.oceanTitle}
                </h3>
                <p className="text-sm opacity-90">{copy.oceanSubtitle}</p>
              </div>
              {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Library className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Education Access</h3>
                <p className="text-sm opacity-90">
                  Free Explorer access for underprivileged communities
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.faq}</h2>
          </div>

          <div className="space-y-6">
            {[
              { q: copy.faq1, a: copy.faq1Answer },
              { q: copy.faq2, a: copy.faq2Answer },
              { q: copy.faq3, a: copy.faq3Answer },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">{copy.ctaTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {copy.ctaSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl flex items-center gap-2 justify-center">
                {copy.ctaFree}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center">
                <Mic className="w-5 h-5" />
                {copy.ctaPremium}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// app\(landing)\page.js
// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import { Button } from "@/components/ui/buttonLanding";
// import Footer from "@/components/Footer";
// import {
//   Play,
//   MapPin,
//   BookOpen,
//   Users,
//   Globe,
//   Award,
//   ArrowRight,
//   CheckCircle,
//   FishSymbol,
//   LibraryBig,
// } from "lucide-react";

// export default function LandingPage({ darkMode = false }) {
//   const { lang } = useLanguage();
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [activeFeature, setActiveFeature] = useState(0);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   const t = {
//     en: {
//       heroTitle: "Welcome to Neptune's Tribe!",
//       heroSubtitle:
//         "Join us on an environmental journey around the world … and practise your English along the way!",
//       heroCall: "Start your eco-journey today",
//       startFree: "Start Free",
//       viewPricing: "View Subscription Rates",
//       exploreDemoButton: "Explore Live Demo",

//       // Features
//       featuresTitle: "Why Neptune's Tribe?",
//       feature1Title: "Interactive World Map",
//       feature1Desc:
//         "Track your learning journey across countries and marine ecosystems",
//       feature2Title: "170+ Rich Learning Units",
//       feature2Desc:
//         "Discover wildlife, ecosystems, and environmental heroes from every continent",
//       feature3Title: "Project-Based Learning",
//       feature3Desc:
//         "Solve real environmental challenges while improving your English",
//       feature4Title: "For Schools & Individuals",
//       feature4Desc: "Perfect for classrooms or personal learning adventures",

//       // Stats
//       statsLearners: "Active Learners",
//       statsCountries: "Countries Covered",
//       statsUnits: "Learning Units",
//       statsCharity: "Donated to Ocean Conservation",

//       // Social Proof
//       testimonialTitle: "What Our Community Says",
//       testimonial1:
//         "My students are completely engaged! They're learning English while solving real environmental problems.",
//       testimonial1Author: "Maria Santos, ESL Teacher",
//       testimonial2:
//         "I never thought learning English could help save the oceans. This platform is incredible!",
//       testimonial2Author: "Ahmed Hassan, Student",

//       // For Schools
//       schoolsTitle: "Perfect for Schools & Educators",
//       schoolsSubtitle:
//         "Transform your English curriculum with project-based environmental learning",
//       schoolBenefit1: "Classroom management tools",
//       schoolBenefit2: "Progress-tracking for all students",
//       schoolBenefit3: "Curriculum-aligned content",
//       schoolBenefit4: "Teacher training & support",
//       schoolsCTA: "Schedule a demo for your school",

//       // Mission
//       missionTitle: "Learning That Makes a Difference",
//       missionText:
//         "Every lesson supports real conservation projects. 20% of all revenue goes directly to environmental NGOs.",
//       missionTextOceanHeader: "Environmental Conservation",
//       missionTextOCean: "Direct funding to environmental protection projects",
//       missionTextEducationHeader: "Education Access",
//       missionTextEducation: "Free access for underprivileged communities",

//       // CTA
//       ctaTitle: "Ready to Start Your Eco-Journey?",
//       ctaSubtitle: "Join thousands of learners making a difference",
//       ctaFree: "Start Free Today",
//       ctaPremium: "Go Premium",
//     },
//     pt: {
//       heroTitle: "Bem-vindo à Neptune's Tribe!",
//       heroSubtitle:
//         "Junte-se a nós em uma jornada ambiental ao redor do mundo… e pratique seu inglês ao longo do caminho!",
//       heroCall: "Comece sua jornada ecológica hoje",
//       startFree: "Comece Grátis",
//       viewPricing: "Ver Preços",
//       exploreDemoButton: "Explorar Demo",

//       // Features
//       featuresTitle: "Por que Neptune's Tribe?",
//       feature1Title: "Mapa Mundial Interativo",
//       feature1Desc:
//         "Acompanhe sua jornada de aprendizado por países e ecossistemas marinhos",
//       feature2Title: "170+ Unidades de Aprendizado",
//       feature2Desc:
//         "Descubra vida selvagem, ecossistemas e heróis ambientais de todos os continentes",
//       feature3Title: "Aprendizado Baseado em Projetos",
//       feature3Desc:
//         "Resolva desafios ambientais reais enquanto melhora seu inglês",
//       feature4Title: "Para Escolas e Indivíduos",
//       feature4Desc:
//         "Perfeito para salas de aula ou aventuras de aprendizado pessoal",

//       // Stats
//       statsLearners: "Alunos Ativos",
//       statsCountries: "Países Cobertos",
//       statsUnits: "Unidades de Aprendizado",
//       statsCharity: "Doado para Conservação Oceânica",

//       // Social Proof
//       testimonialTitle: "O Que Nossa Comunidade Diz",
//       testimonial1:
//         "Meus alunos estão completamente engajados! Eles aprendem inglês resolvendo problemas ambientais reais.",
//       testimonial1Author: "Maria Santos, Professora de ESL",
//       testimonial2:
//         "Nunca pensei que aprender inglês pudesse ajudar a salvar os oceanos. Esta plataforma é incrível!",
//       testimonial2Author: "Ahmed Hassan, Estudante",

//       // For Schools
//       schoolsTitle: "Perfeito para Escolas e Educadores",
//       schoolsSubtitle:
//         "Transforme seu currículo de inglês com aprendizado ambiental baseado em projetos",
//       schoolBenefit1: "Ferramentas de gestão de sala",
//       schoolBenefit2: "Acompanhamento de progresso para todos os alunos",
//       schoolBenefit3: "Conteúdo alinhado ao currículo",
//       schoolBenefit4: "Treinamento e suporte para professores",
//       schoolsCTA: "Agende uma demo para sua escola",

//       // Mission
//       missionTitle: "Aprendizado Que Faz a Diferença",
//       missionText:
//         "Cada lição apoia projetos reais de conservação oceânica. 20% de toda receita vai diretamente para organizações ambientais.",
//       missionTextOceanHeader: "Conservação do Oceano",
//       missionTextOCean:
//         "Financiamento direto para projetos de proteção marinha",
//       missionTextEducationHeader: "Acesso à Educação",
//       missionTextEducation: "Acesso gratuito para comunidades carentes",

//       // CTA
//       ctaTitle: "Pronto para Começar Sua Jornada Ecológica?",
//       ctaSubtitle: "Junte-se a milhares de alunos fazendo a diferença",
//       ctaFree: "Comece Grátis Hoje",
//       ctaPremium: "Vá Premium",
//     },
//   };

//   const copy = t[lang];

//   const heroImages = [
//     {
//       src: "/eco/Hummingbird.webp",
//       caption:
//         lang === "en"
//           ? "Explore the world's ecosystems"
//           : "Explore os ecossistemas do nosso planeta",
//     },
//     {
//       src: "/heroes/Pablo-Borboroglu-and-penguin.jpg",
//       caption:
//         lang === "en"
//           ? "Meet environmental protectors"
//           : "Conheça protetores do meio ambiente",
//     },
//     {
//       src: "/eco/bg_polar.jpg",
//       caption:
//         lang === "en"
//           ? "Help to save endangered species"
//           : "Ajude a salvar espécies ameaçadas",
//     },
//   ];

//   const features = [
//     {
//       icon: <MapPin className="w-8 h-8" />,
//       title: copy.feature1Title,
//       description: copy.feature1Desc,
//       image: "/screenshots/eco-map-preview.png", // You'll need this
//     },
//     {
//       icon: <BookOpen className="w-8 h-8" />,
//       title: copy.feature2Title,
//       description: copy.feature2Desc,
//       image: "/screenshots/units.png",
//     },
//     {
//       icon: <Globe className="w-8 h-8" />,
//       title: copy.feature3Title,
//       description: copy.feature3Desc,
//       image: "/screenshots/sgc-hummingbird.png", // You'll need this
//     },
//     {
//       icon: <Users className="w-8 h-8" />,
//       title: copy.feature4Title,
//       description: copy.feature4Desc,
//       image: "classroom.jpeg", // You'll need this
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [heroImages.length]);

//   useEffect(() => {
//     const featureInterval = setInterval(() => {
//       setActiveFeature((prev) => (prev + 1) % features.length);
//     }, 5000);
//     return () => clearInterval(featureInterval);
//   }, [features.length]);

//   return (
//     <div className="font-josefin min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//       {/* Hero Section */}
//       <section className="relative py-16 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
//           <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500 rounded-full blur-2xl"></div>
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             {/* Hero Content */}
//             <motion.div
//               className="text-center lg:text-left"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               {/* <motion.div
//                 className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 150+ Units • 50+ Countries • Real Impact
//               </motion.div> */}

//               <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
//                 <span className="bg-gradient-to-r from-blue-600 to-green-600 dark:text-accent-50 bg-clip-text text-transparent">
//                   {copy.heroTitle}
//                 </span>
//               </h1>

//               <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
//                 {copy.heroSubtitle}
//               </p>

//               {/* <motion.div
//                 className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
//                   <Link href="/units" className="flex items-center gap-2">
//                     {copy.startFree}
//                     <ArrowRight className="w-5 h-5" />
//                   </Link>
//                 </Button>

//                 <Button className="border-2 bg-primary-900 dark:bg-accent-50 border-gray-300 dark:border-gray-600 hover:border-green-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
//                   <Link href="/pricing" className="flex items-center gap-2">
//                     {copy.viewPricing}
//                   </Link>
//                 </Button>
//               </motion.div> */}

//               {/* Quick Demo Link */}
//               <motion.div
//                 className="mt-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 {/* <Link
//                   href="/eco-map"
//                   className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
//                 >
//                   <Play className="w-4 h-4" />
//                   {copy.exploreDemoButton}
//                 </Link> */}
//               </motion.div>
//             </motion.div>

//             {/* Hero Visual */}
//             <motion.div
//               className="relative"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//             >
//               <div className="relative w-full max-w-xl mx-auto">
//                 <motion.img
//                   key={currentImageIndex}
//                   src={heroImages[currentImageIndex].src}
//                   alt="Hero"
//                   className="w-full h-96 rounded-4xl object-cover shadow-2xl"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 1 }}
//                 />
//                 <motion.div
//                   className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.5 }}
//                 >
//                   <p className="text-sm font-medium text-center">
//                     {heroImages[currentImageIndex].caption}
//                   </p>
//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-gray-50 dark:bg-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl font-bold mb-4">{copy.featuresTitle}</h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//               Experience a revolutionary way to learn English through
//               environmental storytelling
//             </p>
//           </motion.div>

//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             {/* Feature Navigation */}
//             <div className="space-y-6">
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
//                     activeFeature === index
//                       ? "bg-white dark:bg-gray-700 shadow-lg border-l-4 border-green-500"
//                       : "bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700"
//                   }`}
//                   onClick={() => setActiveFeature(index)}
//                   initial={{ opacity: 0, x: -30 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div
//                       className={`p-3 rounded-lg ${
//                         activeFeature === index
//                           ? "bg-green-100 text-green-600"
//                           : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                       {feature.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-semibold mb-2">
//                         {feature.title}
//                       </h3>
//                       <p className="text-gray-600 dark:text-gray-300">
//                         {feature.description}
//                       </p>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Feature Image */}
//             <motion.div
//               className="relative"
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6 }}
//               viewport={{ once: true }}
//             >
//               <img
//                 src={features[activeFeature].image}
//                 alt={features[activeFeature].title}
//                 className="w-full h-96 rounded-xl object-cover shadow-2xl"
//               />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* For Schools Section */}
//       <section className="py-20 bg-blue-50 dark:bg-blue-950">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-4xl font-bold mb-6">{copy.schoolsTitle}</h2>
//               <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
//                 {copy.schoolsSubtitle}
//               </p>

//               <div className="space-y-4 mb-8">
//                 {[
//                   copy.schoolBenefit1,
//                   copy.schoolBenefit2,
//                   copy.schoolBenefit3,
//                   copy.schoolBenefit4,
//                 ].map((benefit, index) => (
//                   <div key={index} className="flex items-center gap-3">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span>{benefit}</span>
//                   </div>
//                 ))}
//               </div>

//               <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
//                 {copy.schoolsCTA}
//               </Button>
//             </motion.div>

//             <motion.div
//               className="relative"
//               initial={{ opacity: 0, x: 30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               viewport={{ once: true }}
//             >
//               <img
//                 src="/classroom.jpeg" // You'll need this image
//                 alt="Classroom using Neptune's Tribe"
//                 className="w-full h-96 rounded-xl object-cover shadow-2xl"
//               />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Mission Impact Section */}
//       <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl font-bold mb-6">{copy.missionTitle}</h2>
//             <p className="text-xl mb-8 opacity-90">{copy.missionText}</p>

//             <div className="grid md:grid-cols-2 gap-8">
//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <div className="text-3xl mb-2 w-full flex justify-center">
//                   <FishSymbol />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">
//                   {copy.missionTextOceanHeader}
//                 </h3>
//                 <p className="text-sm opacity-90">{copy.missionTextOCean}</p>
//               </div>
//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <div className="text-3xl mb-2 w-full flex justify-center">
//                   <LibraryBig />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">
//                   {copy.missionTextEducationHeader}
//                 </h3>
//                 <p className="text-sm opacity-90">
//                   {copy.missionTextEducation}
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Final CTA Section */}
//       <section className="py-20 bg-white dark:bg-gray-900">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl font-bold mb-6">{copy.ctaTitle}</h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
//               {copy.ctaSubtitle}
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl">
//                 <Link href="/units">{copy.ctaFree}</Link>
//               </Button>
//               <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
//                 <Link href="/pricing">{copy.ctaPremium}</Link>
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }

{
  /* Stats Section */
}
{
  /* <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                1,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {copy.statsLearners}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">
                {copy.statsCountries}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                150+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {copy.statsUnits}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600 mb-2">
                £5,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {copy.statsCharity}
              </div>
            </div>
          </motion.div>
        </div>
      </section> */
}
