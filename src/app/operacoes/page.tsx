"use client";

import Button from "@/components/Button/Button";
import FormField from "@/components/FormField/FormField";
import Input from "@/components/Input/Input";
import LogoutButton from "@/components/LogoutButton";
import { useReducer } from "react";
import styles from './operacoes.module.css';
import Link from "next/link";
import { depositAction, transferAction, reversalAction } from "./actions";

type State = {
  depositAmount: string;
  transferEmail: string;
  transferAmount: string;
  reversalId: string;
  message: string;
  messageType: "success" | "error" | null;
  loading: boolean;
  activeTab: "deposit" | "transfer" | "reversal";
  errors: {
    deposit?: string;
    transfer?: string;
    reversal?: string;
  };
};

type FieldKey = "depositAmount" | "transferEmail" | "transferAmount" | "reversalId";

type Action =
  | { type: "SET_FIELD"; field: FieldKey; value: string }
  | { type: "SET_ERROR"; section: "deposit" | "transfer" | "reversal"; error: string }
  | { type: "CLEAR_ERROR"; section: "deposit" | "transfer" | "reversal" }
  | { type: "SET_MESSAGE"; message: string; kind: "success" | "error" | null }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "RESET_SECTION"; section: "deposit" | "transfer" | "reversal" }
  | { type: "SET_TAB"; tab: "deposit" | "transfer" | "reversal" };

const initialState: State = {
  depositAmount: "",
  transferEmail: "",
  transferAmount: "",
  reversalId: "",
  message: "",
  messageType: null,
  loading: false,
  activeTab: "deposit",
  errors: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value } as State;
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.section]: action.error } };
    case "CLEAR_ERROR":
      const { [action.section]: _removed, ...rest } = state.errors;
      return { ...state, errors: rest };
    case "SET_MESSAGE":
      return { ...state, message: action.message, messageType: action.kind };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "RESET_SECTION":
      if (action.section === "deposit") {
        return { ...state, depositAmount: "" };
      }
      if (action.section === "transfer") {
        return { ...state, transferEmail: "", transferAmount: "" };
      }
      if (action.section === "reversal") {
        return { ...state, reversalId: "" };
      }
      return state;
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    default:
      return state;
  }
}

