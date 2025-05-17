"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion } from "framer-motion";
import BankTransferForm from "@/components/BankTransferForm";
import PixCopyBox from "./ui/PixCopyBox";

console.log("Progress is", Progress);
console.log("Input is", Input);

export default function SupportUsSection({
  initialSupporters = 87,
  targetSupporters = 1000,
  showBankOption = true,
}) {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { lang } = useLanguage();

  const t = {
    en: {
      supportHeader: "Support Neptune’s Tribe!",
      supportSub: `Help us reach our goal of ${targetSupporters} supporters and create amazing content and features!`,
      supportBank: "Transfer to our PIX key (CPF):",
      accountName: "Name: Michael Alan Watkins",
      clickToCopy: "Click to copy",
      supportStripe: "Support via Stripe",
      dialogHeader: "Thank you for supporting Neptune’s Tribe!",
      dialogMessage:
        "Please fill in the form below and click 'Payment Made' or send your payment slip to",
      otherButton: "Other",
      enterAmount: "Enter amount (R$)",
      close: "Close",
      paymentMade: "Payment Made",
    },
    pt: {
      supportHeader: "Apoie a Neptune’s Tribe!",
      supportSub: `Ajude-nos a atingir nossa meta de ${targetSupporters} apoiadores e a criar conteúdo e recursos incríveis!`,
      supportBank: "Apoie-nos com um PIX (CPF)",
      accountName: "Nome: Michael Alan Watkins",
      clickToCopy: "Clique para copiar",

      supportStripe: "Apoie-nos via Stripe",
      dialogHeader: "Obrigado por apoiar a Neptune’s Tribe!",
      dialogMessage:
        "Por favor preencha o formulário abaixo e clique em 'Pagamento Efetuado' ou envie para",
      otherButton: "Outro",
      enterAmount: "Insira valor (R$)",
      close: "Fechar",
      paymentMade: "Pagamento Efetuado",
    },
  };

  const copy = t[lang];

  const buttonClass =
    "rounded-2xl px-4 py-1 bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950";

  const progress = Math.min((initialSupporters / targetSupporters) * 100, 100);

  const handleSupport = (method) => {
    const amount = showCustom ? Number(customAmount) : selectedAmount;
    if (!amount || amount <= 0) return alert("Please enter a valid amount.");

    if (method === "stripe") {
      // Replace with Stripe checkout call or redirect
      window.location.href = `/api/create-checkout-session?amount=${amount}`;
    } else if (method === "bank") {
      // Could trigger a modal
      document.getElementById("bank-modal").showModal();
    }
  };

  return (
    <section className="max-w-3xl mx-auto  mt-10 p-6 rounded-2xl shadow-lg bg-white dark:bg-primary-900 border border-zinc-200 dark:border-zinc-700">
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
          />
        </div>
      )}
      {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
        <Button className="mt-4" onClick={() => handleSupport("stripe")}>
          {copy.supportStripe}
        </Button>
        {showBankOption && (
          <Dialog>
            <DialogTrigger onClick={() => setIsDialogOpen(true)}>
              <button className={buttonClass}>{copy.supportBank}</button>
            </DialogTrigger>

            {isDialogOpen && (
              <DialogContent onClose={() => setIsDialogOpen(false)}>
                <p className="mb-2 text-center text-[16px] font-bold text-zinc-600 dark:text-zinc-300">
                  PIX: 72665904934 <br />
                  Michael Alan Watkins
                </p>
                <p className="mb-4 text-center font-light">
                  {copy.dialogMessage} <br />
                  <span className="font-semibold">
                    michaelalanwatkins@gmail.com
                  </span>{" "}
                </p>
                <h3 className="text-[16px] mb-2 text-center">
                  {copy.dialogHeader}
                </h3>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  {copy.close}
                </Button>
              </DialogContent>
            )}
          </Dialog>
        )}
      </div> */}

      <div className="flex flex-col mt-2 mb-6 items-center">
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
        <span className="font-semibold">michaelalanwatkins@gmail.com</span>{" "}
      </p>
      <BankTransferForm />
    </section>
  );
}
