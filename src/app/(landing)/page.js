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

export default function LandingPageSchools() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const { lang } = useLanguage();

  const t = {
    en: {
      heroTitle: "Join Habitat English Conversation Journey",
      heroSubtitle:
        "Enrich your English as you go on environmental adventures around our planet",
      heroDescription:
        "Every week, our tribe explores a new ecosystem together. Discover amazing species, many of which are endangered. Help to save Earth's wildlife while increasing your command of English.",
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
      howItWorksTitle: "How Habitat English Works",
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
        "10% of revenue supports real environmental protection projects",

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
      heroTitle: "Junte-se à Habitat English",
      heroSubtitle:
        "Enriqueça seu inglês enquanto você embarca em aventuras ambientais ao redor do nosso planeta",
      heroDescription:
        "Toda semana, nossa tribo explora um novo ecossistema juntos. Descubra espécies incríveis, muitas delas ameaçadas de extinção. Ajude a salvar a vida selvagem da Terra enquanto aprimora seu domínio do inglês.",
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
        "Toda segunda-feira, descubra um novo ecossistema com conteúdo inédito e aulas ao vivo",
      step3Title: "Aprenda e Conecte",
      step3Desc:
        "Pratique inglês enquanto aprende sobre conservação com outros membros da tribo",
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
      // src: "/landing-top/new-guinea-people-paddling.jpg",
      // src: "/landing-top/marcus-woodbridge-campfire.jpg",
      src: "/eco/penguins.jpeg",
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
          ? "This week: Amazon Rainforest"
          : "Esta semana: Floresta Amazônica",
    },
    {
      src: "/landing-top/vaquitas.jpg",
      caption:
        lang === "en"
          ? "Next week: Endangered cetaceans"
          : "Próxima semana: Cetáceos ameaçados de extinção",
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
                {copy.weeklyTheme}
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
                {/* <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center">
                  {copy.startFree}
                  <ArrowRight className="w-5 h-5" />
                </button> */}

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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                text: copy.weeklyTheme,
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
    </div>
  );
}

// "use client";

// import Link from "next/link";

// // import Link from "next/link";

// export default function landingPageHome({ darkMode }) {
//   return (
//     // <div className="w-full flex justify-center bg-white dark:bg-primary-950">
//     //   <img src="/landing/Habitat-landing-slogan.png" alt="Hero" className="" />
//     // </div>
//     <div className="relative transform-3d">
//       <div className="top-1/2 left-1/2 flex justify-center rounded-b-xl bg-white dark:bg-primary-950">
//         <img
//           src="/landing/Habitat-landing-slogan.png"
//           alt="Hero"
//           className="hidden sm:block xl:px-32"
//         />
//         <img
//           src="/landing/Habitat-landing-mobile-5.png"
//           // src={darkMode ? landingDarkMode : landingLightMode}
//           alt="Hero"
//           className="object-top h-10/12 overflow-hidden sm:hidden"
//         />
//       </div>
//       <div className="flex justify-center gap-8 pt-4 pb-4">
//         <Link href="/schools">
//           <p className="block sm:invisible text-[10px] md:text-[12px] xl:text-sm  text-primary-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-200 border-b-1 px-2 py-1 border-primary-900 hover:border-accent-600 dark:border-white dark:hover:border-accent-200 rounded-xl hover:translate-z-192">
//             {" "}
//             FOR SCHOOLS
//           </p>
//         </Link>
//         <Link href="/explorers">
//           <p className="block sm:invisible text-[10px] md:text-[12px] xl:text-sm  text-primary-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-200 border-b-1 px-2 py-1 border-primary-900 hover:border-accent-600 dark:border-white dark:hover:border-accent-200 rounded-xl hover:translate-z-192">
//             {" "}
//             SOLO EXPLORERS
//           </p>
//         </Link>
//       </div>
//     </div>
//   );
// }
