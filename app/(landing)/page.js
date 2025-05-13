"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function LandingPage({ darkMode = false }) {
  const { lang } = useLanguage();

  console.log("LANG received:", lang);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const t = {
    en: {
      heroTitle: "English with a Mission",
      heroSubtitle:
        "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
      signUp: "Register with Gmail",
      support: "Support Us (Bank Transfer)",
      aboutTitle: "What is Neptune's Tribe?",
      aboutText:
        "Neptune’s Tribe blends language learning with a mission to protect the environment. By improving your English, you’re also supporting real-world ecological projects.",
      missionTitle: "Our Mission",
      missionText:
        "We believe language is power, and when combined with purpose, it can change the world. Neptune's Tribe empowers learners while supporting environmental change.",
      visionTitle: "Our Vision",
      visionText:
        "To create a more connected and compassionate world in which looking after each other and our planet becomes the normal thing to do.",
      valuesTitle: "Our Values",
      valuesText: "",
      teamTitle: "Meet the team",
      teamText:
        "We have decades of experience running language schools, and we have now combined this with our passion for the environment to create Neptune's Tribe.",
      supportInfo:
        "To support us directly, please make a transfer to: [Bank Account Details] — Thank you!",
    },
    pt: {
      heroTitle: "Aprenda Inglês. Apoie o Planeta.",
      heroSubtitle:
        "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
      signUp: "Cadastre-se com o Gmail",
      support: "Apoie-nos (Transferência Bancária)",
      aboutTitle: "O que é a Neptune's Tribe?",
      aboutText:
        "Neptune’s Tribe une o aprendizado de idiomas com a missão de proteger o meio ambiente. Ao melhorar seu inglês, você também apoia projetos ecológicos reais.",
      missionTitle: "Nossa Missão",
      missionText:
        "Acreditamos que a linguagem é poder — e quando combinada com propósito, pode mudar o mundo. Neptune's Tribe capacita os alunos enquanto apoia a mudança ambiental.",
      visionTitle: "Nossa Visão",
      visionText:
        "Para criar um mundo mais conectado e compassivo, no qual cuidar uns dos outros e do nosso planeta se torne algo normal a ser feito.",
      valuesTitle: "Nossos Valores",
      valuesText: "",
      teamTitle: "Conheça a equipe",
      teamText:
        "Temos décadas de experiência administrando escolas de idiomas e agora combinamos isso com nossa paixão pelo meio ambiente para criar a Neptune's Tribe.",
      supportInfo:
        "Para nos apoiar diretamente, por favor, faça uma transferência para: [Dados Bancários] — Obrigado!",
    },
  };

  const copy = t[lang];

  const heroImages = [
    {
      src: "/eco/penguins.jpeg",
      caption:
        lang === "en"
          ? "Embark on an English learning journey inspired by environmental action."
          : "Embarque em uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
    },
    {
      src: "/heroes/farwiza-farhan-with-elephant.jpeg",
      caption:
        lang === "en"
          ? "Meet environmental heroes dedicating their lives to preserving ecosystems"
          : "Conheça heróis ambientais que dedicam suas vidas à preservação de ecossistemas.",
    },
    {
      src: "/eco/vaquitas.jpg",
      caption:
        lang === "en"
          ? "Learn about endangered species, such as the vaquita, critically endangered due to human activity."
          : "Aprenda sobre espécies ameaçadas de extinção, como a vaquita, criticamente ameaçada pelas atividades humanas.",
    },
  ];

  const languageOptions = {
    en: { label: "English", flag: "/flags/en.svg" },
    pt: { label: "Português", flag: "/flags/pt.svg" },
    th: { label: "ไทย", flag: "/flags/th.svg" },
  };

  const buttonClass =
    "text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="font-josefin min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative flex flex-col justify-center text-center md:flex-row items-center md:justify-between md:text-left gap-12 py-12 md:py-16 px-4 md:px-24 bg-gradient-to-br from-primary-100 to-green-100 dark:bg-gradient-to-br dark:from-primary-400 dark:to-primary-700 dark:text-gray-50"
      >
        {/* Hero Text */}
        <div className="flex-1">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {copy.heroTitle}
          </motion.h2>
          <motion.p
            className="text-lg max-w-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {copy.heroSubtitle}
          </motion.p>
          <motion.div
            className="flex justify-center md:justify-start gap-4 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Button className="rounded-2xl bg-gradient-to-b from-primary-400 to-primary-700 hover:from-primary-700 hover:to-primary-950 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-white dark:text-primary-950">
              <Link href="/login">{copy.signUp}</Link>
            </Button>
            <Button className="rounded-2xl bg-gradient-to-b from-primary-400 to-primary-700 hover:from-primary-700 hover:to-primary-950 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-white dark:text-primary-950">
              <Link href="#support">{copy.support}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="relative w-80 h-80 md:w-96 md:h-96">
            <motion.img
              key={heroImages[currentImageIndex].src}
              src={heroImages[currentImageIndex].src}
              alt="Hero"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-primary-600 shadow-lg"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 font-semibold bg-gradient-to-b from-primary-400 to-primary-700 hover:from-primary-700 hover:to-primary-950 text-sm text-center py-2 px-3 rounded-b-full border-b-2 border-white  dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-white dark:text-primary-950 dark:border-primary-600"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              {heroImages[currentImageIndex].caption}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}

      <motion.section
        className="relative flex flex-col items-center justify-between gap-12 py-12 md:py-20 px-4 md:px-24 bg-white dark:bg-primary-950 text-center"
        id="about"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex-2 justify-start">
          <h3 className="text-2xl font-bold mb-4">{copy.aboutTitle}</h3>
          <p className="max-w-3xl px-4 md:px-24 text-lg">{copy.aboutText}</p>
        </div>
        <div className="flex-1 relative m-auto w-60 h-30 md:w-120 md:h-60">
          <motion.img
            src="/screenshots/sgc-hummingbird.png"
            alt="hummingbird"
            className="w-full h-full rounded-xl object-cover border-4 border-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="py-12 md:py-24 px-4 bg-gray-50 dark:bg-gray-800 text-center"
        id="mission"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* <h3 className="text-2xl font-bold mb-4">{copy.missionTitle}</h3> */}

        <motion.div
          className="flex flex-col gap-8 align-middle justify-center lg:grid lg:grid-cols-3 px:4 sm:px-8 md:px-12 lg:px-2 xl:px-24"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative m-auto w-50 h-auto sm:w-80 sm:h-40">
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-t from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-t-4xl border-b-2 border-white dark:border-primary-600 z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[18px] font-bold">{copy.missionTitle}</h1>
            </motion.div>
            <motion.div
              className="w-full h-full pb-2 rounded-4xl object-cover bg-white border-2 dark:bg-primary-950 border-white dark:border-primary-800 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-sm pt-12">{copy.missionText}</p>
            </motion.div>
          </div>
          <div className="relative m-auto w-50 h-auto sm:w-80 sm:h-40">
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-t from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-t-4xl border-b-2 border-white dark:border-primary-600 z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[18px] font-bold">{copy.visionTitle}</h1>
            </motion.div>
            <motion.div
              className="w-full h-full pb-2 rounded-4xl object-cover bg-white border-2 dark:bg-primary-950 border-white dark:border-primary-800 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-sm pt-12">{copy.visionText}</p>
            </motion.div>
          </div>
          <div className="relative m-auto w-50 h-auto sm:w-80 sm:h-40">
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-t from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-t-4xl border-b-2 border-white dark:border-primary-600 z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[18px] font-bold">Our Values</h1>
            </motion.div>
            <motion.div
              className="w-full h-full pb-2 rounded-4xl object-cover bg-white border-2 dark:bg-primary-950 border-white dark:border-primary-800 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-sm pt-12">{copy.visionText}</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Team Info Section */}
      <motion.section
        id="team"
        className="py-20 px-4 md:px-24 bg-white dark:bg-primary-950 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-bold mb-4">{copy.teamTitle}</h3>
        <p className="max-w-4xl mx-auto text-lg">{copy.teamText}</p>
        <motion.div
          className="flex flex-col gap-10 md:grid md:grid-cols-2 xl:grid-cols-4 mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative m-auto w-64 h-64">
            <motion.img
              src="/team/MAW-1.jpeg"
              alt="team"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-primary-600 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-b-4xl border-b-4 border-white dark:border-primary-600 z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[16px] font-bold">Michael Watkins</h1>
              <p className="text-xs">Academic Content Creator</p>
            </motion.div>
          </div>
          <div className="relative m-auto w-64 h-64">
            <motion.img
              src="/team/stephen-watkins.JPEG"
              alt="team"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-primary-600 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-b-4xl border-b-4 border-white dark:border-primary-600"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[16px] font-bold">Stephen Watkins</h1>
              <p className="text-xs">Technical Director</p>
            </motion.div>
          </div>
          <div className="relative m-auto w-64 h-64">
            <motion.img
              src="/team/paul-watkins.jpeg"
              alt="team"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-primary-600 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-primary-700 to-primary-950  text-white text-center py-2 px-3 rounded-b-4xl border-b-4 border-white dark:border-primary-600"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[16px] font-bold">Paul Watkins</h1>
              <p className="text-xs">Corporate Sales Director</p>
            </motion.div>
          </div>
          <div className="relative m-auto w-64 h-64">
            <motion.img
              src="/team/David.jpg"
              alt="team"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-primary-600 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-primary-700 to-primary-950  text-white  text-center py-2 px-3 rounded-b-4xl border-b-4 border-white dark:border-primary-600"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[16px] font-bold">David Watkins</h1>
              <p className="text-xs">Communications Director</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Support Info Section */}
      <motion.section
        id="support"
        className="py-16 px-4 md:px-24 bg-gray-50 dark:bg-primary-950 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-bold mb-4">{copy.support}</h3>
        <p className="px-4 text-lg">{copy.supportInfo}</p>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-sm">
        © {new Date().getFullYear()} Neptune&apos;s Tribe. All rights reserved.
      </footer>
    </div>
  );
}
