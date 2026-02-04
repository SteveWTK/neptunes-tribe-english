"use client";

import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Globe,
  DollarSign,
  Target,
  TrendingUp,
  Heart,
  BookOpen,
  MessageCircle,
  Crown,
  Calendar,
  Play,
  CheckCircle,
  Award,
  Fish,
  Leaf,
} from "lucide-react";

export default function NGOPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState("en");
  const printRef = useRef();

  const t = {
    en: {
      title: "Partnership Proposal",
      subtitle: "Neptune's Tribe x Environmental NGOs",

      // Navigation
      prevSlide: "Previous",
      nextSlide: "Next",
      downloadPDF: "Download PDF",
      slide: "Slide",
      of: "of",

      // Slide 1: Title
      slide1Title: "Partnership Proposal",
      slide1Subtitle: "Neptune's Tribe Environmental English Platform",
      slide1Tagline: "Learn English • Protect Our Planet • Build Community",

      // Slide 2: What is Neptune's Tribe
      slide2Title: "What is Neptune's Tribe?",
      slide2Point1:
        "Online English learning platform focused on environmental themes",
      slide2Point2:
        "Weekly activities to improve your vocabulary focusing on an environmental theme.",
      slide2Point3:
        "Weekly live conversation classes with synchronized global curriculum",
      slide2Point4:
        "Interactive world map tracking learning progress across ecosystems",
      slide2Point5:
        "Community-driven learning where members vote on weekly themes",

      // Slide 3: Our Learning Model
      slide3Title: "Our Unique Learning Model",
      slide3Explorer: "Explorer Tier",
      slide3ExplorerDesc:
        "Free access to all learning units and can listen to live classes",
      slide3Pro: "Pro Tier",
      slide3ProDesc:
        "Full participation in weekly live conversation classes (max 8 participants)",
      slide3Premium: "Premium Tier",
      slide3PremiumDesc:
        "Vote on weekly themes + special guest podcasts + exclusive content",
      slide3Community:
        "Synchronized weekly themes create global learning community",

      // Slide 4: Partnership Model
      slide4Title: "Partnership Opportunity",
      slide4Event: "Partnership Events",
      slide4EventDesc:
        "Sea Shepherd promotes 1-hour conversation events (R$50 per participant, maximum of 8 participants)",
      slide4Revenue1: "Event Revenue Split",
      slide4Revenue1Desc: "50% of event revenue goes directly to Sea Shepherd",
      slide4Event2: "Ongoing Partnership",
      slide4Event2Desc:
        "By subscribing monthly, our tribe contributes to impactful conservation actions.",
      slide4Revenue2: "Partnership Revenue Split",
      slide4Revenue2Desc:
        "20% of all subscriptions from partnership referrals go to Sea Shepherd",
      slide4PartnershipGoal: "Partnership Goal",
      slide4Experience:
        "Participants get authentic platform experience and pathway to full membership",

      // Slide 5: Why Partner With Us
      slide5Title: "Why Partner With Neptune's Tribe?",
      slide5Aligned: "Mission Aligned",
      slide5AlignedDesc:
        "Environmental education that directly supports conservation",
      slide5Global: "Global Reach",
      slide5GlobalDesc:
        "Connect your supporters with international environmental community",
      slide5Impact: "Measurable Impact",
      slide5ImpactDesc:
        "Track engagement and see direct financial support for your organization",
      slide5Quality: "Educational Quality",
      slide5QualityDesc:
        "Professional English education with environmental focus builds lasting engagement",

      // Slide 6: Our Impact
      slide6Title: "Platform Impact & Metrics",
      slide6Users: "Active Learners Worldwide",
      slide6Content: "Learning Units Available",
      slide6Countries: "Countries & Marine Zones Covered",
      slide6Donated: "Already Donated to Conservation",
      slide6Growth: "Growing 25% monthly with strong user retention",

      // Slide 7: Our Team
      slide7Title: "Meet Our Team",
      slide7Subtitle:
        "Passionate educators and environmentalists working together",

      // Slide 8: Partnership Benefits
      slide8Title: "Partnership Benefits Summary",
      slide8ForNGO: "For Your Organization",
      slide8Benefit1: "Direct revenue from partnership events (50% split)",
      slide8Benefit2: "Ongoing subscription revenue (20% of referrals)",
      slide8Benefit3: "Expanded educational impact for your supporters",
      slide8Benefit4: "Global community connection and brand exposure",
      slide8ForUsers: "For Your Supporters",
      slide8UserBenefit1:
        "High-quality English education with environmental focus",
      slide8UserBenefit2: "Connection to global conservation community",
      slide8UserBenefit3:
        "Knowledge that learning directly supports environmental protection",

      // Slide 9: Next Steps
      slide9Title: "Ready to Partner With Us?",
      slide9Contact: "Contact Information",
      slide9Email: "partnerships@habitatenglish.com",
      slide9Schedule: "Let's Schedule a Demo",
      slide9CTA:
        "Together we can educate the world while protecting our planet",
    },
    pt: {
      title: "Proposta de Parceria",
      subtitle: "Neptune's Tribe x ONGs Ambientais",

      // Navigation
      prevSlide: "Anterior",
      nextSlide: "Próximo",
      downloadPDF: "Baixar PDF",
      slide: "Slide",
      of: "de",

      // Slide 1: Title
      slide1Title: "Proposta de Parceria",
      slide1Subtitle: "Plataforma Neptune's Tribe de Inglês Ambiental",
      slide1Tagline:
        "Aprenda Inglês • Proteja Nosso Planeta • Construa Comunidade",

      // Slide 2: What is Neptune's Tribe
      slide2Title: "O Que é a Neptune's Tribe?",
      slide2Point1: "Plataforma online de inglês focada em temas ambientais",
      slide2Point2:
        "Atividades semanais para aprimorar seu vocabulário focando em um tema ambiental",
      slide2Point3:
        "Aulas semanais de conversação ao vivo com currículo global sincronizado",
      slide2Point4:
        "Mapa mundial interativo acompanhando progresso através de ecossistemas",
      slide2Point5:
        "Aprendizado comunitário onde membros votam nos temas semanais",

      // Slide 3: Our Learning Model
      slide3Title: "Nosso Modelo Único de Aprendizado",
      slide3Explorer: "Nível Explorer",
      slide3ExplorerDesc:
        "Acesso gratuito a todas as unidades e pode ouvir aulas ao vivo",
      slide3Pro: "Nível Pro",
      slide3ProDesc:
        "Participação completa nas aulas semanais de conversação (máx 8 participantes)",
      slide3Premium: "Nível Premium",
      slide3PremiumDesc:
        "Vota nos temas semanais + podcasts especiais + conteúdo exclusivo",
      slide3Community:
        "Temas semanais sincronizados criam comunidade global de aprendizado",

      // Slide 4: Partnership Model
      slide4Title: "Oportunidade de Parceria",
      slide4Event: "Eventos de Parceria",
      slide4EventDesc:
        "Sea Shepherd promove eventos de conversação de 1 hora (R$50 por participante, máximo de 8 participantes)",
      slide4Event2: "Parceria Contínua",
      slide4Event2Desc:
        "Ao fazer a assinatura mensal nossa tribo contribui para ações de conservação impactantes",
      slide4Revenue1: "Divisão da Receita do Evento",
      slide4Revenue1Desc:
        "da receita do evento vai diretamente para a Sea Shepherd",
      slide4Revenue2: "Divisão da Receita da Parceria Contínua",
      slide4Revenue2Desc:
        "das assinaturas de indicações da parceria vão para a Sea Shepherd",
      slide4PartnershipGoal: "Meta da Parceria",
      slide4Experience:
        "Participantes recebem experiência autêntica da plataforma e caminho para adesão completa",

      // Slide 5: Why Partner With Us
      slide5Title: "Por Que Fazer Parceria Conosco?",
      slide5Aligned: "Missão Alinhada",
      slide5AlignedDesc:
        "Educação ambiental que apoia diretamente a conservação",
      slide5Global: "Alcance Global",
      slide5GlobalDesc:
        "Conecte seus apoiadores com comunidade ambiental internacional",
      slide5Impact: "Impacto Mensurável",
      slide5ImpactDesc:
        "Acompanhe engajamento e veja apoio financeiro direto para sua organização",
      slide5Quality: "Qualidade Educacional",
      slide5QualityDesc:
        "Educação profissional em inglês com foco ambiental cria engajamento duradouro",

      // Slide 6: Our Impact
      slide6Title: "Impacto da Plataforma & Métricas",
      slide6Users: "Estudantes Ativos Globalmente",
      slide6Content: "Unidades de Aprendizado Disponíveis",
      slide6Countries: "Países e Zonas Marinhas Cobertas",
      slide6Donated: "Já Doado para Conservação",
      slide6Growth: "Crescendo 25% mensalmente com forte retenção de usuários",

      // Slide 7: Our Team
      slide7Title: "Conheça Nossa Equipe",
      slide7Subtitle:
        "Educadores e ambientalistas apaixonados trabalhando juntos",

      // Slide 8: Partnership Benefits
      slide8Title: "Resumo dos Benefícios da Parceria",
      slide8ForNGO: "Para Sua Organização",
      slide8Benefit1: "Receita direta de eventos de parceria (divisão 50%)",
      slide8Benefit2: "Receita contínua de assinaturas (20% das indicações)",
      slide8Benefit3: "Impacto educacional expandido para seus apoiadores",
      slide8Benefit4: "Conexão comunitária global e exposição da marca",
      slide8ForUsers: "Para Seus Apoiadores",
      slide8UserBenefit1:
        "Educação de inglês de alta qualidade com foco ambiental",
      slide8UserBenefit2: "Conexão com comunidade global de conservação",
      slide8UserBenefit3:
        "Conhecimento de que aprender apoia diretamente proteção ambiental",

      // Slide 9: Next Steps
      slide9Title: "Pronto para Fazer Parceria Conosco?",
      slide9Contact: "Informações de Contato",
      slide9Email: "partnerships@habitatenglish.com",
      slide9Schedule: "Vamos Agendar uma Demo",
      slide9CTA:
        "Juntos podemos educar o mundo enquanto protegemos nosso planeta",
    },
    th: {
      title: "ข้อเสนอความร่วมมือ",
      subtitle: "Neptune's Tribe x องค์กรด้านสิ่งแวดล้อม",

      // Navigation
      prevSlide: "ก่อนหน้า",
      nextSlide: "ถัดไป",
      downloadPDF: "ดาวน์โหลด PDF",
      slide: "สไลด์",
      of: "จาก",

      // Slide 1: Title
      slide1Title: "ข้อเสนอความร่วมมือ",
      slide1Subtitle: "แพลตฟอร์มภาษาอังกฤษเพื่อสิ่งแวดล้อม Neptune's Tribe",
      slide1Tagline: "เรียนภาษาอังกฤษ • ปกป้องโลกของเรา • สร้างชุมชน",

      // Slide 2: What is Neptune's Tribe
      slide2Title: "Neptune's Tribe คืออะไร?",
      slide2Point1:
        "แพลตฟอร์มเรียนภาษาอังกฤษออนไลน์ที่เน้นเรื่องสิ่งแวดล้อม",
      slide2Point2:
        "กิจกรรมรายสัปดาห์เพื่อพัฒนาคำศัพท์โดยเน้นหัวข้อด้านสิ่งแวดล้อม",
      slide2Point3:
        "คลาสสนทนาสดรายสัปดาห์พร้อมหลักสูตรที่ซิงค์กันทั่วโลก",
      slide2Point4:
        "แผนที่โลกแบบอินเทอร์แอคทีฟที่ติดตามความก้าวหน้าการเรียนรู้ข้ามระบบนิเวศ",
      slide2Point5:
        "การเรียนรู้ที่ขับเคลื่อนโดยชุมชน สมาชิกร่วมโหวตหัวข้อประจำสัปดาห์",

      // Slide 3: Our Learning Model
      slide3Title: "โมเดลการเรียนรู้ที่เป็นเอกลักษณ์ของเรา",
      slide3Explorer: "ระดับ Explorer",
      slide3ExplorerDesc:
        "เข้าถึงบทเรียนทั้งหมดฟรี และสามารถฟังคลาสสดได้",
      slide3Pro: "ระดับ Pro",
      slide3ProDesc:
        "เข้าร่วมคลาสสนทนาสดรายสัปดาห์ได้เต็มที่ (สูงสุด 8 คน)",
      slide3Premium: "ระดับ Premium",
      slide3PremiumDesc:
        "โหวตหัวข้อประจำสัปดาห์ + พอดแคสต์แขกรับเชิญพิเศษ + เนื้อหาเอ็กซ์คลูซีฟ",
      slide3Community:
        "หัวข้อรายสัปดาห์ที่ซิงค์กันสร้างชุมชนการเรียนรู้ระดับโลก",

      // Slide 4: Partnership Model
      slide4Title: "โอกาสในการเป็นพันธมิตร",
      slide4Event: "กิจกรรมพันธมิตร",
      slide4EventDesc:
        "Sea Shepherd จัดกิจกรรมสนทนา 1 ชั่วโมง (R$50 ต่อผู้เข้าร่วม สูงสุด 8 คน)",
      slide4Revenue1: "การแบ่งรายได้จากกิจกรรม",
      slide4Revenue1Desc: "50% ของรายได้จากกิจกรรมมอบให้ Sea Shepherd โดยตรง",
      slide4Event2: "ความร่วมมือต่อเนื่อง",
      slide4Event2Desc:
        "ด้วยการสมัครสมาชิกรายเดือน ชนเผ่าของเรามีส่วนร่วมในการอนุรักษ์ที่สร้างผลกระทบ",
      slide4Revenue2: "การแบ่งรายได้จากความร่วมมือ",
      slide4Revenue2Desc:
        "20% ของสมาชิกทั้งหมดจากการแนะนำของพันธมิตรมอบให้ Sea Shepherd",
      slide4PartnershipGoal: "เป้าหมายความร่วมมือ",
      slide4Experience:
        "ผู้เข้าร่วมได้รับประสบการณ์จริงบนแพลตฟอร์มและเส้นทางสู่การเป็นสมาชิกเต็มรูปแบบ",

      // Slide 5: Why Partner With Us
      slide5Title: "ทำไมต้องเป็นพันธมิตรกับ Neptune's Tribe?",
      slide5Aligned: "พันธกิจที่สอดคล้อง",
      slide5AlignedDesc:
        "การศึกษาด้านสิ่งแวดล้อมที่สนับสนุนการอนุรักษ์โดยตรง",
      slide5Global: "การเข้าถึงทั่วโลก",
      slide5GlobalDesc:
        "เชื่อมต่อผู้สนับสนุนของคุณกับชุมชนสิ่งแวดล้อมระหว่างประเทศ",
      slide5Impact: "ผลกระทบที่วัดผลได้",
      slide5ImpactDesc:
        "ติดตามการมีส่วนร่วมและเห็นการสนับสนุนทางการเงินโดยตรงสำหรับองค์กรของคุณ",
      slide5Quality: "คุณภาพการศึกษา",
      slide5QualityDesc:
        "การสอนภาษาอังกฤษระดับมืออาชีพที่เน้นสิ่งแวดล้อมสร้างการมีส่วนร่วมที่ยั่งยืน",

      // Slide 6: Our Impact
      slide6Title: "ผลกระทบและตัวชี้วัดของแพลตฟอร์ม",
      slide6Users: "ผู้เรียนที่กำลังเรียนอยู่ทั่วโลก",
      slide6Content: "บทเรียนที่พร้อมใช้งาน",
      slide6Countries: "ประเทศและเขตทะเลที่ครอบคลุม",
      slide6Donated: "บริจาคเพื่อการอนุรักษ์แล้ว",
      slide6Growth: "เติบโต 25% ต่อเดือนพร้อมอัตราการรักษาผู้ใช้ที่สูง",

      // Slide 7: Our Team
      slide7Title: "พบกับทีมของเรา",
      slide7Subtitle:
        "นักการศึกษาและนักอนุรักษ์สิ่งแวดล้อมที่มีความหลงใหลทำงานร่วมกัน",

      // Slide 8: Partnership Benefits
      slide8Title: "สรุปสิทธิประโยชน์ของพันธมิตร",
      slide8ForNGO: "สำหรับองค์กรของคุณ",
      slide8Benefit1: "รายได้โดยตรงจากกิจกรรมพันธมิตร (แบ่ง 50%)",
      slide8Benefit2: "รายได้จากสมาชิกต่อเนื่อง (20% จากการแนะนำ)",
      slide8Benefit3: "ขยายผลกระทบทางการศึกษาสำหรับผู้สนับสนุนของคุณ",
      slide8Benefit4: "การเชื่อมต่อชุมชนระดับโลกและการเปิดเผยแบรนด์",
      slide8ForUsers: "สำหรับผู้สนับสนุนของคุณ",
      slide8UserBenefit1:
        "การเรียนภาษาอังกฤษคุณภาพสูงที่เน้นสิ่งแวดล้อม",
      slide8UserBenefit2: "เชื่อมต่อกับชุมชนอนุรักษ์ระดับโลก",
      slide8UserBenefit3:
        "ความมั่นใจว่าการเรียนรู้สนับสนุนการปกป้องสิ่งแวดล้อมโดยตรง",

      // Slide 9: Next Steps
      slide9Title: "พร้อมที่จะเป็นพันธมิตรกับเราหรือยัง?",
      slide9Contact: "ข้อมูลติดต่อ",
      slide9Email: "partnerships@habitatenglish.com",
      slide9Schedule: "มานัดหมายเพื่อสาธิตกันเถอะ",
      slide9CTA:
        "ร่วมกันเราสามารถให้การศึกษาแก่โลกขณะปกป้องโลกของเรา",
    },
  };

  const copy = t[language];

  const slides = [
    // Slide 1: Title
    {
      id: 1,
      component: (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Neptune&apos;s Tribe
            </h1>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
              {copy.slide1Title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {copy.slide1Subtitle}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl p-8 max-w-2xl mx-auto">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {copy.slide1Tagline}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium">
                {language === "th"
                  ? "เรียนภาษาอังกฤษ"
                  : language === "pt"
                    ? "Aprenda Inglês"
                    : "Learn English"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium">
                {language === "th"
                  ? "เน้นสิ่งแวดล้อม"
                  : language === "pt"
                    ? "Foco Ambiental"
                    : "Environmental Focus"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium">
                {language === "th"
                  ? "ชุมชนระดับโลก"
                  : language === "pt"
                    ? "Comunidade Global"
                    : "Global Community"}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: What is Neptune's Tribe
    {
      id: 2,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {copy.slide2Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                copy.slide2Point1,
                copy.slide2Point2,
                copy.slide2Point3,
                copy.slide2Point4,
                copy.slide2Point5,
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl p-6">
              <img
                src="/screenshots/eco-map-preview.png"
                alt="Neptune's Tribe Platform"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                {language === "th"
                  ? "ประสบการณ์แผนที่เชิงนิเวศเชิงโต้ตอบ"
                  : language === "pt"
                    ? "Experiência Interativa do Mapa Ecológico"
                    : "Interactive Eco-Map Experience"}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Learning Model
    {
      id: 3,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {copy.slide3Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Explorer Tier */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-blue-200">
                {copy.slide3Explorer}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {copy.slide3ExplorerDesc}
              </p>
              <div className="mt-4 text-2xl font-bold text-blue-600">FREE</div>
            </div>

            {/* Pro Tier */}
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-6 text-center border-2 border-green-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-800 dark:text-green-200">
                {copy.slide3Pro}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {copy.slide3ProDesc}
              </p>
              <div className="mt-4 text-2xl font-bold text-green-600">
                $40/month
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-purple-50 dark:bg-purple-950 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-purple-800 dark:text-purple-200">
                {copy.slide3Premium}
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {copy.slide3PremiumDesc}
              </p>
              <div className="mt-4 text-2xl font-bold text-purple-600">
                $50/month
              </div>
            </div>
          </div>

          <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {copy.slide3Community}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 4: Partnership Model
    {
      id: 4,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
              {copy.slide4Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Partnership */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {copy.slide4Event}
                </h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-6">
                {copy.slide4EventDesc}
              </p>
              <p className="text-2xl font-bold text-blue-300">50%</p>
              <p className=" text-blue-800 dark:text-blue-300 mt-2">
                {copy.slide4Revenue1Desc}
              </p>

              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{copy.slide4Revenue1}</span>
                  <span className="text-2xl font-bold text-green-600">50%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-white mt-2">
                  {copy.slide4Revenue1Desc}
                </p>
              </div> */}
            </div>

            {/* Ongoing Partnership */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {copy.slide4Event2}
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-6">
                {copy.slide4Event2Desc}
              </p>
              <p className="text-2xl font-bold text-green-600">20%</p>
              <p className="text-green-700 dark:text-green-300 mb-6">
                {copy.slide4Revenue2Desc}
              </p>

              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{copy.slide4Revenue2}</span>
                  <span className="text-2xl font-bold text-green-600">20%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-white mt-2">
                  {copy.slide4Revenue2Desc}
                </p>
              </div> */}
            </div>
          </div>

          <div className=" text-white text-center rounded-xl p-3">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-6 h-6 text-accent-600" />
              <h3 className="text-xl font-bold text-accent-800 dark:text-white">
                {copy.slide4PartnershipGoal}
              </h3>
            </div>
            <p className="text-accent-700 dark:text-white">
              {copy.slide4Experience}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 5: Why Partner
    {
      id: 5,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
              {copy.slide5Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: copy.slide5Aligned,
                desc: copy.slide5AlignedDesc,
                icon: <Heart className="w-8 h-8" />,
                color: "rose",
              },
              {
                title: copy.slide5Global,
                desc: copy.slide5GlobalDesc,
                icon: <Globe className="w-8 h-8" />,
                color: "blue",
              },
              {
                title: copy.slide5Impact,
                desc: copy.slide5ImpactDesc,
                icon: <TrendingUp className="w-8 h-8" />,
                color: "teal",
              },
              {
                title: copy.slide5Quality,
                desc: copy.slide5QualityDesc,
                icon: <Award className="w-8 h-8" />,
                color: "purple",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className={`bg-${benefit.color}-50 dark:bg-${benefit.color}-900 rounded-xl p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`text-${benefit.color}-600 dark:text-${benefit.color}-400`}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    className={`text-xl font-bold text-${benefit.color}-800 dark:text-${benefit.color}-200`}
                  >
                    {benefit.title}
                  </h3>
                </div>
                <p
                  className={`text-${benefit.color}-700 dark:text-${benefit.color}-300`}
                >
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // Slide 6: Impact Metrics
    {
      id: 6,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
              {copy.slide6Title}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "500+", label: copy.slide6Users, color: "blue" },
              { number: "170+", label: copy.slide6Content, color: "green" },
              { number: "50+", label: copy.slide6Countries, color: "purple" },
              { number: "$5,000+", label: copy.slide6Donated, color: "orange" },
            ].map((metric, i) => (
              <div key={i} className="text-center">
                <div
                  className={`text-4xl font-bold text-${metric.color}-600 mb-2`}
                >
                  {metric.number}
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl p-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xl font-semibold">{copy.slide6Growth}</p>
          </div>
        </div>
      ),
    },

    // Slide 7: Team
    {
      id: 7,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {copy.slide7Title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {copy.slide7Subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Dr. Michael Watkins",
                title:
                  language === "th"
                    ? "ผู้อำนวยการเนื้อหา"
                    : language === "pt"
                      ? "Diretor de Conteúdo"
                      : "Content Director",
                image: "/team/MAW-2.JPG",
              },
              {
                name: "Stephen Watkins",
                title:
                  language === "th"
                    ? "หัวหน้านักพัฒนา"
                    : language === "pt"
                      ? "Desenvolvedor Líder"
                      : "Lead Developer",
                image: "/team/stephen-watkins.JPEG",
              },
              {
                name: "Paul Watkins",
                title:
                  language === "th"
                    ? "ผู้เชี่ยวชาญด้านการศึกษา"
                    : language === "pt"
                      ? "Especialista em Educação"
                      : "Education Specialist",
                image: "/team/paul-watkins-lake.jpg",
              },
              {
                name: "David Watkins",
                title:
                  language === "th"
                    ? "ผู้อำนวยการกลยุทธ์"
                    : language === "pt"
                      ? "Diretor Estratégico"
                      : "Strategic Director",
                image: "/team/David.jpg",
              },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='%236b7280'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>`;
                    }}
                  />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {member.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {member.title}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {language === "th"
                ? "ประสบการณ์รวมกันกว่า 80 ปีในด้านการศึกษา เทคโนโลยี และการสนับสนุนสิ่งแวดล้อม"
                : language === "pt"
                  ? "Mais de 80 anos combinados de experiência em educação, tecnologia e defesa ambiental"
                  : "Combined 80+ years of experience in education, technology, and environmental advocacy"}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 8: Partnership Benefits
    {
      id: 8,
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
              {copy.slide8Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefits for NGO */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Fish className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {copy.slide8ForNGO}
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  copy.slide8Benefit1,
                  copy.slide8Benefit2,
                  copy.slide8Benefit3,
                  copy.slide8Benefit4,
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-green-700 dark:text-green-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits for Users */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {copy.slide8ForUsers}
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  copy.slide8UserBenefit1,
                  copy.slide8UserBenefit2,
                  copy.slide8UserBenefit3,
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <span className="text-blue-700 dark:text-blue-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-8">
            <DollarSign className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-2">Win-Win Partnership Model</p>
            <p className="text-lg opacity-90">
              Sustainable revenue for conservation while providing valuable
              education
            </p>
          </div>
        </div>
      ),
    },

    // Slide 9: Next Steps
    {
      id: 9,
      component: (
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            {copy.slide9Title}
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {copy.slide9Contact}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-blue-600">
                  {copy.slide9Email}
                </span>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.slide9Schedule}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  See our platform in action and discuss partnership details
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 max-w-3xl mx-auto">
            <Globe className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-4">{copy.slide9CTA}</p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Schedule Demo
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Download Proposal
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Fish className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                Neptune&apos;s Tribe
              </span>
            </div>

            {/* Language Toggle */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  language === "en"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("pt")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  language === "pt"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Português
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {copy.slide} {currentSlide + 1} {copy.of} {slides.length}
            </span>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              {copy.downloadPDF}
            </button>
          </div>
        </div>
      </div>

      {/* Main Presentation Area */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Slide Content */}
          <div
            ref={printRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg min-h-[500px] p-8 print:shadow-none print:min-h-screen"
          >
            {slides[currentSlide].component}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6 print:hidden">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {copy.prevSlide}
            </button>

            {/* Slide Indicators */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {copy.nextSlide}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Thumbnails for Print */}
          <div className="hidden print:block print:break-before-page">
            <div className="grid grid-cols-3 gap-4">
              {slides.map((slide, index) => (
                <div key={index} className="border border-gray-300 rounded p-2">
                  <div className="text-xs text-center mb-2">
                    Slide {index + 1}
                  </div>
                  <div className="transform scale-25 origin-top-left w-96 h-72 overflow-hidden">
                    {slide.component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:min-h-screen {
            min-height: 100vh;
          }

          body {
            print-color-adjust: exact;
          }

          /* Ensure gradients print properly */
          .bg-gradient-to-r,
          .bg-gradient-to-br,
          .bg-gradient-to-b {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
