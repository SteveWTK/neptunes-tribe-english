"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  KeyRound,
  Plus,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Copy,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Admin page to generate and manage beta tester invitation codes
 */
export default function BetaCodesAdminPage() {
  const { data: session, status } = useSession();
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generation form state
  const [organization, setOrganization] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [expirationMonths, setExpirationMonths] = useState(12);
  const [notes, setNotes] = useState("");
  const [codeType, setCodeType] = useState("beta_tester");
  const [premiumDurationMonths, setPremiumDurationMonths] = useState(12);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");

  // Filter state
  const [filterOrg, setFilterOrg] = useState("");
  const [filterUsed, setFilterUsed] = useState("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchCodes();
    }
  }, [status, filterOrg, filterUsed]);

  const fetchCodes = async () => {
    try {
      setIsLoading(true);
      let url = "/api/beta-code/list";
      const params = new URLSearchParams();
      if (filterOrg) params.append("organization", filterOrg);
      if (filterUsed !== "all") params.append("isUsed", filterUsed);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCodes(data.codes);
        setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to load codes");
      }
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error("Failed to load codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!organization.trim() || quantity < 1) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/beta-code/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: organization.trim(),
          quantity,
          expirationMonths,
          notes: notes.trim() || null,
          codeType,
          premiumDurationMonths: codeType !== 'beta_tester' ? premiumDurationMonths : null,
          purchaserName: purchaserName.trim() || null,
          purchaserEmail: purchaserEmail.trim() || null,
          purchaseAmount: purchaseAmount ? parseFloat(purchaseAmount) : null,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Generated ${data.count} codes for ${organization}`);

        // Download codes as text file
        const blob = new Blob([data.codes.join("\n")], {
          type: "text/plain",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `beta-codes-${organization.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        // Reset form
        setOrganization("");
        setQuantity(10);
        setExpirationMonths(12);
        setNotes("");
        setCodeType("beta_tester");
        setPremiumDurationMonths(12);
        setPurchaserName("");
        setPurchaserEmail("");
        setPurchaseAmount("");
        setOriginalPrice("");

        // Refresh list
        fetchCodes();
      } else {
        toast.error(data.error || "Failed to generate codes");
      }
    } catch (error) {
      console.error("Error generating codes:", error);
      toast.error("Failed to generate codes");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const exportCodes = () => {
    const csv = [
      [
        "Code",
        "Organization",
        "Used",
        "Used By",
        "Used At",
        "Created At",
        "Expires At",
        "Notes",
      ].join(","),
      ...codes.map((c) =>
        [
          c.code,
          c.organization,
          c.is_used ? "Yes" : "No",
          c.used_by_email || "",
          c.used_at ? new Date(c.used_at).toLocaleString() : "",
          new Date(c.created_at).toLocaleString(),
          c.expires_at ? new Date(c.expires_at).toLocaleString() : "Never",
          c.notes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beta-codes-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Codes exported to CSV");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "platform_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Beta Invitation Codes
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and manage beta tester invitation codes for NGO partners
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <KeyRound className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Codes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Used
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.used}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unused
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.unused}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organizations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.organizations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Generate New Codes */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generate Codes
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="WWF Brazil"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Codes *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code Type *
                  </label>
                  <select
                    value={codeType}
                    onChange={(e) => setCodeType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beta_tester">Beta Tester (Free)</option>
                    <option value="bulk_premium">Bulk Premium</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="donated_premium">Donated Premium</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>

                {codeType !== 'beta_tester' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Premium Duration (months) *
                    </label>
                    <input
                      type="number"
                      value={premiumDurationMonths || ''}
                      onChange={(e) => setPremiumDurationMonths(e.target.value ? parseInt(e.target.value) : null)}
                      min="1"
                      max="120"
                      placeholder="Leave empty for lifetime"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty for lifetime access
                    </p>
                  </div>
                )}

                {codeType !== 'beta_tester' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchaser Name
                      </label>
                      <input
                        type="text"
                        value={purchaserName}
                        onChange={(e) => setPurchaserName(e.target.value)}
                        placeholder="Company/Person who purchased"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchaser Email
                      </label>
                      <input
                        type="email"
                        value={purchaserEmail}
                        onChange={(e) => setPurchaserEmail(e.target.value)}
                        placeholder="contact@company.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Amount Paid (£)
                        </label>
                        <input
                          type="number"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          placeholder="500.00"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Original Price (£)
                        </label>
                        <input
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="1200.00"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code Expiration (months)
                  </label>
                  <input
                    type="number"
                    value={expirationMonths}
                    onChange={(e) =>
                      setExpirationMonths(parseInt(e.target.value))
                    }
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Q1 2025 batch"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {isGenerating ? "Generating..." : "Generate Codes"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Codes List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  All Codes ({codes.length})
                </h2>
                <button
                  onClick={exportCodes}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <select
                    value={filterOrg}
                    onChange={(e) => setFilterOrg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Organizations</option>
                    {stats?.organizations.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={filterUsed}
                    onChange={(e) => setFilterUsed(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="false">Unused</option>
                    <option value="true">Used</option>
                  </select>
                </div>
              </div>

              {/* Codes Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Code
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Organization
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Used By
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr
                        key={code.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-2">
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {code.code}
                          </code>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${
                            code.code_type === 'beta_tester' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                            code.code_type === 'enterprise' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' :
                            code.code_type === 'donated_premium' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                          }`}>
                            {code.code_type?.replace('_', ' ') || 'beta'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                          {code.organization}
                        </td>
                        <td className="py-3 px-2">
                          {code.is_used ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 px-2 py-1 rounded">
                              <CheckCircle className="w-3 h-3" />
                              Used
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              <XCircle className="w-3 h-3" />
                              Unused
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                          {code.used_by_email || "-"}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => copyCode(code.code)}
                            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {codes.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No codes found. Generate some codes to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
