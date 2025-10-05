"use client";
import { useEffect, useState } from "react";
import styles from "./lista.module.css";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";
  amountCents: number;
  status: "COMPLETED" | "REVERSED" | string;
  createdAt: string;
  fromUserId?: number | null;
  toUserId?: number | null;
};

export default function ListaOperacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Falha ao carregar operações");
        if (mounted) setTransactions(data.transactions || []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Erro inesperado");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.container_lista}>
      <h1>Histórico de Operações</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <p>Você ainda não possui operações recentes.</p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <ul className={styles.lista}>
          {transactions.map((t) => (
            <li key={t.id} className={styles.item}>
              <div className={styles.left}>
                <span className={styles.type}>{t.type}</span>
                <span className={styles.id}>ID #{t.id}</span>
                <span className={styles.status}>{t.status}</span>
                <span className={styles.date}>{formatDate(t.createdAt)}</span>
              </div>
              <div className={styles.right}>
                <span className={styles.amount}>{formatAmount(t.amountCents)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}