// pages/terms-conditions/page.js
"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function TermsConditionsPage() {
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "Terms & Conditions",
      lastUpdated: "Last updated:",
      acceptance: "Acceptance of Terms",
      acceptanceText:
        "By accessing and using Neptune's Tribe, you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service apply to all users of the website, including without limitation users who are browsers, customers, and contributors of content.",
      description: "Description of Service",
      descriptionText:
        "Neptune's Tribe is an online English as a Foreign Language (EFL) learning platform that combines environmental education with language learning. Our service provides interactive gap-fill exercises, audio content, translations, and gamified learning experiences focused on environmental themes, species conservation, and ecological awareness.",
      userAccounts: "User Accounts",
      userAccountsText:
        "To access certain features of Neptune's Tribe, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.",
      subscriptions: "Subscriptions and Payments",
      subscriptionsText:
        "Neptune's Tribe offers premium subscription services. By purchasing a subscription, you agree to pay all charges associated with your account. Subscription fees are charged in advance and are non-refundable except as required by law or as specified in our Refunds Policy.",
      userContent: "User Content and Conduct",
      userContentText:
        "Users may not upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable. Neptune's Tribe reserves the right to remove any content that violates these terms.",
      intellectualProperty: "Intellectual Property",
      intellectualPropertyText:
        "All content on Neptune's Tribe, including but not limited to text, graphics, logos, images, audio clips, and software, is the property of Neptune's Tribe or its content suppliers and is protected by international copyright laws. Users may not reproduce, distribute, or create derivative works from our content without explicit permission.",
      privacy: "Privacy",
      privacyText:
        "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.",
      disclaimers: "Disclaimers",
      disclaimersText:
        "Neptune's Tribe is provided on an 'as is' and 'as available' basis. We make no representations or warranties of any kind, express or implied, as to the operation of the service or the information, content, materials, or products included on this site.",
      limitation: "Limitation of Liability",
      limitationText:
        "Neptune's Tribe shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, even if we have been advised of the possibility of such damages.",
      termination: "Termination",
      terminationText:
        "Neptune's Tribe may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
      changes: "Changes to Terms",
      changesText:
        "Neptune's Tribe reserves the right to modify these Terms at any time. We will notify users of any material changes via email or through the service. Your continued use of the service after such modifications constitutes acceptance of the updated Terms.",
      contact: "Contact Information",
      contactText:
        "If you have any questions about these Terms & Conditions, please contact us at support@neptunestribe.com",
    },
    pt: {
      title: "Termos e Condições",
      lastUpdated: "Última atualização:",
      acceptance: "Aceitação dos Termos",
      acceptanceText:
        "Ao acessar e usar o Neptune's Tribe, você aceita e concorda em ficar vinculado aos termos e disposições deste acordo. Estes Termos de Serviço se aplicam a todos os usuários do site, incluindo, sem limitação, usuários que são navegadores, clientes e colaboradores de conteúdo.",
      description: "Descrição do Serviço",
      descriptionText:
        "Neptune's Tribe é uma plataforma online de aprendizado de Inglês como Língua Estrangeira (EFL) que combina educação ambiental com aprendizado de idiomas. Nosso serviço oferece exercícios interativos de preenchimento de lacunas, conteúdo de áudio, traduções e experiências de aprendizado gamificadas focadas em temas ambientais, conservação de espécies e conscientização ecológica.",
      userAccounts: "Contas de Usuário",
      userAccountsText:
        "Para acessar certos recursos do Neptune's Tribe, você pode ser obrigado a criar uma conta. Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorrem sob sua conta.",
      subscriptions: "Assinaturas e Pagamentos",
      subscriptionsText:
        "Neptune's Tribe oferece serviços de assinatura premium. Ao comprar uma assinatura, você concorda em pagar todas as taxas associadas à sua conta. As taxas de assinatura são cobradas antecipadamente e não são reembolsáveis, exceto conforme exigido por lei ou conforme especificado em nossa Política de Reembolsos.",
      userContent: "Conteúdo e Conduta do Usuário",
      userContentText:
        "Os usuários não podem carregar, postar ou transmitir qualquer conteúdo que seja ilegal, prejudicial, ameaçador, abusivo, assediador, tortuoso, difamatório, vulgar, obsceno, calunioso, invasivo da privacidade de outrem, odioso ou racialmente, etnicamente ou de outra forma censurável. Neptune's Tribe reserva-se o direito de remover qualquer conteúdo que viole estes termos.",
      intellectualProperty: "Propriedade Intelectual",
      intellectualPropertyText:
        "Todo o conteúdo do Neptune's Tribe, incluindo, mas não limitado a texto, gráficos, logotipos, imagens, clipes de áudio e software, é propriedade do Neptune's Tribe ou de seus fornecedores de conteúdo e é protegido pelas leis internacionais de direitos autorais. Os usuários não podem reproduzir, distribuir ou criar trabalhos derivados de nosso conteúdo sem permissão explícita.",
      privacy: "Privacidade",
      privacyText:
        "Sua privacidade é importante para nós. Por favor, revise nossa Política de Privacidade, que também rege o uso do Serviço, para entender nossas práticas.",
      disclaimers: "Isenções de Responsabilidade",
      disclaimersText:
        "Neptune's Tribe é fornecido 'como está' e 'conforme disponível'. Não fazemos representações ou garantias de qualquer tipo, expressas ou implícitas, quanto à operação do serviço ou às informações, conteúdo, materiais ou produtos incluídos neste site.",
      limitation: "Limitação de Responsabilidade",
      limitationText:
        "Neptune's Tribe não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar o serviço, mesmo que tenhamos sido avisados da possibilidade de tais danos.",
      termination: "Rescisão",
      terminationText:
        "Neptune's Tribe pode encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.",
      changes: "Alterações nos Termos",
      changesText:
        "Neptune's Tribe reserva-se o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre quaisquer alterações materiais por e-mail ou através do serviço. Seu uso contínuo do serviço após tais modificações constitui aceitação dos Termos atualizados.",
      contact: "Informações de Contato",
      contactText:
        "Se você tiver dúvidas sobre estes Termos e Condições, entre em contato conosco em support@neptunestribe.com",
    },
    th: {
      title: "ข้อกำหนดและเงื่อนไข",
      lastUpdated: "อัปเดตล่าสุด:",
      acceptance: "การยอมรับข้อกำหนด",
      acceptanceText:
        "โดยการเข้าถึงและใช้งาน Neptune's Tribe คุณยอมรับและตกลงที่จะผูกพันตามข้อกำหนดและบทบัญญัติของข้อตกลงนี้ ข้อกำหนดการให้บริการเหล่านี้ใช้กับผู้ใช้ทุกคนของเว็บไซต์ รวมถึงแต่ไม่จำกัดเพียงผู้ใช้ที่เป็นผู้เข้าชม ลูกค้า และผู้มีส่วนร่วมในเนื้อหา",
      description: "คำอธิบายบริการ",
      descriptionText:
        "Neptune's Tribe เป็นแพลตฟอร์มการเรียนรู้ภาษาอังกฤษเป็นภาษาต่างประเทศ (EFL) ออนไลน์ที่ผสมผสานการศึกษาด้านสิ่งแวดล้อมเข้ากับการเรียนรู้ภาษา บริการของเราประกอบด้วยแบบฝึกหัดเติมคำแบบโต้ตอบ เนื้อหาเสียง คำแปล และประสบการณ์การเรียนรู้แบบเกมที่เน้นหัวข้อสิ่งแวดล้อม การอนุรักษ์สายพันธุ์ และการตระหนักรู้ด้านนิเวศวิทยา",
      userAccounts: "บัญชีผู้ใช้",
      userAccountsText:
        "ในการเข้าถึงคุณสมบัติบางอย่างของ Neptune's Tribe คุณอาจต้องสร้างบัญชี คุณมีหน้าที่รับผิดชอบในการรักษาความลับของบัญชีและรหัสผ่านของคุณ และในการจำกัดการเข้าถึงคอมพิวเตอร์ของคุณ คุณตกลงที่จะรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ",
      subscriptions: "การสมัครสมาชิกและการชำระเงิน",
      subscriptionsText:
        "Neptune's Tribe ให้บริการสมาชิกระดับพรีเมียม โดยการซื้อการสมัครสมาชิก คุณตกลงที่จะชำระค่าธรรมเนียมทั้งหมดที่เกี่ยวข้องกับบัญชีของคุณ ค่าธรรมเนียมสมาชิกจะถูกเรียกเก็บล่วงหน้าและไม่สามารถคืนเงินได้ เว้นแต่กฎหมายกำหนดหรือตามที่ระบุไว้ในนโยบายการคืนเงินของเรา",
      userContent: "เนื้อหาและพฤติกรรมของผู้ใช้",
      userContentText:
        "ผู้ใช้ไม่สามารถอัปโหลด โพสต์ หรือส่งเนื้อหาใด ๆ ที่ผิดกฎหมาย เป็นอันตราย ข่มขู่ ล่วงละเมิด คุกคาม หมิ่นประมาท หยาบคาย อนาจาร ละเมิดความเป็นส่วนตัวของผู้อื่น เกลียดชัง หรือเหยียดเชื้อชาติ ชาติพันธุ์ หรือไม่เหมาะสมในลักษณะอื่น Neptune's Tribe ขอสงวนสิทธิ์ในการลบเนื้อหาใด ๆ ที่ละเมิดข้อกำหนดเหล่านี้",
      intellectualProperty: "ทรัพย์สินทางปัญญา",
      intellectualPropertyText:
        "เนื้อหาทั้งหมดบน Neptune's Tribe รวมถึงแต่ไม่จำกัดเพียงข้อความ กราฟิก โลโก้ รูปภาพ คลิปเสียง และซอฟต์แวร์ เป็นทรัพย์สินของ Neptune's Tribe หรือผู้จัดหาเนื้อหาของเรา และได้รับการคุ้มครองโดยกฎหมายลิขสิทธิ์ระหว่างประเทศ ผู้ใช้ไม่สามารถทำซ้ำ เผยแพร่ หรือสร้างผลงานดัดแปลงจากเนื้อหาของเราโดยไม่ได้รับอนุญาตอย่างชัดเจน",
      privacy: "ความเป็นส่วนตัว",
      privacyText:
        "ความเป็นส่วนตัวของคุณเป็นสิ่งสำคัญสำหรับเรา กรุณาตรวจสอบนโยบายความเป็นส่วนตัวของเรา ซึ่งควบคุมการใช้บริการของคุณด้วย เพื่อทำความเข้าใจแนวปฏิบัติของเรา",
      disclaimers: "ข้อจำกัดความรับผิดชอบ",
      disclaimersText:
        "Neptune's Tribe ให้บริการบนพื้นฐาน 'ตามสภาพ' และ 'ตามที่มีอยู่' เราไม่ให้การรับรองหรือการรับประกันใด ๆ ไม่ว่าโดยชัดแจ้งหรือโดยนัย เกี่ยวกับการดำเนินงานของบริการหรือข้อมูล เนื้อหา วัสดุ หรือผลิตภัณฑ์ที่รวมอยู่ในเว็บไซต์นี้",
      limitation: "ข้อจำกัดความรับผิด",
      limitationText:
        "Neptune's Tribe จะไม่รับผิดชอบต่อความเสียหายทั้งทางตรง ทางอ้อม โดยบังเอิญ พิเศษ หรือเป็นผลสืบเนื่องที่เกิดจากการใช้หรือไม่สามารถใช้บริการได้ แม้ว่าเราจะได้รับแจ้งถึงความเป็นไปได้ของความเสียหายดังกล่าวแล้วก็ตาม",
      termination: "การยุติ",
      terminationText:
        "Neptune's Tribe อาจยุติหรือระงับบัญชีและการเข้าถึงบริการของคุณโดยทันที โดยไม่ต้องแจ้งให้ทราบล่วงหน้าหรือรับผิดชอบ ด้วยเหตุผลใดก็ตาม รวมถึงแต่ไม่จำกัดเพียงการที่คุณละเมิดข้อกำหนด",
      changes: "การเปลี่ยนแปลงข้อกำหนด",
      changesText:
        "Neptune's Tribe ขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา เราจะแจ้งให้ผู้ใช้ทราบเกี่ยวกับการเปลี่ยนแปลงที่สำคัญทางอีเมลหรือผ่านบริการ การใช้บริการอย่างต่อเนื่องของคุณหลังจากการแก้ไขดังกล่าวถือเป็นการยอมรับข้อกำหนดที่อัปเดต",
      contact: "ข้อมูลการติดต่อ",
      contactText:
        "หากคุณมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขเหล่านี้ กรุณาติดต่อเราที่ support@neptunestribe.com",
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
              1. {copy.acceptance}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.acceptanceText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              2. {copy.description}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.descriptionText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              3. {copy.userAccounts}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.userAccountsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              4. {copy.subscriptions}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.subscriptionsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              5. {copy.userContent}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.userContentText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              6. {copy.intellectualProperty}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.intellectualPropertyText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              7. {copy.privacy}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.privacyText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              8. {copy.disclaimers}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.disclaimersText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              9. {copy.limitation}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.limitationText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              10. {copy.termination}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.terminationText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              11. {copy.changes}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.changesText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              12. {copy.contact}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.contactText}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