export default function OperacoesPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidMoney = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0;
  };
  const isValidId = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isInteger(n) && n > 0;
  };

  const isErrorMessage = state.messageType === "error";

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_MESSAGE", message: "", kind: null });
    dispatch({ type: "CLEAR_ERROR", section: "deposit" });
    try {
      if (!isValidMoney(state.depositAmount)) {
        dispatch({ type: "SET_ERROR", section: "deposit", error: "Informe um valor válido (maior que 0)" });
        return;
      }
      const amount = parseFloat(state.depositAmount);
      const result = await depositAction(amount);
      if (!result.ok) throw new Error(result.error || "Falha no depósito");
      dispatch({ type: "SET_MESSAGE", message: `Depósito OK. Novo saldo: ${(result.balanceCents ?? 0) / 100}`, kind: "success" });
      dispatch({ type: "RESET_SECTION", section: "deposit" });
    } catch (err: any) {
      dispatch({ type: "SET_MESSAGE", message: err.message || "Erro inesperado no depósito", kind: "error" });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_MESSAGE", message: "", kind: null });
    dispatch({ type: "CLEAR_ERROR", section: "transfer" });
    try {
      if (!emailRegex.test(state.transferEmail)) {
        dispatch({ type: "SET_ERROR", section: "transfer", error: "Email do destinatário inválido" });
        return;
      }
      if (!isValidMoney(state.transferAmount)) {
        dispatch({ type: "SET_ERROR", section: "transfer", error: "Informe um valor válido (maior que 0)" });
        return;
      }
      const amount = parseFloat(state.transferAmount);
      const result = await transferAction(state.transferEmail, amount);
      if (!result.ok) throw new Error(result.error || "Falha na transferência");
      dispatch({ type: "SET_MESSAGE", message: `Transferência OK. Novo saldo: ${(result.balanceCents ?? 0) / 100}`, kind: "success" });
      dispatch({ type: "RESET_SECTION", section: "transfer" });
    } catch (err: any) {
      dispatch({ type: "SET_MESSAGE", message: err.message || "Erro inesperado na transferência", kind: "error" });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  async function handleReversal(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_MESSAGE", message: "", kind: null });
    dispatch({ type: "CLEAR_ERROR", section: "reversal" });
    try {
      if (!isValidId(state.reversalId)) {
        dispatch({ type: "SET_ERROR", section: "reversal", error: "Informe um ID de transação válido" });
        return;
      }
      const id = parseInt(state.reversalId, 10);
      const result = await reversalAction(id);
      if (!result.ok) throw new Error(result.error || "Falha na reversão");
      dispatch({ type: "SET_MESSAGE", message: "Operação revertida com sucesso.", kind: "success" });
      dispatch({ type: "RESET_SECTION", section: "reversal" });
    } catch (err: any) {
      dispatch({ type: "SET_MESSAGE", message: err.message || "Erro inesperado na reversão", kind: "error" });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  return (
    <div className={styles.container_operaceos}>
      <div className={styles.header}>
        <h1>Operações</h1>
        <LogoutButton />
      </div>
      <p>Execute depósitos, transferências e reversões.</p>
      <div className={styles.toolbar}>
        <Link href="/operacoes/lista">
          <Button type="button">Ver histórico</Button>
        </Link>
      </div>
      {state.message && (
        <div
          aria-live="polite"
          className={`${styles.message} ${isErrorMessage ? styles.message_error : styles.message_success}`}
        >
          {state.message}
        </div>
      )}
      <div className={styles.tabs} role="tablist" aria-label="Tipo de operação">
        <button
          type="button"
          role="tab"
          aria-selected={state.activeTab === 'deposit'}
          className={`${styles.tab} ${state.activeTab === 'deposit' ? styles.tab_active : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'deposit' })}
        >
          Depósito
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={state.activeTab === 'transfer'}
          className={`${styles.tab} ${state.activeTab === 'transfer' ? styles.tab_active : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'transfer' })}
        >
          Transferência
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={state.activeTab === 'reversal'}
          className={`${styles.tab} ${state.activeTab === 'reversal' ? styles.tab_active : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'reversal' })}
        >
          Reversão
        </button>
      </div>
      {state.activeTab === 'deposit' && (
      <section style={{ marginTop: 24 }}>
        <h2>Depósito</h2>
        <form onSubmit={handleDeposit}>
          <FormField id="depositAmount" label="Valor (R$):" error={state.errors.deposit}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={state.depositAmount}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "depositAmount", value: e.target.value })}
              placeholder="Valor (R$)"
              required
            />
            <Button type="submit" disabled={state.loading}>
              Depositar
            </Button>
          </FormField>
        </form>
      </section>
      )}

      {state.activeTab === 'transfer' && (
      <section>
        <h2>Transferência</h2>
        <form onSubmit={handleTransfer} className="">
          <FormField id="transferEmail" label="E-mail do destinatário:" error={state.errors.transfer}>
            <Input
              type="email"
              value={state.transferEmail}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "transferEmail", value: e.target.value })}
              placeholder="E-mail do destinatário"
              required
            />
          </FormField>
          <FormField id="transferAmount" label="Valor (R$):" error={state.errors.transfer}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={state.transferAmount}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "transferAmount", value: e.target.value })}
              placeholder="Valor (R$)"
              required
            />
            <Button type="submit" disabled={state.loading}>
            Transferir
            </Button>
          </FormField>
 
        </form>
      </section>
      )}

      {state.activeTab === 'reversal' && (
      <section>
        <h2>Reversão</h2>
        <form onSubmit={handleReversal}>
          <FormField id="reversalId" label="ID da transação:" error={state.errors.reversal}>
          <Input
            type="number"
            min="1"
            value={state.reversalId}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "reversalId", value: e.target.value })}
            placeholder="ID da transação"
            required
          />
          <Button type="submit" disabled={state.loading}>
            Reverter
          </Button>
          </FormField>
        </form>
      </section>
      )}
    </div>
  );
}