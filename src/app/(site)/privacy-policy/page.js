// pages/privacy-policy/page.js
"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated:",
      introduction: "Introduction",
      introductionText:
        "Neptune's Tribe ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our environmental English learning platform.",
      informationWeCollect: "Information We Collect",
      personalInfo: "Personal Information",
      personalInfoText:
        "We may collect personally identifiable information such as your name, email address, and profile information when you create an account, subscribe to our services, or contact us.",
      usageData: "Usage Data",
      usageDataText:
        "We automatically collect information about your interaction with our platform, including your learning progress, completed exercises, time spent on activities, and preferences. This helps us improve your learning experience.",
      technicalData: "Technical Data",
      technicalDataText:
        "We collect information about your device, browser type, IP address, operating system, and referring URLs to ensure our platform works optimally for you.",
      howWeUse: "How We Use Your Information",
      useProvide: "To Provide and Maintain Our Service",
      useProvideText:
        "We use your information to create and manage your account, track your learning progress, provide personalized content, and deliver our educational services.",
      useImprove: "To Improve Our Platform",
      useImproveText:
        "We analyze usage patterns to enhance our educational content, develop new features, and optimize the learning experience.",
      useCommunicate: "To Communicate With You",
      useCommunicateText:
        "We may send you educational updates, progress reports, technical notices, and responses to your inquiries.",
      dataSharing: "Data Sharing and Disclosure",
      sharingText:
        "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:",
      sharingService:
        "Service Providers: With trusted third-party services that help us operate our platform (e.g., payment processors, email services).",
      sharingLegal:
        "Legal Requirements: When required by law or to protect our rights and safety.",
      sharingConsent:
        "With Your Consent: When you explicitly agree to share information for specific purposes.",
      dataSecurity: "Data Security",
      securityText:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure.",
      dataRetention: "Data Retention",
      retentionText:
        "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.",
      yourRights: "Your Rights",
      rightsText:
        "Depending on your location, you may have the following rights regarding your personal information:",
      rightsAccess: "Access: Request copies of your personal data",
      rightsRectification:
        "Rectification: Request correction of inaccurate information",
      rightsErasure: "Erasure: Request deletion of your personal data",
      rightsPortability: "Data Portability: Request transfer of your data",
      rightsObject: "Object: Object to processing of your personal data",
      cookies: "Cookies and Tracking",
      cookiesText:
        "We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.",
      thirdParty: "Third-Party Services",
      thirdPartyText:
        "Our platform may contain links to third-party websites or integrate with external services (such as payment processors). This privacy policy does not apply to third-party services, and we encourage you to review their privacy policies.",
      international: "International Data Transfers",
      internationalText:
        "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.",
      children: "Children's Privacy",
      childrenText:
        "Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.",
      changes: "Changes to This Privacy Policy",
      changesText:
        "We may update this Privacy Policy periodically. We will notify you of any material changes by posting the updated policy on our platform and sending email notification to registered users.",
      contact: "Contact Us",
      contactText:
        "If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:",
      contactEmail: "Email: privacy@neptunestribe.com",
      contactAddress: "Address: [Your Business Address]",
    },
    pt: {
      title: "Política de Privacidade",
      lastUpdated: "Última atualização:",
      introduction: "Introdução",
      introductionText:
        "Neptune's Tribe ('nós', 'nosso' ou 'nos') está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma de aprendizado de inglês ambiental.",
      informationWeCollect: "Informações que Coletamos",
      personalInfo: "Informações Pessoais",
      personalInfoText:
        "Podemos coletar informações pessoalmente identificáveis, como seu nome, endereço de e-mail e informações de perfil quando você cria uma conta, assina nossos serviços ou entra em contato conosco.",
      usageData: "Dados de Uso",
      usageDataText:
        "Coletamos automaticamente informações sobre sua interação com nossa plataforma, incluindo seu progresso de aprendizado, exercícios concluídos, tempo gasto em atividades e preferências. Isso nos ajuda a melhorar sua experiência de aprendizado.",
      technicalData: "Dados Técnicos",
      technicalDataText:
        "Coletamos informações sobre seu dispositivo, tipo de navegador, endereço IP, sistema operacional e URLs de referência para garantir que nossa plataforma funcione perfeitamente para você.",
      howWeUse: "Como Usamos Suas Informações",
      useProvide: "Para Fornecer e Manter Nosso Serviço",
      useProvideText:
        "Usamos suas informações para criar e gerenciar sua conta, acompanhar seu progresso de aprendizado, fornecer conteúdo personalizado e entregar nossos serviços educacionais.",
      useImprove: "Para Melhorar Nossa Plataforma",
      useImproveText:
        "Analisamos padrões de uso para aprimorar nosso conteúdo educacional, desenvolver novos recursos e otimizar a experiência de aprendizado.",
      useCommunicate: "Para Nos Comunicarmos Com Você",
      useCommunicateText:
        "Podemos enviar atualizações educacionais, relatórios de progresso, avisos técnicos e respostas às suas consultas.",
      dataSharing: "Compartilhamento e Divulgação de Dados",
      sharingText:
        "Não vendemos, negociamos ou alugamos suas informações pessoais para terceiros. Podemos compartilhar suas informações apenas nas seguintes circunstâncias:",
      sharingService:
        "Provedores de Serviço: Com serviços terceirizados confiáveis que nos ajudam a operar nossa plataforma (ex: processadores de pagamento, serviços de e-mail).",
      sharingLegal:
        "Requisitos Legais: Quando exigido por lei ou para proteger nossos direitos e segurança.",
      sharingConsent:
        "Com Seu Consentimento: Quando você concorda explicitamente em compartilhar informações para fins específicos.",
      dataSecurity: "Segurança de Dados",
      securityText:
        "Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhuma transmissão pela internet é 100% segura.",
      dataRetention: "Retenção de Dados",
      retentionText:
        "Retemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir os propósitos descritos nesta política. Você pode solicitar a exclusão de sua conta e dados associados a qualquer momento.",
      yourRights: "Seus Direitos",
      rightsText:
        "Dependendo de sua localização, você pode ter os seguintes direitos em relação às suas informações pessoais:",
      rightsAccess: "Acesso: Solicitar cópias de seus dados pessoais",
      rightsRectification:
        "Retificação: Solicitar correção de informações imprecisas",
      rightsErasure: "Apagamento: Solicitar exclusão de seus dados pessoais",
      rightsPortability:
        "Portabilidade de Dados: Solicitar transferência de seus dados",
      rightsObject: "Objeção: Objetar ao processamento de seus dados pessoais",
      cookies: "Cookies e Rastreamento",
      cookiesText:
        "Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso e fornecer conteúdo personalizado. Você pode controlar as configurações de cookies através das preferências do seu navegador.",
      thirdParty: "Serviços de Terceiros",
      thirdPartyText:
        "Nossa plataforma pode conter links para sites de terceiros ou integrar com serviços externos (como processadores de pagamento). Esta política de privacidade não se aplica a serviços de terceiros, e encorajamos você a revisar suas políticas de privacidade.",
      international: "Transferências Internacionais de Dados",
      internationalText:
        "Suas informações podem ser transferidas e processadas em países diferentes do seu. Garantimos que salvaguardas apropriadas estejam em vigor para proteger seus dados durante tais transferências.",
      children: "Privacidade de Crianças",
      childrenText:
        "Nosso serviço não é destinado a crianças menores de 13 anos. Não coletamos conscientemente informações pessoais de crianças menores de 13 anos. Se tomarmos conhecimento de tal coleta, excluiremos as informações imediatamente.",
      changes: "Alterações nesta Política de Privacidade",
      changesText:
        "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações materiais postando a política atualizada em nossa plataforma e enviando notificação por e-mail para usuários registrados.",
      contact: "Entre em Contato Conosco",
      contactText:
        "Se você tiver dúvidas sobre esta Política de Privacidade ou desejar exercer seus direitos, entre em contato conosco em:",
      contactEmail: "E-mail: privacy@neptunestribe.com",
      contactAddress: "Endereço: [Seu Endereço Comercial]",
    },
    th: {
      title: "นโยบายความเป็นส่วนตัว",
      lastUpdated: "อัปเดตล่าสุด:",
      introduction: "บทนำ",
      introductionText:
        "Neptune's Tribe ('เรา', 'ของเรา' หรือ 'พวกเรา') มุ่งมั่นในการปกป้องความเป็นส่วนตัวของคุณ นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของคุณเมื่อคุณใช้แพลตฟอร์มการเรียนรู้ภาษาอังกฤษเชิงสิ่งแวดล้อมของเรา",
      informationWeCollect: "ข้อมูลที่เราเก็บรวบรวม",
      personalInfo: "ข้อมูลส่วนบุคคล",
      personalInfoText:
        "เราอาจเก็บรวบรวมข้อมูลที่สามารถระบุตัวตนได้ เช่น ชื่อ ที่อยู่อีเมล และข้อมูลโปรไฟล์ของคุณ เมื่อคุณสร้างบัญชี สมัครสมาชิกบริการของเรา หรือติดต่อเรา",
      usageData: "ข้อมูลการใช้งาน",
      usageDataText:
        "เราเก็บรวบรวมข้อมูลเกี่ยวกับการโต้ตอบของคุณกับแพลตฟอร์มของเราโดยอัตโนมัติ รวมถึงความก้าวหน้าในการเรียนรู้ แบบฝึกหัดที่ทำเสร็จแล้ว เวลาที่ใช้ในกิจกรรมต่าง ๆ และการตั้งค่า ข้อมูลเหล่านี้ช่วยให้เราปรับปรุงประสบการณ์การเรียนรู้ของคุณ",
      technicalData: "ข้อมูลทางเทคนิค",
      technicalDataText:
        "เราเก็บรวบรวมข้อมูลเกี่ยวกับอุปกรณ์ ประเภทเบราว์เซอร์ ที่อยู่ IP ระบบปฏิบัติการ และ URL อ้างอิงของคุณ เพื่อให้แน่ใจว่าแพลตฟอร์มของเราทำงานได้อย่างเหมาะสมสำหรับคุณ",
      howWeUse: "วิธีที่เราใช้ข้อมูลของคุณ",
      useProvide: "เพื่อให้บริการและดูแลรักษาบริการของเรา",
      useProvideText:
        "เราใช้ข้อมูลของคุณเพื่อสร้างและจัดการบัญชีของคุณ ติดตามความก้าวหน้าในการเรียนรู้ ให้เนื้อหาที่เหมาะกับคุณ และส่งมอบบริการด้านการศึกษาของเรา",
      useImprove: "เพื่อปรับปรุงแพลตฟอร์มของเรา",
      useImproveText:
        "เราวิเคราะห์รูปแบบการใช้งานเพื่อพัฒนาเนื้อหาการศึกษา พัฒนาฟีเจอร์ใหม่ และเพิ่มประสิทธิภาพประสบการณ์การเรียนรู้",
      useCommunicate: "เพื่อสื่อสารกับคุณ",
      useCommunicateText:
        "เราอาจส่งข้อมูลอัปเดตด้านการศึกษา รายงานความก้าวหน้า ประกาศทางเทคนิค และคำตอบสำหรับข้อสอบถามของคุณ",
      dataSharing: "การแบ่งปันและเปิดเผยข้อมูล",
      sharingText:
        "เราไม่ขาย แลกเปลี่ยน หรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม เราอาจแบ่งปันข้อมูลของคุณเฉพาะในกรณีต่อไปนี้:",
      sharingService:
        "ผู้ให้บริการ: กับบริการของบุคคลที่สามที่เชื่อถือได้ซึ่งช่วยเราในการดำเนินงานแพลตฟอร์มของเรา (เช่น ผู้ประมวลผลการชำระเงิน บริการอีเมล)",
      sharingLegal:
        "ข้อกำหนดทางกฎหมาย: เมื่อกฎหมายกำหนดหรือเพื่อปกป้องสิทธิ์และความปลอดภัยของเรา",
      sharingConsent:
        "ด้วยความยินยอมของคุณ: เมื่อคุณตกลงอย่างชัดเจนที่จะแบ่งปันข้อมูลเพื่อวัตถุประสงค์เฉพาะ",
      dataSecurity: "ความปลอดภัยของข้อมูล",
      securityText:
        "เราใช้มาตรการทางเทคนิคและองค์กรที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง การเปลี่ยนแปลง การเปิดเผย หรือการทำลายโดยไม่ได้รับอนุญาต อย่างไรก็ตาม การส่งข้อมูลทางอินเทอร์เน็ตไม่มีความปลอดภัย 100%",
      dataRetention: "การเก็บรักษาข้อมูล",
      retentionText:
        "เราเก็บรักษาข้อมูลส่วนบุคคลของคุณตราบเท่าที่จำเป็นในการให้บริการและบรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ คุณสามารถขอลบบัญชีและข้อมูลที่เกี่ยวข้องได้ตลอดเวลา",
      yourRights: "สิทธิ์ของคุณ",
      rightsText:
        "ขึ้นอยู่กับที่ตั้งของคุณ คุณอาจมีสิทธิ์ดังต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของคุณ:",
      rightsAccess: "การเข้าถึง: ขอสำเนาข้อมูลส่วนบุคคลของคุณ",
      rightsRectification:
        "การแก้ไข: ขอแก้ไขข้อมูลที่ไม่ถูกต้อง",
      rightsErasure: "การลบ: ขอลบข้อมูลส่วนบุคคลของคุณ",
      rightsPortability: "การโอนย้ายข้อมูล: ขอโอนย้ายข้อมูลของคุณ",
      rightsObject: "การคัดค้าน: คัดค้านการประมวลผลข้อมูลส่วนบุคคลของคุณ",
      cookies: "คุกกี้และการติดตาม",
      cookiesText:
        "เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อปรับปรุงประสบการณ์ของคุณ วิเคราะห์การใช้งาน และให้เนื้อหาที่เหมาะกับคุณ คุณสามารถควบคุมการตั้งค่าคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ของคุณ",
      thirdParty: "บริการของบุคคลที่สาม",
      thirdPartyText:
        "แพลตฟอร์มของเราอาจมีลิงก์ไปยังเว็บไซต์ของบุคคลที่สามหรือเชื่อมต่อกับบริการภายนอก (เช่น ผู้ประมวลผลการชำระเงิน) นโยบายความเป็นส่วนตัวนี้ไม่ครอบคลุมบริการของบุคคลที่สาม และเราแนะนำให้คุณตรวจสอบนโยบายความเป็นส่วนตัวของพวกเขา",
      international: "การโอนข้อมูลระหว่างประเทศ",
      internationalText:
        "ข้อมูลของคุณอาจถูกโอนและประมวลผลในประเทศอื่นนอกเหนือจากประเทศของคุณ เรารับรองว่ามีมาตรการป้องกันที่เหมาะสมเพื่อปกป้องข้อมูลของคุณระหว่างการโอนดังกล่าว",
      children: "ความเป็นส่วนตัวของเด็ก",
      childrenText:
        "บริการของเราไม่ได้มีวัตถุประสงค์สำหรับเด็กอายุต่ำกว่า 13 ปี เราไม่เก็บรวบรวมข้อมูลส่วนบุคคลจากเด็กอายุต่ำกว่า 13 ปีโดยเจตนา หากเราทราบว่ามีการเก็บรวบรวมข้อมูลดังกล่าว เราจะลบข้อมูลนั้นทันที",
      changes: "การเปลี่ยนแปลงนโยบายความเป็นส่วนตัวนี้",
      changesText:
        "เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นระยะ เราจะแจ้งให้คุณทราบเกี่ยวกับการเปลี่ยนแปลงที่สำคัญโดยการโพสต์นโยบายที่อัปเดตบนแพลตฟอร์มของเราและส่งการแจ้งเตือนทางอีเมลไปยังผู้ใช้ที่ลงทะเบียน",
      contact: "ติดต่อเรา",
      contactText:
        "หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้หรือต้องการใช้สิทธิ์ของคุณ กรุณาติดต่อเราที่:",
      contactEmail: "อีเมล: privacy@neptunestribe.com",
      contactAddress: "ที่อยู่: [ที่อยู่ธุรกิจของคุณ]",
    },
  };

  const copy = t[lang];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-orbitron font-bold text-gray-800 dark:text-white mb-4">
          {copy.title}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          {copy.lastUpdated} August 21, 2025
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              1. {copy.introduction}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.introductionText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              2. {copy.informationWeCollect}
            </h2>

            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.personalInfo}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.personalInfoText}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.usageData}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.usageDataText}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.technicalData}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.technicalDataText}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              3. {copy.howWeUse}
            </h2>

            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.useProvide}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.useProvideText}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.useImprove}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.useImproveText}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.useCommunicate}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.useCommunicateText}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              4. {copy.dataSharing}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.sharingText}
            </p>
            <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>• {copy.sharingService}</li>
              <li>• {copy.sharingLegal}</li>
              <li>• {copy.sharingConsent}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              5. {copy.dataSecurity}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.securityText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              6. {copy.dataRetention}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.retentionText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              7. {copy.yourRights}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.rightsText}
            </p>
            <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>• {copy.rightsAccess}</li>
              <li>• {copy.rightsRectification}</li>
              <li>• {copy.rightsErasure}</li>
              <li>• {copy.rightsPortability}</li>
              <li>• {copy.rightsObject}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              8. {copy.cookies}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.cookiesText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              9. {copy.thirdParty}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.thirdPartyText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              10. {copy.international}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.internationalText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              11. {copy.children}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.childrenText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              12. {copy.changes}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.changesText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              13. {copy.contact}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.contactText}
            </p>
            <div className="ml-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p>{copy.contactEmail}</p>
              <p>{copy.contactAddress}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
