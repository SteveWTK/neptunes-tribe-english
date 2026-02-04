// pages/about-us/page.js
"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutUsPage() {
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "About Habitat English",
      subtitle: "Protecting Our Planet Through Language Learning",
      missionTitle: "Our Mission",
      missionText:
        "To inspire global citizenship and environmental stewardship, creating a generation of learners who are both linguistically skilled and environmentally responsible.",
      visionTitle: "Our Vision",
      visionText:
        "A world where language learning serves a greater purpose; where every English lesson contributes to environmental awareness, where every student becomes an ambassador for our planet's incredible biodiversity, and where education bridges the gap between linguistic competence and ecological responsibility.",
      whatMakesUsSpecial: "What Makes Us Special",
      feature1Title: "Environmental Focus",
      feature1Text:
        "Every lesson teaches English through fascinating stories about Earth's species, ecosystems, and environmental heroes.",
      feature2Title: "Interactive Learning",
      feature2Text:
        "Gamified experiences with our eco-map and environmental crisis challenges.",
      feature3Title: "Real-World Impact",
      feature3Text:
        "Learning that connects students to actual conservation efforts and environmental solutions.",
      feature4Title: "Multilingual Support",
      feature4Text:
        "Content available in English, Portuguese, Spanish, and French to support diverse learners.",
      teamTitle: "Meet Our Team",
      teamSubtitle:
        "Passionate about education and the environment, and working together to change the world",
      founder1Title: "Main Content Creator",
      founder1Bio:
        "After a long academic career which included over 25 years in Brazilian universities, teaching and supervising research projects in Second Language Acquisition, Michael is now dedicating himself fulltime to defending the environment, especially in Brazil, where he continues to live.",
      founder2Title: "Lead Developer",
      founder2Bio:
        "With a background in education technology and sustainable development, Stephen brings together technical expertise and environmental passion to create innovative learning experiences.",
      founder3Title: "Educational Specialist",
      founder3Bio:
        "As a specialist in ESL methodology and a wildlife enthusiast, Paul ensures our platform meets the highest standards of language pedagogy and learning effectiveness.",
      founder4Title: "Strategic Director",
      founder4Bio:
        "With decades of experience as a language school director, David provides the strategic expertise that will allow Habitat English to inspire learners worldwide.",
      valuesTitle: "Our Values",
      value1Title: "Environmental Responsibility",
      value1Text:
        "Every aspect of our platform promotes environmental awareness and conservation.",
      value2Title: "Educational Excellence",
      value2Text:
        "We maintain the highest standards in language learning methodology and content quality.",
      value3Title: "Global Community",
      value3Text:
        "We foster connections between learners worldwide who share our passion for language and environment.",
      value4Title: "Innovation",
      value4Text:
        "We continuously evolve our platform using the latest in educational technology and pedagogical research.",
      joinUsTitle: "Join Our Mission",
      joinUsText:
        "Whether you're a student looking to improve your English while learning about our amazing planet, or an educator wanting to bring environmental themes into your classroom, Habitat English welcomes you to our growing global community.",
      getStartedBtn: "Join Habitat Today",
      contactBtn: "Contact Us",
    },
    pt: {
      title: "Sobre o Habitat English",
      subtitle: "Protegendo Nosso Planeta Através do Aprendizado de Idiomas",
      missionTitle: "Nossa Missão",
      missionText:
        "Inspirar cidadania global e responsabilidade ambiental, criando uma geração de estudantes que são tanto linguisticamente habilidosos quanto ambientalmente responsáveis.",
      visionTitle: "Nossa Visão",
      visionText:
        "Um mundo onde o aprendizado de idiomas serve a um propósito maior; onde cada aula de inglês contribui para a consciência ambiental, onde cada estudante se torna um embaixador da incrível biodiversidade do nosso planeta, e onde a educação conecta competência linguística e responsabilidade ecológica.",
      whatMakesUsSpecial: "O Que Nos Torna Especiais",
      feature1Title: "Foco Ambiental",
      feature1Text:
        "Cada lição ensina inglês através de histórias fascinantes sobre espécies, ecossistemas e heróis ambientais da Terra.",
      feature2Title: "Aprendizado Interativo",
      feature2Text:
        "Experiências gamificadas com nosso eco-mapa e desafios de crises ambientais.",
      feature3Title: "Impacto Real",
      feature3Text:
        "Aprendizado que conecta estudantes a esforços reais de conservação e soluções ambientais.",
      feature4Title: "Suporte Multilíngue",
      feature4Text:
        "Conteúdo disponível em inglês, português, espanhol e francês para apoiar diversos estudantes.",
      teamTitle: "Conheça Nossa Equipe",
      teamSubtitle:
        "Educadores e ambientalistas apaixonados trabalhando juntos para mudar o mundo",
      founder1Title: "Diretor de Conteúdo",
      founder1Bio:
        "Após uma longa carreira acadêmica que incluiu mais de 25 anos em universidades brasileiras, ensinando e supervisionando projetos de pesquisa em Aquisição de Segunda Língua, Michael agora se dedica em tempo integral à defesa do meio ambiente, especialmente no Brasil, onde continua morando.",
      founder2Title: "Diretor Técnico",
      founder2Bio:
        "Com experiência em tecnologia educacional e desenvolvimento sustentável, Stephen une expertise técnica e paixão ambiental para criar experiências de aprendizado inovadoras. Stephen possui graduação com Honra em Estudos do Sudeste Asiático, SOAS (Universidade de Londres)",
      founder3Title: "Diretor Acadêmico",
      founder3Bio:
        "Especializando-se em metodologia de Inglês como Língua Estrangeira e um entusiasta da natureza, Paul garante que nossa plataforma atenda aos mais altos padrões de pedagogia e eficácia de aprendizado.",
      founder4Title: "Diretor Estratégico",
      founder4Bio:
        "Com décadas de experiência como diretor de escola de idiomas, David fornece a expertise estratégica que garante que a Habitat English ajude a inspirar alunos no mundo todo.",
      valuesTitle: "Nossos Valores",
      value1Title: "Responsabilidade Ambiental",
      value1Text:
        "Cada aspecto de nossa plataforma promove consciência ambiental e conservação.",
      value2Title: "Excelência Educacional",
      value2Text:
        "Mantemos os mais altos padrões em metodologia de aprendizado de idiomas e qualidade de conteúdo.",
      value3Title: "Comunidade Global",
      value3Text:
        "Fomentamos conexões entre estudantes mundialmente que compartilham nossa paixão por idiomas e meio ambiente.",
      value4Title: "Inovação",
      value4Text:
        "Evoluímos continuamente nossa plataforma usando o mais recente em tecnologia educacional e pesquisa pedagógica.",
      joinUsTitle: "Junte-se à Nossa Missão",
      joinUsText:
        "Seja você um estudante buscando melhorar seu inglês enquanto aprende sobre nosso planeta incrível, ou um educador querendo trazer temas ambientais para sua sala de aula, o Habitat English te dá as boas-vindas à nossa crescente comunidade global.",
      getStartedBtn: "Junte-se à Habitat English Hoje",
      contactBtn: "Contate-nos",
    },
    th: {
      title: "เกี่ยวกับ Habitat English",
      subtitle: "ปกป้องโลกของเราผ่านการเรียนรู้ภาษา",
      missionTitle: "พันธกิจของเรา",
      missionText:
        "สร้างแรงบันดาลใจให้เกิดความเป็นพลเมืองโลกและความรับผิดชอบต่อสิ่งแวดล้อม สร้างคนรุ่นใหม่ที่มีทั้งทักษะทางภาษาและความรับผิดชอบต่อสิ่งแวดล้อม",
      visionTitle: "วิสัยทัศน์ของเรา",
      visionText:
        "โลกที่การเรียนรู้ภาษามีจุดมุ่งหมายที่ยิ่งใหญ่กว่า โลกที่บทเรียนภาษาอังกฤษทุกบทมีส่วนช่วยสร้างจิตสำนึกด้านสิ่งแวดล้อม โลกที่นักเรียนทุกคนกลายเป็นทูตแห่งความหลากหลายทางชีวภาพอันน่าทึ่งของโลกเรา และโลกที่การศึกษาเชื่อมช่องว่างระหว่างความสามารถทางภาษาและความรับผิดชอบต่อระบบนิเวศ",
      whatMakesUsSpecial: "อะไรทำให้เราพิเศษ",
      feature1Title: "มุ่งเน้นสิ่งแวดล้อม",
      feature1Text:
        "ทุกบทเรียนสอนภาษาอังกฤษผ่านเรื่องราวที่น่าสนใจเกี่ยวกับสายพันธุ์สิ่งมีชีวิต ระบบนิเวศ และวีรบุรุษด้านสิ่งแวดล้อมของโลก",
      feature2Title: "การเรียนรู้แบบโต้ตอบ",
      feature2Text:
        "ประสบการณ์แบบเกมกับแผนที่นิเวศและความท้าทายด้านวิกฤตสิ่งแวดล้อมของเรา",
      feature3Title: "ผลกระทบในโลกจริง",
      feature3Text:
        "การเรียนรู้ที่เชื่อมโยงนักเรียนกับความพยายามในการอนุรักษ์และแนวทางแก้ไขปัญหาสิ่งแวดล้อมที่เกิดขึ้นจริง",
      feature4Title: "รองรับหลายภาษา",
      feature4Text:
        "เนื้อหาพร้อมให้บริการในภาษาอังกฤษ โปรตุเกส สเปน และฝรั่งเศส เพื่อสนับสนุนผู้เรียนที่หลากหลาย",
      teamTitle: "พบกับทีมของเรา",
      teamSubtitle:
        "หลงใหลในการศึกษาและสิ่งแวดล้อม และทำงานร่วมกันเพื่อเปลี่ยนแปลงโลก",
      founder1Title: "ผู้สร้างเนื้อหาหลัก",
      founder1Bio:
        "หลังจากอาชีพทางวิชาการอันยาวนานซึ่งรวมถึงการทำงานกว่า 25 ปีในมหาวิทยาลัยบราซิล สอนและควบคุมดูแลโครงการวิจัยด้านการเรียนรู้ภาษาที่สอง ปัจจุบัน Michael อุทิศตนเต็มเวลาให้กับการปกป้องสิ่งแวดล้อม โดยเฉพาะในบราซิล ซึ่งเขายังคงอาศัยอยู่",
      founder2Title: "หัวหน้าฝ่ายพัฒนา",
      founder2Bio:
        "ด้วยพื้นฐานด้านเทคโนโลยีการศึกษาและการพัฒนาอย่างยั่งยืน Stephen ผสมผสานความเชี่ยวชาญทางเทคนิคและความหลงใหลในสิ่งแวดล้อมเพื่อสร้างประสบการณ์การเรียนรู้ที่สร้างสรรค์",
      founder3Title: "ผู้เชี่ยวชาญด้านการศึกษา",
      founder3Bio:
        "ในฐานะผู้เชี่ยวชาญด้านระเบียบวิธีการสอนภาษาอังกฤษเป็นภาษาที่สองและผู้หลงใหลในสัตว์ป่า Paul ดูแลให้แพลตฟอร์มของเราเป็นไปตามมาตรฐานสูงสุดของการสอนภาษาและประสิทธิภาพการเรียนรู้",
      founder4Title: "ผู้อำนวยการฝ่ายกลยุทธ์",
      founder4Bio:
        "ด้วยประสบการณ์หลายทศวรรษในฐานะผู้อำนวยการโรงเรียนสอนภาษา David มอบความเชี่ยวชาญด้านกลยุทธ์ที่จะช่วยให้ Habitat English สร้างแรงบันดาลใจให้ผู้เรียนทั่วโลก",
      valuesTitle: "ค่านิยมของเรา",
      value1Title: "ความรับผิดชอบต่อสิ่งแวดล้อม",
      value1Text:
        "ทุกแง่มุมของแพลตฟอร์มของเราส่งเสริมจิตสำนึกด้านสิ่งแวดล้อมและการอนุรักษ์",
      value2Title: "ความเป็นเลิศทางการศึกษา",
      value2Text:
        "เรารักษามาตรฐานสูงสุดในระเบียบวิธีการเรียนรู้ภาษาและคุณภาพเนื้อหา",
      value3Title: "ชุมชนระดับโลก",
      value3Text:
        "เราส่งเสริมการเชื่อมต่อระหว่างผู้เรียนทั่วโลกที่มีความหลงใหลในภาษาและสิ่งแวดล้อมเช่นเดียวกับเรา",
      value4Title: "นวัตกรรม",
      value4Text:
        "เราพัฒนาแพลตฟอร์มของเราอย่างต่อเนื่องโดยใช้เทคโนโลยีการศึกษาและการวิจัยด้านการสอนล่าสุด",
      joinUsTitle: "ร่วมพันธกิจของเรา",
      joinUsText:
        "ไม่ว่าคุณจะเป็นนักเรียนที่ต้องการพัฒนาภาษาอังกฤษพร้อมเรียนรู้เกี่ยวกับโลกอันน่าทึ่งของเรา หรือเป็นนักการศึกษาที่ต้องการนำเนื้อหาด้านสิ่งแวดล้อมเข้าสู่ห้องเรียน Habitat English ยินดีต้อนรับคุณสู่ชุมชนระดับโลกที่กำลังเติบโตของเรา",
      getStartedBtn: "เข้าร่วม Habitat วันนี้",
      contactBtn: "ติดต่อเรา",
    },
  };

  const copy = t[lang];

  // Placeholder team data - you can fill this in with actual team information
  const teamMembers = [
    {
      id: 1,
      name: "Dr Michael Alan Watkins",
      title: copy.founder1Title,
      bio: copy.founder1Bio,
      image: "team/MAW-2.JPG", // Replace with actual image path
    },
    {
      id: 2,
      name: "Stephen Watkins",
      title: copy.founder2Title,
      bio: copy.founder2Bio,
      image: "/team/stephen-watkins.JPEG",
    },
    {
      id: 3,
      name: "Paul Watkins",
      title: copy.founder3Title,
      bio: copy.founder3Bio,
      image: "/team/paul-watkins-lake.jpg",
    },
    {
      id: 4,
      name: "David Watkins",
      title: copy.founder4Title,
      bio: copy.founder4Bio,
      image: "/team/David.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      {/* <section className="relative py-6 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10 dark:from-blue-800/20 dark:to-green-800/20"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-gray-800 dark:text-white mb-6">
            {copy.teamTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light leading-relaxed">
            {copy.teamSubtitle}
          </p>
        </div>
      </section> */}

      {/* Team Section */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-orbitron font-bold text-gray-800 dark:text-white mb-4">
              {copy.teamTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {copy.teamSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-gradient-to-br from-accent-400 to-primary-400 p-1">
                    {/* <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-4xl">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="object-cover"
                      />
                    </div> */}
                    <motion.img
                      src={member.image}
                      alt="team"
                      className="w-full h-full rounded-full object-cover  shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-orbitron font-bold text-center text-gray-800 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-center text-accent-600 dark:text-accent-200 mb-4">
                  {member.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-center">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-blue-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-orbitron font-bold text-gray-800 dark:text-white">
                  {copy.missionTitle}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {copy.missionText}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-green-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-orbitron font-bold text-gray-800 dark:text-white">
                  {copy.visionTitle}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {copy.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-orbitron font-bold text-center text-gray-800 dark:text-white mb-12">
            {copy.whatMakesUsSpecial}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: copy.feature1Title,
                text: copy.feature1Text,
                icon: "🌱",
                image: "heroes/augustin-basabose-gorilla.jpg",
                color: "green",
              },
              {
                title: copy.feature2Title,
                text: copy.feature2Text,
                icon: "🎮",
                image: "screenshots/eco-map-preview-2.png",
                color: "blue",
              },
              {
                title: copy.feature3Title,
                text: copy.feature3Text,
                icon: "🌍",
                image: "heroes/farwiza-farhan-2.jpg",
                color: "indigo",
              },
              {
                title: copy.feature4Title,
                text: copy.feature4Text,
                icon: "🗣️",
                image: "eco/vaquitas.jpg",
                color: "purple",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-24 h-20 mx-auto mb-3 bg-${feature.color}-100 dark:bg-${feature.color}-900 rounded-xl flex items-center justify-center text-4xl group-hover:shadow-lg transition-shadow`}
                >
                  <motion.img
                    src={feature.image}
                    alt="team"
                    className="w-full h-full rounded-xl object-cover  shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                  />
                </div>
                {/* <div
                  className={`w-20 h-20 mx-auto mb-6 bg-${feature.color}-100 dark:bg-${feature.color}-900 rounded-full flex items-center justify-center text-4xl group-hover:shadow-lg transition-shadow`}
                >
                  {feature.icon}
                </div> */}
                <h3 className="text-xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-orbitron font-bold text-center text-gray-800 dark:text-white mb-12">
            {copy.valuesTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: copy.value1Title, text: copy.value1Text, icon: "🌿" },
              { title: copy.value2Title, text: copy.value2Text, icon: "🎓" },
              { title: copy.value3Title, text: copy.value3Text, icon: "🌐" },
              { title: copy.value4Title, text: copy.value4Text, icon: "🚀" },
            ].map((value, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {/* <div className="text-3xl flex-shrink-0">{value.icon}</div> */}
                <div>
                  <h3 className="text-xl font-orbitron font-semibold text-gray-800 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-800 dark:to-green-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-orbitron font-bold text-white mb-6">
            {copy.joinUsTitle}
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-8">
            {copy.joinUsText}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
              {copy.getStartedBtn}
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200">
              {copy.contactBtn}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
