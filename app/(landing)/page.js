"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Button } from "@/components/ui/buttonLanding";
import Footer from "@/components/Footer";
import {
  Play,
  MapPin,
  BookOpen,
  Users,
  Globe,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage({ darkMode = false }) {
  const { lang } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const t = {
    en: {
      heroTitle: "Learn English. Explore the Planet. Save Our Oceans.",
      heroSubtitle:
        "Join 1,000+ learners mastering English through real environmental stories from 50+ countries",
      heroCall: "Start your eco-journey today",
      startFree: "Start Free",
      viewPricing: "View Pricing",
      exploreDemoButton: "Explore Live Demo",

      // Features
      featuresTitle: "Why Neptune's Tribe?",
      feature1Title: "Interactive World Map",
      feature1Desc:
        "Track your learning journey across countries and marine ecosystems",
      feature2Title: "150+ Rich Learning Units",
      feature2Desc:
        "Discover wildlife, ecosystems, and environmental heroes from every continent",
      feature3Title: "Project-Based Learning",
      feature3Desc:
        "Solve real environmental challenges while improving your English",
      feature4Title: "For Schools & Individuals",
      feature4Desc: "Perfect for classrooms or personal learning adventures",

      // Stats
      statsLearners: "Active Learners",
      statsCountries: "Countries Covered",
      statsUnits: "Learning Units",
      statsCharity: "Donated to Ocean Conservation",

      // Social Proof
      testimonialTitle: "What Our Community Says",
      testimonial1:
        "My students are completely engaged! They're learning English while solving real environmental problems.",
      testimonial1Author: "Maria Santos, ESL Teacher",
      testimonial2:
        "I never thought learning English could help save the oceans. This platform is incredible!",
      testimonial2Author: "Ahmed Hassan, Student",

      // For Schools
      schoolsTitle: "Perfect for Schools & Educators",
      schoolsSubtitle:
        "Transform your English curriculum with project-based environmental learning",
      schoolBenefit1: "Classroom management tools",
      schoolBenefit2: "Progress tracking for all students",
      schoolBenefit3: "Curriculum aligned content",
      schoolBenefit4: "Teacher training & support",
      schoolsCTA: "Book School Demo",

      // Mission
      missionTitle: "Learning That Makes a Difference",
      missionText:
        "Every lesson supports real ocean conservation projects. 25% of all revenue goes directly to environmental charities.",

      // CTA
      ctaTitle: "Ready to Start Your Eco-Journey?",
      ctaSubtitle: "Join thousands of learners making a difference",
      ctaFree: "Start Free Today",
      ctaPremium: "Go Premium",
    },
    pt: {
      heroTitle: "Aprenda Inglês. Explore o Planeta. Salve Nossos Oceanos.",
      heroSubtitle:
        "Junte-se a mais de 1.000 alunos dominando o inglês através de histórias ambientais reais de mais de 50 países",
      heroCall: "Comece sua jornada ecológica hoje",
      startFree: "Comece Grátis",
      viewPricing: "Ver Preços",
      exploreDemoButton: "Explorar Demo",

      // Features
      featuresTitle: "Por que Neptune's Tribe?",
      feature1Title: "Mapa Mundial Interativo",
      feature1Desc:
        "Acompanhe sua jornada de aprendizado por países e ecossistemas marinhos",
      feature2Title: "150+ Unidades de Aprendizado",
      feature2Desc:
        "Descubra vida selvagem, ecossistemas e heróis ambientais de todos os continentes",
      feature3Title: "Aprendizado Baseado em Projetos",
      feature3Desc:
        "Resolva desafios ambientais reais enquanto melhora seu inglês",
      feature4Title: "Para Escolas e Indivíduos",
      feature4Desc:
        "Perfeito para salas de aula ou aventuras de aprendizado pessoal",

      // Stats
      statsLearners: "Alunos Ativos",
      statsCountries: "Países Cobertos",
      statsUnits: "Unidades de Aprendizado",
      statsCharity: "Doado para Conservação Oceânica",

      // Social Proof
      testimonialTitle: "O Que Nossa Comunidade Diz",
      testimonial1:
        "Meus alunos estão completamente engajados! Eles aprendem inglês resolvendo problemas ambientais reais.",
      testimonial1Author: "Maria Santos, Professora de ESL",
      testimonial2:
        "Nunca pensei que aprender inglês pudesse ajudar a salvar os oceanos. Esta plataforma é incrível!",
      testimonial2Author: "Ahmed Hassan, Estudante",

      // For Schools
      schoolsTitle: "Perfeito para Escolas e Educadores",
      schoolsSubtitle:
        "Transforme seu currículo de inglês com aprendizado ambiental baseado em projetos",
      schoolBenefit1: "Ferramentas de gestão de sala",
      schoolBenefit2: "Acompanhamento de progresso para todos os alunos",
      schoolBenefit3: "Conteúdo alinhado ao currículo",
      schoolBenefit4: "Treinamento e suporte para professores",
      schoolsCTA: "Agendar Demo Escolar",

      // Mission
      missionTitle: "Aprendizado Que Faz a Diferença",
      missionText:
        "Cada lição apoia projetos reais de conservação oceânica. 25% de toda receita vai diretamente para organizações ambientais.",

      // CTA
      ctaTitle: "Pronto para Começar Sua Jornada Ecológica?",
      ctaSubtitle: "Junte-se a milhares de alunos fazendo a diferença",
      ctaFree: "Comece Grátis Hoje",
      ctaPremium: "Vá Premium",
    },
  };

  const copy = t[lang];

  const heroImages = [
    {
      src: "/eco/penguins.jpeg",
      caption:
        lang === "en"
          ? "Explore Antarctic ecosystems"
          : "Explore ecossistemas antárticos",
    },
    {
      src: "/heroes/farwiza-farhan-with-elephant.jpeg",
      caption:
        lang === "en"
          ? "Meet environmental heroes"
          : "Conheça heróis ambientais",
    },
    {
      src: "/eco/vaquitas.jpg",
      caption:
        lang === "en" ? "Save endangered species" : "Salve espécies ameaçadas",
    },
  ];

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: copy.feature1Title,
      description: copy.feature1Desc,
      image: "/screenshots/eco-map-preview.png", // You'll need this
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: copy.feature2Title,
      description: copy.feature2Desc,
      image: "/screenshots/units.png",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: copy.feature3Title,
      description: copy.feature3Desc,
      image: "/screenshots/sgc-hummingbird.png", // You'll need this
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: copy.feature4Title,
      description: copy.feature4Desc,
      image: "/screenshots/classroom-view.jpg", // You'll need this
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
    <div className="font-josefin min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative py-16 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                🌊 150+ Units • 50+ Countries • Real Impact
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 dark:text-gray-300 bg-clip-text text-transparent">
                  {copy.heroTitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                {copy.heroSubtitle}
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Link href="/units" className="flex items-center gap-2">
                    {copy.startFree}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                <Button className="border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                  <Link href="/pricing" className="flex items-center gap-2">
                    {copy.viewPricing}
                  </Link>
                </Button>
              </motion.div>

              {/* Quick Demo Link */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  href="/eco-map"
                  className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
                >
                  <Play className="w-4 h-4" />
                  {copy.exploreDemoButton}
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-full max-w-xl mx-auto">
                <motion.img
                  key={currentImageIndex}
                  src={heroImages[currentImageIndex].src}
                  alt="Hero"
                  className="w-full h-96 rounded-4xl object-cover shadow-2xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                />
                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm font-medium text-center">
                    {heroImages[currentImageIndex].caption}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
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
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">{copy.featuresTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience a revolutionary way to learn English through
              environmental storytelling
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-white dark:bg-gray-700 shadow-lg border-l-4 border-green-500"
                      : "bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveFeature(index)}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        activeFeature === index
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
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
                </motion.div>
              ))}
            </div>

            {/* Feature Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                className="w-full h-96 rounded-xl object-cover shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section className="py-20 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
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

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
                {copy.schoolsCTA}
              </Button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="/screenshots/classroom-view.jpg" // You'll need this image
                alt="Classroom using Neptune's Tribe"
                className="w-full h-96 rounded-xl object-cover shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Impact Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{copy.missionTitle}</h2>
            <p className="text-xl mb-8 opacity-90">{copy.missionText}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl mb-2">🌊</div>
                <h3 className="text-xl font-semibold mb-2">
                  Ocean Conservation
                </h3>
                <p className="text-sm opacity-90">
                  Direct funding to marine protection projects
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-xl font-semibold mb-2">Education Access</h3>
                <p className="text-sm opacity-90">
                  Free access for underserved communities
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{copy.ctaTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {copy.ctaSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl">
                <Link href="/units">{copy.ctaFree}</Link>
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
                <Link href="/pricing">{copy.ctaPremium}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
