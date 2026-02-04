"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  MapPin,
  BookOpen,
  Award,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function IndividualOnboarding({ onComplete }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  // Translations object
  const t = {
    en: {
      next: "Next",
      back: "Back",
      finish: "Let's Go!",
      skip: "Skip Tour",
      stepOf: "Step {current} of {total}",
      steps: [
        {
          title: "Welcome to Habitat English!",
          description: "Your personal journey to fluency starts here",
          icon: Zap,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Improve your English while exploring{" "}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  8 incredible ecosystems
                </span>
                , learning about environmental heroes, and discovering the
                wonders of our planet!
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Every week, we feature a new world with fresh content. Start
                  with South America, then unlock Africa, Eurasia, and beyond!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Explore at Your Own Pace",
          description: "Total flexibility - learn however you like!",
          icon: Target,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️✨</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Unlike traditional courses, you&apos;re in control!
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Choose Your Adventure
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Jump between adventures in any order. Follow your
                        curiosity!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Activity Flows - Deep Dives
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete full activity sequences with games, listening,
                        and exercises.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Units Page - Your Magazine
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Explore units like an online magazine. Perfect for quick
                        reading, listening and gap fill practice!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Customize Your Level",
          description: "Filter content to match your English level",
          icon: TrendingUp,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">📊🎓</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We have 3 levels of difficulty. You decide what to view!
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌱</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      Level 1: Discovery
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Foundations & essentials
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔍</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      Level 2: Explorer
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Intermediate challenges
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏔️</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">
                      Level 3: Master
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced mastery
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-bold">Pro Tip:</span>
                </div>
                <p className="text-sm">
                  Click the level badge at the top of the Worlds page to filter
                  by level or view ALL levels at once!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Featured World: South America",
          description: "This month's spotlight ecosystem",
          icon: MapPin,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🦜🌴🦎</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Start your journey in{" "}
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    South America
                  </span>
                  !
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-3">
                  Explore Amazing Ecosystems
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Amazon Rainforest - Earth&apos;s lungs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Andes Mountains - Sky-high biodiversity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Galápagos Islands - Darwin&apos;s laboratory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pantanal - World&apos;s largest wetland</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                New worlds unlock weekly. Previous worlds stay accessible
                forever!
              </p>
            </div>
          ),
        },
        {
          title: "Ready to Begin?",
          description: "Start exploring and improving your English today!",
          icon: Award,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                You&apos;re all set! Here&apos;s what to do next:
              </p>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Visit the Worlds Page
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pick an adventure that interests you
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">2️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Try the Units Page
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Browse like a magazine for quick reading
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Set Your Level
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click the level badge to customize what you see
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Remember:</strong> There&apos;s no right or wrong way
                  to learn. Explore, have fun, and your English will naturally
                  improve!
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    pt: {
      next: "Próximo",
      back: "Voltar",
      finish: "Vamos Lá!",
      skip: "Pular Tour",
      stepOf: "Passo {current} de {total}",
      steps: [
        {
          title: "Bem-vindo ao Habitat English!",
          description: "Sua jornada pessoal para a fluência começa aqui",
          icon: Zap,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Melhore seu inglês enquanto explora{" "}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  8 ecossistemas incríveis
                </span>
                , aprenda sobre heróis ambientais e descubra as maravilhas do
                nosso planeta!
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Cada semana, destacamos um novo mundo com conteúdo inédito.
                  Comece com a América do Sul e depois desbloqueie a África,
                  Ásia e além!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Explore no Seu Ritmo",
          description: "Flexibilidade total - aprenda como quiser!",
          icon: Target,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️✨</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Diferente dos cursos tradicionais, você está no controle!
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Escolha Sua Aventura
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pule entre aventuras em qualquer ordem. Siga sua
                        curiosidade!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Fluxos de Atividades - Mergulhos Profundos
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete sequências completas relacionadas a cada tema,
                        com jogos, listening, e exercícios.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Página de Unidades - Sua Revista
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Explore unidades como uma revista online. Perfeito para
                        prática rápida de leitura, listening, e preenchimento de
                        lacunas!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Personalize Seu Nível",
          description:
            "Filtre o conteúdo para corresponder ao seu nível de inglês",
          icon: TrendingUp,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">📊🎓</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Temos 3 níveis de dificuldade. Você decide o que visualizar!
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌱</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      Nível 1: Descoberta
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fundamentos & essenciais
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔍</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      Nível 2: Explorador
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Desafios intermediários
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏔️</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">
                      Nível 3: Mestre
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Domínio avançado
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-bold">Dica Pro:</span>
                </div>
                <p className="text-sm">
                  Clique no emblema de nível no topo da página Mundos para
                  filtrar por nível ou visualizar TODOS os níveis de uma vez!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Mundo em Destaque: América do Sul",
          description: "Ecossistema em destaque este mês",
          icon: MapPin,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🦜🌴🦎</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Comece sua jornada na{" "}
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    América do Sul
                  </span>
                  !
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-3">
                  Explore Ecossistemas Incríveis
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Floresta Amazônica - Pulmões da Terra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Cordilheira dos Andes - Biodiversidade nas alturas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Ilhas Galápagos - Laboratório de Darwin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pantanal - Maior área úmida do mundo</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Novos mundos desbloqueiam semanalmente. Mundos anteriores ficam
                acessíveis para sempre!
              </p>
            </div>
          ),
        },
        {
          title: "Pronto para Começar?",
          description: "Comece a explorar e melhorar seu inglês hoje!",
          icon: Award,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Você está pronto! Aqui estão os próximos passos:
              </p>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Visite a Página de Mundos
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Escolha uma aventura que te interesse
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">2️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Experimente a Página de atividades
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Navegue como uma revista para leitura rápida
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Defina Seu Nível
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clique no emblema de nível para personalizar o que você
                        vê
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Lembre-se:</strong> Não há maneira certa ou errada de
                  aprender. Explore, divirta-se e seu inglês vai melhorar
                  naturalmente!
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    th: {
      next: "ถัดไป",
      back: "ย้อนกลับ",
      finish: "ไปกันเลย!",
      skip: "ข้ามทัวร์",
      stepOf: "ขั้นตอนที่ {current} จาก {total}",
      steps: [
        {
          title: "ยินดีต้อนรับสู่ Habitat English!",
          description: "เส้นทางสู่ความคล่องแคล่วของคุณเริ่มต้นที่นี่",
          icon: Zap,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                พัฒนาภาษาอังกฤษของคุณพร้อมกับสำรวจ{" "}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  8 ระบบนิเวศที่น่าทึ่ง
                </span>
                , เรียนรู้เกี่ยวกับฮีโร่ด้านสิ่งแวดล้อม และค้นพบสิ่งมหัศจรรย์ของโลกเรา!
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  ทุกสัปดาห์ เรานำเสนอโลกใหม่พร้อมเนื้อหาใหม่ เริ่มต้นที่อเมริกาใต้ จากนั้นปลดล็อกแอฟริกา ยูเรเชีย และอื่น ๆ อีกมากมาย!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "สำรวจตามจังหวะของคุณ",
          description: "ยืดหยุ่นเต็มที่ - เรียนรู้ตามที่คุณต้องการ!",
          icon: Target,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️✨</div>
                <p className="text-gray-600 dark:text-gray-300">
                  ไม่เหมือนคอร์สทั่วไป คุณเป็นผู้ควบคุม!
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        เลือกการผจญภัยของคุณ
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ข้ามไปมาระหว่างการผจญภัยในลำดับใดก็ได้ ตามความอยากรู้ของคุณ!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        ลำดับกิจกรรม - เจาะลึก
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ทำลำดับกิจกรรมทั้งหมดพร้อมเกม การฟัง และแบบฝึกหัด
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        หน้าบทเรียน - นิตยสารของคุณ
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        สำรวจบทเรียนเหมือนนิตยสารออนไลน์ เหมาะสำหรับการอ่าน การฟัง และฝึกเติมคำอย่างรวดเร็ว!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "ปรับแต่งระดับของคุณ",
          description: "กรองเนื้อหาให้ตรงกับระดับภาษาอังกฤษของคุณ",
          icon: TrendingUp,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">📊🎓</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  เรามี 3 ระดับความยาก คุณเลือกได้ว่าจะดูอะไร!
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌱</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      ระดับ 1: ค้นพบ
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    พื้นฐานและสิ่งจำเป็น
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔍</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      ระดับ 2: นักสำรวจ
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ความท้าทายระดับกลาง
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏔️</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">
                      ระดับ 3: ผู้เชี่ยวชาญ
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ความเชี่ยวชาญขั้นสูง
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-bold">เคล็ดลับ Pro:</span>
                </div>
                <p className="text-sm">
                  คลิกที่ป้ายระดับด้านบนของหน้า Worlds เพื่อกรองตามระดับหรือดูทุกระดับพร้อมกัน!
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "โลกเด่น: อเมริกาใต้",
          description: "ระบบนิเวศเด่นประจำเดือนนี้",
          icon: MapPin,
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-4">🦜🌴🦎</div>
                <p className="text-gray-600 dark:text-gray-300">
                  เริ่มต้นการเดินทางของคุณใน{" "}
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    อเมริกาใต้
                  </span>
                  !
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-3">
                  สำรวจระบบนิเวศที่น่าทึ่ง
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ป่าแอมะซอน - ปอดของโลก</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>เทือกเขาแอนดีส - ความหลากหลายทางชีวภาพบนที่สูง</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>หมู่เกาะกาลาปากอส - ห้องทดลองของดาร์วิน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>แพนทานัล - พื้นที่ชุ่มน้ำที่ใหญ่ที่สุดในโลก</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                โลกใหม่ปลดล็อกทุกสัปดาห์ โลกก่อนหน้ายังคงเข้าถึงได้ตลอดไป!
              </p>
            </div>
          ),
        },
        {
          title: "พร้อมที่จะเริ่มหรือยัง?",
          description: "เริ่มสำรวจและพัฒนาภาษาอังกฤษของคุณวันนี้!",
          icon: Award,
          content: (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                คุณพร้อมแล้ว! นี่คือสิ่งที่ต้องทำต่อไป:
              </p>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        เยี่ยมชมหน้า Worlds
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        เลือกการผจญภัยที่คุณสนใจ
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">2️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        ลองหน้าบทเรียน
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        เลือกดูเหมือนนิตยสารสำหรับการอ่านอย่างรวดเร็ว
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        ตั้งค่าระดับของคุณ
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        คลิกที่ป้ายระดับเพื่อปรับแต่งสิ่งที่คุณเห็น
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>จำไว้:</strong> ไม่มีวิธีเรียนที่ถูกหรือผิด สำรวจ สนุก แล้วภาษาอังกฤษของคุณจะพัฒนาอย่างเป็นธรรมชาติ!
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
  };

  const content = t[lang] || t.en;
  const steps = content.steps;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    router.push("/worlds");
  };

  const handleSkip = () => {
    onComplete();
    router.push("/worlds");
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={content.skip}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-white/90 text-sm">
                {currentStepData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-cyan-500"
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            {content.stepOf
              .replace("{current}", currentStep + 1)
              .replace("{total}", steps.length)}
          </p>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">{content.back}</span>
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex-1"
            >
              <span className="font-medium">
                {currentStep === steps.length - 1
                  ? content.finish
                  : content.next}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
