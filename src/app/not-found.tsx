import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container_notfound}>
      <h1>Página não encontrada</h1>
      <p>O recurso solicitado não foi encontrado ou não existe.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.button}>Voltar ao início</Link>
      </div>
    </div>
  );
}