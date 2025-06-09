"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BankTransferForm from "@/components/BankTransferForm";
import PixCopyBox from "./ui/PixCopyBox";
import SupportButtons from "./SupportButtons";

export default function SupportUsSectionStripeAndPix({
  initialSupporters = 90,
  targetSupporters = 1000,
  showBankOption = true,
}) {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const t = {
    en: {
      supportHeader: "Support Neptune's Tribe!",
      supportSub: `Help us reach our goal of ${targetSupporters} supporters and create amazing content and features!`,
      supportBank: "Transfer to our PIX key (CPF):",
      accountName: "Name: Michael Alan Watkins",
      clickToCopy: "Click to copy",
      supportStripe: "Support us via Stripe",
      dialogHeader: "Thank you for supporting Neptune's Tribe!",
      dialogMessage:
        "Please fill in the form below and click 'Payment Made' or send your payment slip to",
      otherButton: "Other",
      enterAmount: "Enter amount (R$)",
      close: "Close",
      paymentMade: "Payment Made",
      signInRequired: "Please sign in to support us!",
      supportWithAmount: "Support with R$",
    },
    pt: {
      supportHeader: "Apoie a Neptune's Tribe!",
      supportSub: `Ajude-nos a atingir nossa meta de ${targetSupporters} apoiadores e a criar conteúdo e recursos incríveis!`,
      supportBank: "Apoie-nos com um PIX (CPF)",
      accountName: "Nome: Michael Alan Watkins",
      clickToCopy: "Clique para copiar",
      supportStripe: "Apoie-nos via Stripe",
      dialogHeader: "Obrigado por apoiar a Neptune's Tribe!",
      dialogMessage:
        "Por favor preencha o formulário abaixo e clique em 'Pagamento Efetuado' ou envie para",
      otherButton: "Outro",
      enterAmount: "Insira valor (R$)",
      close: "Fechar",
      paymentMade: "Pagamento Efetuado",
      signInRequired: "Por favor, faça login para nos apoiar!",
      supportWithAmount: "Apoiar com R$",
    },
  };

  const copy = t[lang];

  const progress = Math.min((initialSupporters / targetSupporters) * 100, 100);

  const handleStripeSupport = async () => {
    // Check authentication
    if (status === "loading") {
      return;
    }

    if (!session) {
      alert(copy.signInRequired);
      router.push("/auth/signin");
      return;
    }

    const amount = showCustom ? Number(customAmount) : selectedAmount;

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType: "one_time",
          customAmount: amount,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert(`Something went wrong: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || status === "loading";

  return (
    <section className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white dark:bg-primary-900 border border-zinc-200 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {copy.supportHeader}
      </h2>
      <p className="text-center mb-4">{copy.supportSub}</p>
      <Progress value={progress} className="h-4 rounded-full mb-4" />
      <p className="text-[16px] text-center font-semibold font-serif mb-6">
        <span className="text-2xl font-bold font-stretch-200% font-serif text-accent-700 dark:text-accent-500">
          {initialSupporters}
        </span>{" "}
        of {targetSupporters}
      </p>

      <p className="mb-6 text-center text-[16px] font-bold text-zinc-600 dark:text-zinc-300">
        {copy.supportStripe}
      </p>

      {/* Main Stripe buttons for subscription and general one-time support */}
      <SupportButtons />

      {/* Custom amount section */}
      <div className="border-t pt-6 mt-6">
        <p className="mb-4 text-center text-[14px] font-semibold text-zinc-600 dark:text-zinc-300">
          Or choose a custom amount:
        </p>

        <div className="flex gap-4 justify-center mb-6">
          {[50, 100].map((amt) => (
            <Button
              key={amt}
              variant={
                selectedAmount === amt && !showCustom ? "default" : "outline"
              }
              onClick={() => {
                setSelectedAmount(amt);
                setShowCustom(false);
              }}
              disabled={isDisabled}
            >
              R${amt}
            </Button>
          ))}
          <Button
            variant={showCustom ? "default" : "outline"}
            onClick={() => {
              setShowCustom(true);
              setSelectedAmount(null);
            }}
            disabled={isDisabled}
          >
            {copy.otherButton}
          </Button>
        </div>

        {showCustom && (
          <div className="mb-6 text-center">
            <Input
              type="number"
              placeholder={copy.enterAmount}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-40 mx-auto"
              disabled={isDisabled}
            />
          </div>
        )}

        <div className="text-center mb-6">
          <Button
            onClick={handleStripeSupport}
            disabled={isDisabled}
            className="bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950"
          >
            {loading
              ? "Redirecting..."
              : `${copy.supportWithAmount}${
                  showCustom ? customAmount || "0" : selectedAmount
                }`}
          </Button>
        </div>
      </div>

      {/* PIX Section */}
      <div className="flex flex-col mt-8 mb-6 items-center border-t pt-6">
        <p className="mb-6 text-center text-[16px] font-bold text-zinc-600 dark:text-zinc-300">
          {copy.supportBank}
        </p>

        <PixCopyBox pixKey="72665904934" />
        <p className="text-xs text-gray-500 mt-1">{copy.clickToCopy}</p>

        <p className="m-2 text-center text-[16px] font-semibold text-zinc-600 dark:text-zinc-300">
          {copy.accountName}
        </p>
      </div>

      <p className="mb-4 text-center font-light">
        {copy.dialogMessage} <br />
        <span className="font-semibold">michaelalanwatkins@gmail.com</span>
      </p>

      <BankTransferForm />
    </section>
  );
}
