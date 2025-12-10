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
import Link from "next/link";
import { getAllWorlds } from "@/data/worldsConfig";
import { translateWorlds } from "@/utils/i18n";

export default function LandingPageExplorers() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [worlds, setWorlds] = useState([]);
  const { lang } = useLanguage();

  const t = {
    en: {
      heroTitle: "An English learning journey through eight worlds.",
      heroSubtitle:
        "The first English learning platform with an environmental theme.",
      heroDescription:
        "Every week, our tribe explores a new ecosystem together. Discover amazing species, many of which are endangered. Help to save Earth's wildlife while increasing your command of English.",
      startFree: "Create an Account",
      upgradePro: "Go to Activities",
      createAccount: "Create an Account",
      exploreDemoButton: "Explore Our Interactive Map",

      // Community Focus
      communityTitle: "Why is Habitat perfect for you?",
      communitySubtitle:
        "Join hundreds of learners on a synchronised global journey",
      weeklyTheme: "Improve English",
      weeklyThemeSub:
        "You will expand your vocabulary and develop fluency through dynamic activities and games.",
      // liveClasses: "Live conversation classes",
      globalCommunity: "Problem-solving",
      globalCommunitySub:
        "By learning about rare species and inspiring projects, you will develop awareness of the world you live in, creativity, and problem-solving skills.",
      realImpact: "Environmental awareness",
      RealImpactSub:
        "Environmental awareness is already considered a crucial factor for professional development, and is increasingly valued by companies and the job market.",

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

      // Worlds Showcase
      worldsTitle: "An unforgettable adventure through 8 worlds.",
      worldsSubtitle:
        "Journey through diverse ecosystems from tropical rainforests to the depths of the ocean, and even back through time to meet extinct species.",

      // How It Works
      howItWorksTitle: "Why is Habitat perfect for your school?",
      step1Title: "Join the Tribe",
      step1Desc:
        "Sign up and take a quick English assessment to find your perfect tier",
      step2Title: "Improve English",
      step2Desc:
        "Your students will expand their vocabulary and develop fluency through dynamic activities and games.",
      step3Title: "Problem-solving",
      step3Desc:
        "By learning about rare species and inspiring projects, your students will develop awareness of the world they live in, creativity, and problem-solving skills.",
      step4Title: "Environmental awareness",
      step4Desc:
        "Environmental awareness is already considered a crucial factor for professional development, and is increasingly valued by companies and the job market.",

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
        "10% of all revenue goes directly to verified environmental NGOs.",

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
      heroTitle: "Uma jornada de inglês por oito mundos",
      heroSubtitle:
        "A  primeira plataforma de ensino de inglês com o tema meio ambiente.",
      heroDescription:
        "Toda semana, nossa tribo explora um novo ecossistema juntos. Descubra espécies incríveis, muitas delas ameaçadas de extinção. Ajude a salvar a vida selvagem da Terra enquanto aprimora seu domínio do inglês.",
      startFree: "Crie uma Conta",
      upgradePro: "Àrea do Aluno",
      exploreDemoButton: "Explore Nosso Mapa Interativo",

      // Community Focus
      communityTitle: "Por que Habitat é perfeito para você",
      communitySubtitle:
        "Join hundreds of learners on a synchronised global journey",
      weeklyTheme: "Melhorar inglês",
      weeklyThemeSub:
        "Você expandirá o seu vocabulário e desenvolverá a fluência através de atividades e jogos dinâmicos.",
      // liveClasses: "Live conversation classes",
      globalCommunity: "Resolução de problemas",
      globalCommunitySub:
        "Ao aprender sobre espécies raras e projetos inspiradores, você desenvolverá a consciência do mundo onde vive, a criatividade e habilidade de resolução de problemas.",
      realImpact: "Consciência ambiental",
      RealImpactSub:
        "A consciência ambiental já é considerada um fator crucial para o desenvolvimento profissional, sendo cada vez mais valorizada pelas empresas e pelo mercado de trabalho.",

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

      // Worlds Showcase
      worldsTitle: "Uma aventura inesquecível por 8 mundos ",
      worldsSubtitle:
        "Viaje por diversos ecossistemas, desde florestas tropicais até as profundezas do oceano, e até volte no tempo para conhecer espécies extintas.",

      // How It Works
      howItWorksTitle: "Por que Habitat é perfeito para sua escola?",
      step1Title: "Melhorar inglês",
      step1Desc:
        "Seus aunos irão expandir o vocabulário e desenvolver a fluencia através de atividades e jogos dinâmicos",
      step2Title: "Resolução de problemas",
      step2Desc:
        "Ao aprender sobre espécies raras e projetos inspiradores, os seus alunos desenvolverão a consciência do mundo onde vivem, a criatividade e habilidade de resolução de problema",
      step3Title: "Consciência ambiental",
      step3Desc:
        "A consciência ambiental já é considerada um fator crucial para o desenvolvimento profissional, sendo cada vez mais valorizada pelas empresas e pelo mercado de trabalho",
      step4Title: "Cause um Impacto",
      step4Desc: "10% da receita apoia projetos reais de proteção ambiental",

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
        "10% de toda a receita vai diretamente para ONGs ambientais verificadas que se dedicam à conservação dos oceanos.",

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
      src: "/landing-top/habitat-landing-main.png",
      caption: lang === "en" ? "Explore Our Planet" : "Explore Nosso Planeta",
    },
    // {
    //   src: "/eco/penguins.jpeg",
    //   caption: lang === "en" ? "Join the tribe!" : "Junte-se à tribo",
    // },

    // {
    //   src: "/landing-top/manu-national-park-peru.jpg",
    //   caption:
    //     lang === "en"
    //       ? "This week: Amazon Rainforest"
    //       : "Esta semana: Floresta Amazônica",
    // },
    // {
    //   src: "/landing-top/vaquitas.jpg",
    //   caption:
    //     lang === "en"
    //       ? "Next week: Endangered cetaceans"
    //       : "Próxima semana: Cetáceos ameaçados de extinção",
    // },
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
    // {
    //   icon: <Users className="w-12 h-12" />,
    //   title: copy.step1Title,
    //   description: copy.step1Desc,
    // },
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

  useEffect(() => {
    const allWorlds = getAllWorlds();
    const translatedWorlds = translateWorlds(allWorlds, lang);
    setWorlds(translatedWorlds);
  }, [lang]);

  return (
    <div className="font-sans min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Worlds Showcase */}
      <section className="py-10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {copy.heroTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              {copy.worldsSubtitle}
            </p>
            <div className="flex flex-row sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-gradient-to-r from-primary-700 to-green-700 hover:from-primary-800 hover:to-green-800 text-white px-4 py-2 lg:px-8 lg:py-2 rounded-lg text-[16px] md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center"
              >
                {copy.startFree}
                {/* <ArrowRight className="w-5 h-5" /> */}
              </Link>

              <Link
                href="/worlds"
                className="border-2 border-primary-900 text-primary-900 dark:text-primary-100 dark:border-primary-100 px-4 py-2 lg:px-8 lg:py-2 rounded-lg text-[16px] md:text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                {/* <Mic className="w-5 h-5" /> */}
                {copy.upgradePro}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {worlds.map((world, index) => (
              <div
                key={world.id}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* World Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={world.imageUrl}
                    alt={world.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {world.name}
                    </h3>
                  </div>
                </div>

                {/* World Description */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {world.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: world.color.primary }}
                    >
                      {world.adventures.length} Adventures
                    </span>
                    <Globe
                      className="w-5 h-5"
                      style={{ color: world.color.primary }}
                    />
                  </div>
                </div>

                {/* Hover overlay with "Explore" hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  {/* <span className="text-white font-semibold text-lg">
                    Coming Soon
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Habitat for your School */}
      <section className="pt-10 pb-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {copy.communityTitle}
            </h2>
            {/* <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {copy.communitySubtitle}
            </p> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                text: copy.weeklyTheme,
                textSub: copy.weeklyThemeSub,
                color: "blue",
              },
              // {
              //   icon: <MessageCircle className="w-8 h-8" />,
              //   text: copy.liveClasses,
              //   color: "green",
              // },
              {
                icon: <Users className="w-8 h-8" />,
                text: copy.globalCommunity,
                textSub: copy.globalCommunitySub,
                color: "purple",
              },
              {
                icon: <Fish className="w-8 h-8" />,
                text: copy.realImpact,
                textSub: copy.RealImpactSub,
                color: "cyan",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-full flex items-center justify-center mx-auto mb-3 text-${item.color}-600 dark:text-${item.color}-400`}
                >
                  {item.icon}
                </div>
                <h2 className="font-semibold text-xl mb-3">{item.text}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.textSub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-8 lg:pt-20 pb-20 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 overflow-hidden">
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-primary-600 to-green-600 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">
                  {copy.heroTitle}
                </span>
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-50 mb-8">
                {copy.heroSubtitle}
              </h2>

              {/* <p className="text-lg text-gray-500 dark:text-gray-200 mb-8 max-w-2xl">
                {copy.heroDescription}
              </p> */}

              <div className="flex flex-row sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-primary-700 to-green-700 hover:from-primary-800 hover:to-green-800 text-white px-4 py-2 lg:px-8 lg:py-4 rounded-lg text-[16px] md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  {copy.startFree}
                  {/* <ArrowRight className="w-5 h-5" /> */}
                </Link>

                <Link
                  href="/worlds"
                  className="border-2 border-primary-900 text-primary-900 dark:text-primary-100 dark:border-primary-100 px-4 py-2 lg:px-8 lg:py-4 rounded-lg text-[16px] md:text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  {/* <Mic className="w-5 h-5" /> */}
                  {copy.upgradePro}
                </Link>
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
                  className=" w-fit h-auto md:w-full md:h-96 rounded-3xl object-cover shadow-2xl transition-opacity duration-1000"
                />
                {/* <div className="absolute bottom-32 right-28 bg-white/90 dark:bg-accent-700/20 backdrop-blur-sm rounded-2xl p-3">
                  <p className="text-sm font-medium text-center">
                    {heroImages[currentImageIndex].caption}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {/* <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{copy.howItWorksTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white relative">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 dark:text-white">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import {
//   Play,
//   MapPin,
//   BookOpen,
//   Users,
//   Globe,
//   Award,
//   ArrowRight,
//   CheckCircle,
//   Fish,
//   Library,
//   MessageCircle,
//   Calendar,
//   Vote,
//   Mic,
//   Map,
//   Star,
//   Crown,
// } from "lucide-react";
// import Link from "next/link";
// import { getAllWorlds } from "@/data/worldsConfig";

// export default function LandingPageSchools() {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [activeFeature, setActiveFeature] = useState(0);
//   const { lang } = useLanguage();

//   const t = {
//     en: {
//       heroTitle: "An English learning journey through eight worlds.",
//       heroSubtitle:
//         "The first English learning platform with an environmental theme.",
//       heroDescription:
//         "Every week, our tribe explores a new ecosystem together. Discover amazing species, many of which are endangered. Help to save Earth's wildlife while increasing your command of English.",
//       startFree: "Create an Account",
//       upgradePro: "Student Area",
//       exploreDemoButton: "Explore Our Interactive Map",

//       // Community Focus
//       communityTitle: "Why is Habitat perfect for your school?",
//       communitySubtitle:
//         "Join hundreds of learners on a synchronised global journey",
//       weeklyTheme: "Improve English",
//       weeklyThemeSub:
//         "Your students will expand their vocabulary and develop fluency through dynamic activities and games.",
//       // liveClasses: "Live conversation classes",
//       globalCommunity: "Problem-solving",
//       globalCommunitySub:
//         "By learning about rare species and inspiring projects, your students will develop awareness of the world they live in, creativity, and problem-solving skills.",
//       realImpact: "Environmental awareness",
//       RealImpactSub:
//         "Environmental awareness is already considered a crucial factor for professional development, and is increasingly valued by companies and the job market.",

//       // Features
//       featuresTitle: "Your Weekly Eco-Adventure Includes",
//       feature1Title: "Live Conversation Classes",
//       feature1Desc:
//         "Join weekly English conversation sessions focussed on that week's ecosystem with max 8 participants",

//       feature2Title: "Interactive Learning Journey",
//       feature2Desc:
//         "A rich selection of units about species and environments from the region you're exploring each week",

//       feature3Title: "Community Exploration",
//       feature3Desc:
//         "Follow our interactive world map as the tribe moves together from ecosystem to ecosystem",

//       feature4Title: "Premium Member Voting",
//       feature4Desc:
//         "Premium members vote on next week's destination - help shape the tribe's journey",

//       // Tiers
//       tiersTitle: "Choose Your Tribe Level",
//       tiersSubtitle:
//         "All members explore the same ecosystem each week, but at different levels of participation",

//       explorerTitle: "Explorer",
//       explorerSub: "Follow the journey",
//       explorerFeatures: [
//         "Access to all weekly learning units and challenges",
//         "Access to weekly conversation lessons as a listener",
//         "Eco Map access",
//         // "Progress tracking",
//         "Access to eco-news",
//       ],

//       proTitle: "Pro",
//       proSub: "Speak in the classes",
//       proFeatures: [
//         "All Explorer features, plus:",
//         "Full Access to weekly converstation lessons as a participant",
//         // "Advanced progress analytics",
//         // "Priority support",
//         "Certificate generation",
//       ],

//       premiumTitle: "Premium",
//       premiumSub: "Shape the journey",
//       premiumFeatures: [
//         "All Pro features, plus:",
//         "Voting rights on weekly topics",
//         "Participation in podcasts with special guests",
//       ],
//       viewAllTiers: "View all tiers and pricing",

//       // Worlds Showcase
//       worldsTitle: "An unforgettable adventure through 8 worlds.",
//       worldsSubtitle:
//         "Journey through diverse ecosystems from tropical rainforests to the depths of the ocean, and even back through time to meet extinct species.",

//       // How It Works
//       howItWorksTitle: "Why is Habitat perfect for your school?",
//       step1Title: "Join the Tribe",
//       step1Desc:
//         "Sign up and take a quick English assessment to find your perfect tier",
//       step2Title: "Improve English",
//       step2Desc:
//         "Your students will expand their vocabulary and develop fluency through dynamic activities and games.",
//       step3Title: "Problem-solving",
//       step3Desc:
//         "By learning about rare species and inspiring projects, your students will develop awareness of the world they live in, creativity, and problem-solving skills.",
//       step4Title: "Environmental awareness",
//       step4Desc:
//         "Environmental awareness is already considered a crucial factor for professional development, and is increasingly valued by companies and the job market.",

//       // Social Proof
//       testimonialTitle: "What Our Tribe Says",
//       testimonial1:
//         "The live classes are incredible! I'm learning about rainforests while improving my English with people from around the world.",
//       testimonial1Author: "Carlos Silva, Pro Member",
//       testimonial2:
//         "My students love following the weekly journey. They can't wait to see which ecosystem we'll explore next!",
//       testimonial2Author: "Dr. Sarah Chen, Educator",
//       testimonial3:
//         "Being able to vote on our destinations makes me feel like I'm really part of shaping this community.",
//       testimonial3Author: "Anna Kowalski, Premium Member",

//       // For Schools
//       schoolsTitle: "Transform Your English Curriculum",
//       schoolsSubtitle:
//         "Give your students a synchronized global learning experience",
//       schoolBenefit1: "Weekly structured curriculum",
//       schoolBenefit2: "Student engagement tracking",
//       schoolBenefit3: "Professional conversation facilitation",
//       schoolBenefit4: "Real environmental impact",
//       schoolsCTA: "Schedule School Demo",

//       // Mission
//       missionTitle: "Learning That Changes the World",
//       missionText:
//         "Every conversation class helps fund real conservation. Join a community where learning English means protecting our planet.",
//       oceanTitle: "Environmental conservation",
//       oceanSubtitle:
//         "10% of all revenue goes directly to verified environmental NGOs.",

//       // CTA
//       ctaTitle: "Ready to Join the Tribe?",
//       ctaSubtitle: "Start your weekly eco-journey with learners worldwide",
//       ctaFree: "Start as an Explorer",
//       ctaPremium: "Join Pro Classes",

//       // FAQ
//       faq: "Frequently Asked Questions",
//       faq1: "How do the live classes work?",
//       faq1Answer:
//         "Every week we focus on a new ecosystem. Pro and Premium members join live conversation classes (max 8 people) while Explorer members can listen in.",
//       faq2: "What if my English isn't ready for live classes?",
//       faq2Answer:
//         "Perfect! Start as an Explorer to access all content and listen to classes. When you're ready, upgrade to Pro to participate actively.",
//       faq3: "How do Premium members vote?",
//       faq3Answer:
//         "Premium members vote each Thursday on the following week's ecosystem destination. Democracy in action!",
//     },
//     pt: {
//       heroTitle: "Uma jornada de inglês por oito mundos",
//       heroSubtitle:
//         "A  primeira plataforma de ensino de inglês com o tema meio ambiente.",
//       heroDescription:
//         "Toda semana, nossa tribo explora um novo ecossistema juntos. Descubra espécies incríveis, muitas delas ameaçadas de extinção. Ajude a salvar a vida selvagem da Terra enquanto aprimora seu domínio do inglês.",
//       startFree: "Crie uma Conta",
//       upgradePro: "Àrea do Aluno",
//       exploreDemoButton: "Explore Nosso Mapa Interativo",

//       // Community Focus
//       communityTitle: "Por que Habitat é perfeito para sua escola?",
//       communitySubtitle:
//         "Join hundreds of learners on a synchronised global journey",
//       weeklyTheme: "Melhorar inglês",
//       weeklyThemeSub:
//         "Seus aunos irão expandir o vocabulário e desenvolver a fluência através de atividades e jogos dinâmicos.",
//       // liveClasses: "Live conversation classes",
//       globalCommunity: "Resolução de problemas",
//       globalCommunitySub:
//         "Ao aprender sobre espécies raras e projetos inspiradores, os seus alunos desenvolverão a consciência do mundo onde vivem, a criatividade e habilidade de resolução de problema.",
//       realImpact: "Consciência ambiental",
//       RealImpactSub:
//         "A consciência ambiental já é considerada um fator crucial para o desenvolvimento profissional, sendo cada vez mais valorizada pelas empresas e pelo mercado de trabalho.",

//       // Features
//       featuresTitle: "Sua Aventura Ecológica Semanal Inclui",
//       feature1Title: "Aulas de Conversação ao Vivo",
//       feature1Desc:
//         "Participe de sessões semanais de conversação em inglês focadas no ecossistema da semana com máx. 8 participantes",

//       feature2Title: "Jornada de Aprendizado Interativa",
//       feature2Desc:
//         "Uma grande seleção de unidades ricas sobre espécies e ambientes da região que você está explorando cada semana",

//       feature3Title: "Exploração Comunitária",
//       feature3Desc:
//         "Siga nosso mapa mundial interativo enquanto a tribo se move junta de ecossistema em ecossistema",

//       feature4Title: "Votação de Membros Premium",
//       feature4Desc:
//         "Membros Premium votam no destino da próxima semana - ajude a moldar a jornada da tribo",

//       // Tiers
//       tiersTitle: "Escolha Seu Nível na Tribo",
//       tiersSubtitle:
//         "Todos os membros exploram o mesmo ecossistema cada semana, mas em diferentes níveis de participação",

//       explorerTitle: "Explorer",
//       explorerSub: "Siga a jornada",
//       explorerFeatures: [
//         "Acesso a todas as unidades de aprendizagem e desafios semanais",
//         "Acesso às aulas semanais de conversação como ouvinte",
//         "Acesso ao Mapa Ecológico",
//         // "Acompanhamento de progresso",
//         "Acesso ao Eco News",
//       ],

//       proTitle: "Pro",
//       proSub: "Fale nas aulas",
//       proFeatures: [
//         "Todos os recursos do Explorer, mais:",
//         "Acesso total às aulas semanais de conversação como participante",
//         // "Análise avançada de progresso",
//         // "Suporte prioritário",
//         "Geração de certificados",
//       ],

//       premiumTitle: "Premium",
//       premiumSub: "Molde a jornada",
//       premiumFeatures: [
//         "Todos os recursos do Pro, mais:",
//         "Direito de voto em tópicos semanais",
//         "Participação em podcasts com convidados especiais",
//       ],
//       viewAllTiers: "Ver todos os níveis e preços",

//       // Worlds Showcase
//       worldsTitle: "Uma aventura inesquecível por 8 mundos ",
//       worldsSubtitle:
//         "Viaje por diversos ecossistemas, desde florestas tropicais até as profundezas do oceano, e até volte no tempo para conhecer espécies extintas.",

//       // How It Works
//       howItWorksTitle: "Por que Habitat é perfeito para sua escola?",
//       step1Title: "Melhorar inglês",
//       step1Desc:
//         "Seus aunos irão expandir o vocabulário e desenvolver a fluencia através de atividades e jogos dinâmicos",
//       step2Title: "Resolução de problemas",
//       step2Desc:
//         "Ao aprender sobre espécies raras e projetos inspiradores, os seus alunos desenvolverão a consciência do mundo onde vivem, a criatividade e habilidade de resolução de problema",
//       step3Title: "Consciência ambiental",
//       step3Desc:
//         "A consciência ambiental já é considerada um fator crucial para o desenvolvimento profissional, sendo cada vez mais valorizada pelas empresas e pelo mercado de trabalho",
//       step4Title: "Cause um Impacto",
//       step4Desc: "10% da receita apoia projetos reais de proteção ambiental",

//       // Social Proof
//       testimonialTitle: "O Que Nossa Tribo Diz",
//       testimonial1:
//         "As aulas ao vivo são incríveis! Estou aprendendo sobre florestas tropicais enquanto melhoro meu inglês com pessoas do mundo todo.",
//       testimonial1Author: "Carlos Silva, Membro Pro",
//       testimonial2:
//         "Meus alunos adoram seguir a jornada semanal. Mal podem esperar para ver qual ecossistema vamos explorar!",
//       testimonial2Author: "Dra. Sarah Chen, Educadora",
//       testimonial3:
//         "Poder votar nos nossos destinos me faz sentir que realmente faço parte de moldar esta comunidade.",
//       testimonial3Author: "Anna Kowalski, Membro Premium",

//       // For Schools
//       schoolsTitle: "Transforme Seu Currículo de Inglês",
//       schoolsSubtitle:
//         "Dê aos seus alunos uma experiência global sincronizada de aprendizado",
//       schoolBenefit1: "Currículo estruturado semanal",
//       schoolBenefit2: "Acompanhamento de engajamento dos alunos",
//       schoolBenefit3: "Facilitação profissional de conversação",
//       schoolBenefit4: "Impacto ambiental real",
//       schoolsCTA: "Agende Demo para Escola",

//       // Mission
//       missionTitle: "Aprendizado Que Muda o Mundo",
//       missionText:
//         "Cada aula de conversação ajuda a financiar conservação real. Junte-se a uma comunidade onde aprender inglês significa proteger nosso planeta.",
//       oceanTitle: "Proteção ambiental",
//       oceanSubtitle:
//         "10% de toda a receita vai diretamente para ONGs ambientais verificadas que se dedicam à conservação dos oceanos.",

//       // CTA
//       ctaTitle: "Pronto para Se Juntar à Tribo?",
//       ctaSubtitle:
//         "Comece sua jornada ecológica semanal com estudantes do mundo todo",
//       ctaFree: "Comece como Explorer",
//       ctaPremium: "Participe das Aulas Pro",

//       // FAQ
//       faq: "Perguntas Frequentes",
//       faq1: "Como funcionam as aulas ao vivo?",
//       faq1Answer:
//         "Toda semana focamos num novo ecossistema. Membros Pro e Premium participam de aulas de conversação ao vivo (máx. 8 pessoas) enquanto membros Explorer podem ouvir.",
//       faq2: "E se meu inglês não estiver pronto para aulas ao vivo?",
//       faq2Answer:
//         "Perfeito! Comece como Explorer para acessar todo conteúdo e ouvir as aulas. Quando estiver pronto, faça upgrade para Pro para participar ativamente.",
//       faq3: "Como os membros Premium votam?",
//       faq3Answer:
//         "Membros Premium votam toda quinta-feira no destino ecossistêmico da semana seguinte. Democracia em ação!",
//     },
//   };

//   const copy = t[lang];

//   const heroImages = [
//     {
//       src: "/landing-top/habitat-landing-main.png",
//       caption:
//         lang === "en"
//           ? "Meet conservation heroes"
//           : "Conheça heróis da conservação",
//     },
//     // {
//     //   src: "/eco/penguins.jpeg",
//     //   caption: lang === "en" ? "Join the tribe!" : "Junte-se à tribo",
//     // },

//     // {
//     //   src: "/landing-top/manu-national-park-peru.jpg",
//     //   caption:
//     //     lang === "en"
//     //       ? "This week: Amazon Rainforest"
//     //       : "Esta semana: Floresta Amazônica",
//     // },
//     // {
//     //   src: "/landing-top/vaquitas.jpg",
//     //   caption:
//     //     lang === "en"
//     //       ? "Next week: Endangered cetaceans"
//     //       : "Próxima semana: Cetáceos ameaçados de extinção",
//     // },
//   ];

//   const features = [
//     {
//       icon: <MessageCircle className="w-8 h-8" />,
//       title: copy.feature1Title,
//       description: copy.feature1Desc,
//       image: "/screenshots/conversation-class.png",
//     },
//     {
//       icon: <BookOpen className="w-8 h-8" />,
//       title: copy.feature2Title,
//       description: copy.feature2Desc,
//       image: "/screenshots/units.png",
//     },
//     {
//       icon: <Map className="w-8 h-8" />,
//       title: copy.feature3Title,
//       description: copy.feature3Desc,
//       image: "/screenshots/eco-map-preview.png",
//     },
//     {
//       icon: <Vote className="w-8 h-8" />,
//       title: copy.feature4Title,
//       description: copy.feature4Desc,
//       image: "/screenshots/voting-interface.png",
//     },
//   ];

//   const steps = [
//     // {
//     //   icon: <Users className="w-12 h-12" />,
//     //   title: copy.step1Title,
//     //   description: copy.step1Desc,
//     // },
//     {
//       icon: <Calendar className="w-12 h-12" />,
//       title: copy.step2Title,
//       description: copy.step2Desc,
//     },
//     {
//       icon: <MessageCircle className="w-12 h-12" />,
//       title: copy.step3Title,
//       description: copy.step3Desc,
//     },
//     {
//       icon: <Fish className="w-12 h-12" />,
//       title: copy.step4Title,
//       description: copy.step4Desc,
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
//     <div className="font-sans min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//       {/* Hero Section */}
//       <section className="relative pt-8 lg:pt-20 pb-20 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
//           <div
//             className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse"
//             style={{ animationDelay: "1s" }}
//           ></div>
//           <div
//             className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500 rounded-full blur-2xl animate-pulse"
//             style={{ animationDelay: "0.5s" }}
//           ></div>
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
//             {/* Hero Content */}
//             <div className="text-center lg:text-left">
//               <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
//                 <span className="bg-gradient-to-r from-primary-600 to-green-600 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">
//                   {copy.heroTitle}
//                 </span>
//               </h1>
//               <h2 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-50 mb-8">
//                 {copy.heroSubtitle}
//               </h2>

//               {/* <p className="text-lg text-gray-500 dark:text-gray-200 mb-8 max-w-2xl">
//                 {copy.heroDescription}
//               </p> */}

//               <div className="flex flex-row sm:flex-row gap-4 justify-center lg:justify-start">
//                 <Link
//                   href="/login"
//                   className="bg-gradient-to-r from-primary-700 to-green-700 hover:from-primary-800 hover:to-green-800 text-white px-4 py-2 lg:px-8 lg:py-4 rounded-lg text-[16px] md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center"
//                 >
//                   {copy.startFree}
//                   {/* <ArrowRight className="w-5 h-5" /> */}
//                 </Link>

//                 <Link
//                   href="/worlds"
//                   className="border-2 border-primary-900 text-primary-900 dark:text-primary-100 dark:border-primary-100 px-4 py-2 lg:px-8 lg:py-4 rounded-lg text-[16px] md:text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
//                 >
//                   {/* <Mic className="w-5 h-5" /> */}
//                   {copy.upgradePro}
//                 </Link>
//               </div>

//               {/* Demo Link */}
//               {/* <div className="mt-6">
//                 <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
//                   <Play className="w-4 h-4" />
//                   {copy.exploreDemoButton}
//                 </button>
//               </div> */}
//             </div>

//             {/* Hero Visual */}
//             <div className="relative">
//               <div className="relative w-full max-w-xl mx-auto">
//                 <img
//                   src={heroImages[currentImageIndex].src}
//                   alt="Hero"
//                   className="w-full h-96 rounded-3xl object-cover shadow-2xl transition-opacity duration-1000"
//                 />
//                 {/* <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3">
//                   <p className="text-sm font-medium text-center">
//                     {heroImages[currentImageIndex].caption}
//                   </p>
//                 </div> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Why Habitat for your School */}
//       <section className="pt-16 pb-16 bg-gray-50 dark:bg-gray-800">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold mb-4">
//               {copy.communityTitle}
//             </h2>
//             {/* <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//               {copy.communitySubtitle}
//             </p> */}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: <Calendar className="w-8 h-8" />,
//                 text: copy.weeklyTheme,
//                 textSub: copy.weeklyThemeSub,
//                 color: "blue",
//               },
//               // {
//               //   icon: <MessageCircle className="w-8 h-8" />,
//               //   text: copy.liveClasses,
//               //   color: "green",
//               // },
//               {
//                 icon: <Users className="w-8 h-8" />,
//                 text: copy.globalCommunity,
//                 textSub: copy.globalCommunitySub,
//                 color: "purple",
//               },
//               {
//                 icon: <Fish className="w-8 h-8" />,
//                 text: copy.realImpact,
//                 textSub: copy.RealImpactSub,
//                 color: "cyan",
//               },
//             ].map((item, i) => (
//               <div key={i} className="text-center">
//                 <div
//                   className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-full flex items-center justify-center mx-auto mb-3 text-${item.color}-600 dark:text-${item.color}-400`}
//                 >
//                   {item.icon}
//                 </div>
//                 <h2 className="font-semibold text-xl mb-3">{item.text}</h2>
//                 <p className="text-gray-600 dark:text-gray-300">
//                   {item.textSub}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Worlds Showcase */}
//       <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               {copy.worldsTitle}
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//               {copy.worldsSubtitle}
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {getAllWorlds().map((world, index) => (
//               <div
//                 key={world.id}
//                 className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
//               >
//                 {/* World Image */}
//                 <div className="relative h-48 overflow-hidden">
//                   <img
//                     src={world.imageUrl}
//                     alt={world.name}
//                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                   <div className="absolute bottom-4 left-4 right-4">
//                     <h3 className="text-2xl font-bold text-white mb-1">
//                       {world.name}
//                     </h3>
//                   </div>
//                 </div>

//                 {/* World Description */}
//                 <div className="p-6">
//                   <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
//                     {world.description}
//                   </p>
//                   <div className="mt-4 flex items-center justify-between">
//                     <span
//                       className="text-xs font-semibold px-3 py-1 rounded-full text-white"
//                       style={{ backgroundColor: world.color.primary }}
//                     >
//                       {world.adventures.length} Adventures
//                     </span>
//                     <Globe
//                       className="w-5 h-5"
//                       style={{ color: world.color.primary }}
//                     />
//                   </div>
//                 </div>

//                 {/* Hover overlay with "Explore" hint */}
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
//                   {/* <span className="text-white font-semibold text-lg">
//                     Coming Soon
//                   </span> */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       {/* <section className="py-20 bg-gray-50 dark:bg-gray-800">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">{copy.howItWorksTitle}</h2>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {steps.map((step, i) => (
//               <div key={i} className="text-center">
//                 <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white relative">
//                   {step.icon}
//                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 dark:text-white">
//                     {i + 1}
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
//                 <p className="text-gray-600 dark:text-gray-300">
//                   {step.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section> */}
//     </div>
//   );
// }
