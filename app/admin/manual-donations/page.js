"use client";

import { useEffect, useState } from "react";
import { getPendingManualDonations } from "@/lib/data-service";
import { approveDonation } from "@/app/api/admin-actions";

export default function ManualDonationsAdminPage() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getPendingManualDonations();
      setDonations(data);
    }
    fetchData();
  }, []);

  async function handleApprove(id) {
    const res = await approveDonation(id);
    if (res.success) {
      setDonations((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Bank Transfers</h1>
      {donations.length === 0 && <p>No pending donations.</p>}
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="border p-4 rounded-xl mb-4 bg-white dark:bg-zinc-800 shadow"
        >
          <p>
            <strong>Amount:</strong> £{donation.amount}
          </p>
          <p>
            <strong>User:</strong> {donation.public?.users?.email}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(donation.created_at).toLocaleString()}
          </p>
          <button
            onClick={() => handleApprove(donation.id)}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
