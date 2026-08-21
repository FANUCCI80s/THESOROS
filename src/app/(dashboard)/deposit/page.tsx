"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy, Loader2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/auth/client";
import type {
  DepositOptionsResponse,
  ManualDepositResponse,
  AutomaticInitiateResponse,
  AutomaticProofResponse,
} from "@/types";

type Method = "MANUAL" | "AUTOMATIC" | null;
type Step = "method" | "form" | "pay" | "proof" | "done";

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/uploads", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Upload failed");
  }
  return data.url as string;
}

export default function DepositPage() {
  const [method, setMethod] = useState<Method>(null);
  const [step, setStep] = useState<Step>("method");
  const [options, setOptions] = useState<DepositOptionsResponse | null>(null);
  const [amount, setAmount] = useState("");
  const [cryptoId, setCryptoId] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [configId, setConfigId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [depositId, setDepositId] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    const res = await apiGet<DepositOptionsResponse>("/api/deposits/options");
    if (res.success) {
      setOptions(res as unknown as DepositOptionsResponse & { success: true });
    } else {
      setError(res.error);
    }
    setLoadingOptions(false);
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const cryptos = options?.cryptocurrencies ?? [];
  const networks =
    cryptos.find((c) => c.id === cryptoId)?.networks ?? [];

  const selectMethod = (m: Method) => {
    setMethod(m);
    setStep("form");
    setError("");
  };

  const onCryptoChange = (id: string) => {
    setCryptoId(id);
    setNetworkId("");
    setConfigId("");
    setWalletAddress("");
  };

  const onNetworkChange = (id: string) => {
    setNetworkId(id);
    if (!options || !method) return;
    if (method === "MANUAL") {
      const cfg = options.manual.find(
        (c) => c.cryptocurrencyId === cryptoId && c.networkId === id
      );
      setWalletAddress(cfg?.walletAddress ?? "");
      setWarning(cfg?.warningMessage ?? null);
      setConfigId(cfg?.id ?? "");
    } else {
      const cfg =
        options.automatic.find(
          (c) =>
            c.cryptocurrencyId === cryptoId &&
            (c.networkId === id || !c.networkId)
        ) ?? options.automatic.find((c) => c.cryptocurrencyId === cryptoId);
      setConfigId(cfg?.id ?? "");
      setPaymentUrl(cfg?.paymentUrl ?? "");
      setWalletAddress(cfg?.walletAddress ?? "");
      setWarning(cfg?.warningMessage ?? null);
    }
  };

  const handleManualSubmit = async () => {
    if (!proofFile || !amount || !cryptoId || !networkId) {
      setError("Complete all fields and attach proof");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const proofUrl = await uploadFile(proofFile);
      const res = await apiPost<ManualDepositResponse>("/api/deposits/manual", {
        amount,
        cryptocurrencyId: cryptoId,
        networkId,
        proofUrl,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoInitiate = async () => {
    if (!amount || !cryptoId) {
      setError("Enter amount and select asset");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<AutomaticInitiateResponse>(
        "/api/deposits/automatic/initiate",
        {
          amount,
          cryptocurrencyId: cryptoId,
          networkId: networkId || null,
          configId: configId || undefined,
        }
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      setDepositId(res.depositId);
      setPaymentUrl(res.paymentUrl);
      setWalletAddress(res.walletAddress ?? "");
      setWarning(res.warningMessage);
      setStep("pay");
      if (res.paymentUrl) {
        window.open(res.paymentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoProof = async () => {
    if (!proofFile || !depositId) {
      setError("Upload proof of payment");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const proofUrl = await uploadFile(proofFile);
      const res = await apiPost<AutomaticProofResponse>(
        "/api/deposits/automatic/proof",
        { depositId, proofUrl }
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyWallet = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-24 text-foreground-muted">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading deposit options…
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-muted text-gold mb-2">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">
          Deposit Submitted
        </h1>
        <p className="text-foreground-muted text-sm">
          Status is <span className="text-gold">PENDING</span>. Balance updates
          only after admin approval — not immediately.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          New deposit
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">
          Deposit
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Crypto only · Manual or automatic · Admin review required
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {step === "method" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => selectMethod("MANUAL")}
            className="card-premium p-5 text-left hover:border-gold-border transition-colors"
          >
            <h3 className="font-medium">Manual Deposit</h3>
            <p className="text-xs text-foreground-muted mt-1">
              Send crypto to wallet, upload proof → PENDING
            </p>
          </button>
          <button
            type="button"
            onClick={() => selectMethod("AUTOMATIC")}
            className="card-premium p-5 text-left hover:border-gold-border transition-colors"
          >
            <h3 className="font-medium">Automatic Deposit</h3>
            <p className="text-xs text-foreground-muted mt-1">
              PAY NOW → external page → return → proof → PENDING
            </p>
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="card-premium p-5 space-y-4">
          <div>
            <label className="text-xs text-foreground-muted">Amount (USD)</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
            />
          </div>
          <div>
            <label className="text-xs text-foreground-muted">Cryptocurrency</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              value={cryptoId}
              onChange={(e) => onCryptoChange(e.target.value)}
            >
              <option value="">Select</option>
              {cryptos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name}
                </option>
              ))}
            </select>
          </div>
          {networks.length > 0 && (
            <div>
              <label className="text-xs text-foreground-muted">Network</label>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                value={networkId}
                onChange={(e) => onNetworkChange(e.target.value)}
              >
                <option value="">Select</option>
                {networks.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {method === "MANUAL" && walletAddress && (
            <>
              <div>
                <label className="text-xs text-foreground-muted">Wallet</label>
                <div className="mt-1 flex gap-2">
                  <code className="flex-1 text-xs break-all bg-background border border-border rounded-lg px-3 py-2">
                    {walletAddress}
                  </code>
                  <Button type="button" variant="outline" size="sm" onClick={copyWallet}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {warning && (
                <p className="text-xs text-warning border border-warning/30 bg-warning/5 rounded-lg px-3 py-2">
                  {warning}
                </p>
              )}
              <div>
                <label className="text-xs text-foreground-muted">Proof of payment</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="mt-1 block w-full text-sm"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button
                variant="gold"
                className="w-full"
                isLoading={loading}
                onClick={handleManualSubmit}
              >
                I have sent the payment
              </Button>
            </>
          )}

          {method === "AUTOMATIC" && (
            <Button
              variant="gold"
              className="w-full"
              isLoading={loading}
              onClick={handleAutoInitiate}
            >
              PAY NOW
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("method");
              setMethod(null);
            }}
          >
            Back
          </Button>
        </div>
      )}

      {step === "pay" && (
        <div className="card-premium p-5 space-y-4">
          <p className="text-sm text-foreground-muted">
            Complete payment on the external page, then return here to upload proof.
            Deposit stays <span className="text-gold">PENDING</span> until admin approval.
          </p>
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-gold underline"
            >
              Open payment page again
            </a>
          )}
          {warning && (
            <p className="text-xs text-warning border border-warning/30 bg-warning/5 rounded-lg px-3 py-2">
              {warning}
            </p>
          )}
          <div>
            <label className="text-xs text-foreground-muted">Proof of payment</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="mt-1 block w-full text-sm"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button
            variant="gold"
            className="w-full"
            isLoading={loading}
            onClick={handleAutoProof}
          >
            Submit proof
          </Button>
        </div>
      )}
    </div>
  );
}
