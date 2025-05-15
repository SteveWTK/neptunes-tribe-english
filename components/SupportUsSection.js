"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/contexts/LanguageContext";

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
      supportBank: "Support via Transfer",
      supportStripe: "Support via Stripe",
      dialogHeader: "Thank you for supporting Neptune’s Tribe!",
      dialogMessage: "Please sent the transfer receipt to",
    },
    pt: {
      supportHeader: "Apoie a Neptune’s Tribe!",
      supportSub: `Ajude-nos a atingir nossa meta de ${targetSupporters} apoiadores e a criar conteúdo e recursos incríveis!`,
      supportBank: "Apoie-nos com um PIX",
      supportStripe: "Apoie-nos via Stripe",
      dialogHeader: "Obrigado por apoiar a Neptune’s Tribe!",
      dialogMessage: "Por favor envie o comprovante para",
    },
  };

  const copy = t[lang];

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
        </span>
        <br /> of {targetSupporters}
      </p>
      {/* <DonationAmountSelector
              onChange={(val) => setSelectedAmount(val)}
            /> */}

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
          Other
        </Button>
      </div>

      {showCustom && (
        <div className="mb-6 text-center">
          <Input
            type="number"
            placeholder="Enter amount (R$)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-40 mx-auto"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="mt-4" onClick={() => handleSupport("stripe")}>
          {copy.supportStripe}
        </Button>
        {showBankOption && (
          <Dialog>
            <DialogTrigger onClick={() => setIsDialogOpen(true)}>
              <Button className="w-full mt-4">{copy.supportBank}</Button>
            </DialogTrigger>

            {isDialogOpen && (
              <DialogContent onClose={() => setIsDialogOpen(false)}>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {copy.dialogHeader}
                </h3>
                <p className="mb-2 text-center text-[16px] font-bold text-zinc-600 dark:text-zinc-300">
                  PIX: 72665904934 <br />
                  Michael Alan Watkins
                </p>
                <p className="mb-4 text-center font-light">
                  {copy.dialogMessage} <br />
                  <span className="font-semibold">
                    neptunes-tribe@gmail.com
                  </span>{" "}
                </p>

                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </DialogContent>
            )}
          </Dialog>
        )}
      </div>
    </section>
  );
}
