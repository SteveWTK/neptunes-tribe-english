// pages/refunds-policy/page.js
"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function RefundsPolicyPage() {
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "Refunds Policy",
      lastUpdated: "Last updated:",
      introduction: "Introduction",
      introductionText:
        "At Neptune's Tribe, we strive to provide exceptional educational services. This Refunds Policy outlines the circumstances under which refunds may be requested and processed for our premium subscription services.",
      subscriptionRefunds: "Subscription Refunds",
      generalPolicy: "General Refund Policy",
      generalPolicyText:
        "All subscription fees are charged in advance and are generally non-refundable. However, we understand that circumstances may arise where a refund is warranted, and we will consider refund requests on a case-by-case basis.",
      eligibleRefunds: "Eligible Refund Scenarios",
      eligibleRefundsText:
        "Refunds may be considered in the following circumstances:",
      technicalIssues:
        "Technical Issues: If you experience persistent technical problems that prevent you from accessing our services, and our support team cannot resolve the issue within a reasonable timeframe.",
      unauthorizedCharges:
        "Unauthorized Charges: If you notice charges to your account that you did not authorize, please contact us immediately.",
      serviceNotAsDescribed:
        "Service Not as Described: If the service significantly differs from what was described at the time of purchase.",
      duplicateCharges:
        "Duplicate Charges: If you were charged multiple times for the same subscription period.",
      refundTimeframes: "Refund Timeframes",
      timeframeText:
        "Refund requests must be submitted within the following timeframes:",
      monthlySubscriptions:
        "Monthly Subscriptions: Within 7 days of the billing date",
      annualSubscriptions:
        "Annual Subscriptions: Within 14 days of the billing date",
      freeTrials: "Free Trial Cancellations",
      freeTrialsText:
        "If you cancel your subscription before the end of your free trial period, you will not be charged. Once the trial period ends and payment is processed, the standard refund policy applies.",
      refundProcess: "Refund Process",
      howToRequest: "How to Request a Refund",
      howToRequestText:
        "To request a refund, please contact our support team with the following information:",
      requestInfo: "Your account email address",
      requestInfo2: "Transaction ID or order number",
      requestInfo3: "Reason for the refund request",
      requestInfo4:
        "Any relevant details about technical issues (if applicable)",
      processingTime: "Processing Time",
      processingTimeText:
        "Once approved, refunds will be processed within 5-10 business days. The refund will be credited to the original payment method used for the purchase.",
      nonRefundable: "Non-Refundable Items",
      nonRefundableText: "The following are not eligible for refunds:",
      nonRefundableList:
        "Subscription fees for services that have been actively used beyond the refund timeframe",
      nonRefundableList2: "Fees for completed educational content or exercises",
      nonRefundableList3:
        "Promotional or discounted subscription rates (unless required by law)",
      nonRefundableList4:
        "Subscriptions purchased through third-party platforms (subject to their refund policies)",
      partialRefunds: "Partial Refunds",
      partialRefundsText:
        "In certain circumstances, we may offer partial refunds based on the unused portion of your subscription. This will be evaluated on a case-by-case basis.",
      chargebacks: "Chargebacks and Disputes",
      chargebacksText:
        "If you initiate a chargeback or payment dispute through your financial institution without first contacting us, your account may be suspended pending resolution. We encourage you to contact our support team first to resolve any billing concerns.",
      modificationsToPolicy: "Modifications to This Policy",
      modificationsText:
        "We reserve the right to modify this Refunds Policy at any time. Changes will be effective immediately upon posting on our website. We will notify users of any material changes via email or through our platform.",
      localLaws: "Local Laws and Regulations",
      localLawsText:
        "This policy is subject to applicable local laws and regulations. If you are located in a jurisdiction that provides additional consumer rights regarding refunds, those rights will apply in addition to this policy.",
      contact: "Contact Information",
      contactText:
        "For refund requests or questions about this policy, please contact our support team:",
      contactEmail: "Email: support@neptunestribe.com",
      contactSubject: "Subject Line: Refund Request - [Your Order Number]",
      contactResponse:
        "We typically respond to refund requests within 24-48 hours.",
      customerSatisfaction: "Customer Satisfaction",
      customerSatisfactionText:
        "Your satisfaction is important to us. If you're experiencing issues with our service, we encourage you to contact our support team before requesting a refund. We may be able to resolve your concerns or offer alternative solutions.",
    },
    pt: {
      title: "Política de Reembolsos",
      lastUpdated: "Última atualização:",
      introduction: "Introdução",
      introductionText:
        "No Neptune's Tribe, nos esforçamos para fornecer serviços educacionais excepcionais. Esta Política de Reembolsos descreve as circunstâncias sob as quais reembolsos podem ser solicitados e processados para nossos serviços de assinatura premium.",
      subscriptionRefunds: "Reembolsos de Assinatura",
      generalPolicy: "Política Geral de Reembolso",
      generalPolicyText:
        "Todas as taxas de assinatura são cobradas antecipadamente e geralmente não são reembolsáveis. No entanto, entendemos que circunstâncias podem surgir onde um reembolso é justificado, e consideraremos solicitações de reembolso caso a caso.",
      eligibleRefunds: "Cenários Elegíveis para Reembolso",
      eligibleRefundsText:
        "Reembolsos podem ser considerados nas seguintes circunstâncias:",
      technicalIssues:
        "Problemas Técnicos: Se você experimentar problemas técnicos persistentes que impedem o acesso aos nossos serviços, e nossa equipe de suporte não conseguir resolver o problema em um prazo razoável.",
      unauthorizedCharges:
        "Cobranças Não Autorizadas: Se você notar cobranças em sua conta que não autorizou, entre em contato conosco imediatamente.",
      serviceNotAsDescribed:
        "Serviço Não Conforme Descrito: Se o serviço diferir significativamente do que foi descrito no momento da compra.",
      duplicateCharges:
        "Cobranças Duplicadas: Se você foi cobrado várias vezes pelo mesmo período de assinatura.",
      refundTimeframes: "Prazos de Reembolso",
      timeframeText:
        "Solicitações de reembolso devem ser enviadas dentro dos seguintes prazos:",
      monthlySubscriptions:
        "Assinaturas Mensais: Dentro de 7 dias da data de cobrança",
      annualSubscriptions:
        "Assinaturas Anuais: Dentro de 14 dias da data de cobrança",
      freeTrials: "Cancelamentos de Teste Gratuito",
      freeTrialsText:
        "Se você cancelar sua assinatura antes do final do período de teste gratuito, não será cobrado. Uma vez que o período de teste termine e o pagamento seja processado, a política padrão de reembolso se aplica.",
      refundProcess: "Processo de Reembolso",
      howToRequest: "Como Solicitar um Reembolso",
      howToRequestText:
        "Para solicitar um reembolso, entre em contato com nossa equipe de suporte com as seguintes informações:",
      requestInfo: "Endereço de e-mail da sua conta",
      requestInfo2: "ID da transação ou número do pedido",
      requestInfo3: "Motivo da solicitação de reembolso",
      requestInfo4:
        "Quaisquer detalhes relevantes sobre problemas técnicos (se aplicável)",
      processingTime: "Tempo de Processamento",
      processingTimeText:
        "Uma vez aprovado, os reembolsos serão processados dentro de 5-10 dias úteis. O reembolso será creditado no método de pagamento original usado para a compra.",
      nonRefundable: "Itens Não Reembolsáveis",
      nonRefundableText: "Os seguintes não são elegíveis para reembolsos:",
      nonRefundableList:
        "Taxas de assinatura para serviços que foram ativamente usados além do prazo de reembolso",
      nonRefundableList2:
        "Taxas por conteúdo educacional ou exercícios concluídos",
      nonRefundableList3:
        "Taxas de assinatura promocionais ou com desconto (exceto quando exigido por lei)",
      nonRefundableList4:
        "Assinaturas compradas através de plataformas de terceiros (sujeitas às suas políticas de reembolso)",
      partialRefunds: "Reembolsos Parciais",
      partialRefundsText:
        "Em certas circunstâncias, podemos oferecer reembolsos parciais baseados na parte não utilizada de sua assinatura. Isso será avaliado caso a caso.",
      chargebacks: "Estornos e Disputas",
      chargebacksText:
        "Se você iniciar um estorno ou disputa de pagamento através de sua instituição financeira sem primeiro entrar em contato conosco, sua conta pode ser suspensa até a resolução. Encorajamos você a contactar nossa equipe de suporte primeiro para resolver quaisquer preocupações de cobrança.",
      modificationsToPolicy: "Modificações nesta Política",
      modificationsText:
        "Reservamos o direito de modificar esta Política de Reembolsos a qualquer momento. As alterações serão efetivas imediatamente após serem publicadas em nosso site. Notificaremos os usuários de quaisquer alterações materiais via e-mail ou através de nossa plataforma.",
      localLaws: "Leis e Regulamentações Locais",
      localLawsText:
        "Esta política está sujeita às leis e regulamentações locais aplicáveis. Se você estiver localizado em uma jurisdição que fornece direitos adicionais do consumidor sobre reembolsos, esses direitos se aplicarão além desta política.",
      contact: "Informações de Contato",
      contactText:
        "Para solicitações de reembolso ou perguntas sobre esta política, entre em contato com nossa equipe de suporte:",
      contactEmail: "E-mail: support@neptunestribe.com",
      contactSubject:
        "Linha de Assunto: Solicitação de Reembolso - [Seu Número de Pedido]",
      contactResponse:
        "Normalmente respondemos às solicitações de reembolso dentro de 24-48 horas.",
      customerSatisfaction: "Satisfação do Cliente",
      customerSatisfactionText:
        "Sua satisfação é importante para nós. Se você estiver enfrentando problemas com nosso serviço, encorajamos você a entrar em contato com nossa equipe de suporte antes de solicitar um reembolso. Podemos ser capazes de resolver suas preocupações ou oferecer soluções alternativas.",
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
              2. {copy.subscriptionRefunds}
            </h2>

            <div className="ml-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.generalPolicy}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.generalPolicyText}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.eligibleRefunds}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {copy.eligibleRefundsText}
                </p>
                <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• {copy.technicalIssues}</li>
                  <li>• {copy.unauthorizedCharges}</li>
                  <li>• {copy.serviceNotAsDescribed}</li>
                  <li>• {copy.duplicateCharges}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              3. {copy.refundTimeframes}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.timeframeText}
            </p>
            <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>• {copy.monthlySubscriptions}</li>
              <li>• {copy.annualSubscriptions}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              4. {copy.freeTrials}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.freeTrialsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              5. {copy.refundProcess}
            </h2>

            <div className="ml-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.howToRequest}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {copy.howToRequestText}
                </p>
                <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• {copy.requestInfo}</li>
                  <li>• {copy.requestInfo2}</li>
                  <li>• {copy.requestInfo3}</li>
                  <li>• {copy.requestInfo4}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {copy.processingTime}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {copy.processingTimeText}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              6. {copy.nonRefundable}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.nonRefundableText}
            </p>
            <ul className="ml-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>• {copy.nonRefundableList}</li>
              <li>• {copy.nonRefundableList2}</li>
              <li>• {copy.nonRefundableList3}</li>
              <li>• {copy.nonRefundableList4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              7. {copy.partialRefunds}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.partialRefundsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              8. {copy.chargebacks}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.chargebacksText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              9. {copy.modificationsToPolicy}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.modificationsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              10. {copy.localLaws}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.localLawsText}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              11. {copy.contact}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {copy.contactText}
            </p>
            <div className="ml-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p>{copy.contactEmail}</p>
              <p>{copy.contactSubject}</p>
              <p className="text-sm italic">{copy.contactResponse}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-orbitron font-semibold text-gray-800 dark:text-white mb-4">
              12. {copy.customerSatisfaction}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {copy.customerSatisfactionText}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
