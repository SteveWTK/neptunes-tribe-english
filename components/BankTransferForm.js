"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BankTransferForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { lang } = useLanguage();

  const t = {
    en: {
      name: "Name *",
      email: "Email address *",
      amount: "Amount (optional)",
      receipt: "Upload receipt (optional)",
      sending: "Sending...",
      paymentMade: "Payment Made",
    },
    pt: {
      name: "Nome *",
      email: "Endereço de email *",
      amount: "Valor (Opcional)",
      receipt: "Fazer upload do comprovante (opcional)",
      sending: "Enviando...",
      paymentMade: "Pagamento Efetuado",
    },
  };

  const copy = t[lang];

  const buttonClass =
    "rounded-2xl px-4 py-1 bg-gradient-to-b from-primary-100 to-primary-300 hover:from-primary-200 hover:to-primary-400 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950";

  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (amount) formData.append("amount", amount);
      if (file) formData.append("file", file);

      const res = await fetch("/api/bank-transfer", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Thanks! Redirecting...");
        router.push(
          `/thank-you?name=${encodeURIComponent(
            name
          )}&email=${encodeURIComponent(email)}`
        );

        setName("");
        setEmail("");
        setAmount("");
        setFile(null);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Submission error", err);
      toast.error("Error sending form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="text-center space-y-4 max-w-md mx-auto"
    >
      <div>
        <label className="block text-sm font-medium">{copy.name}</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{copy.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{copy.amount}</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{copy.receipt}</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full mt-1 p-2 border rounded font-light text-center"
        />
      </div>

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? sending : copy.paymentMade}
      </button>
    </form>
  );
}
