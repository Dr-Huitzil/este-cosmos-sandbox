import { useState } from "react";
import { useAuth } from "@/firebase";
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Rocket, Loader2, Stars } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import styles from "../views/authScreen.module.css";

/**
 * Auth screen with login / signup tabs and anonymous sign-in
 */
export function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // login | sign up

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   * @param {'login'|'signup'} type
   */
  const handleAuth = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Link Terminated",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transmission Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.starsDecor}>
        <Stars className={styles.starsIcons} />
      </div>

      <div className={styles.card}>
        <div className={styles.orbitDecor} />

        <div className={styles.cardHeader}>
          <div className={styles.rocketWrap}>
            <Rocket className={styles.rocketIcon} />
          </div>
          <h1 className={styles.title}>Este</h1>
          <h2 className={styles.titleAccent}>Cosmos</h2>
          <p className={styles.subtitle}>
            Telemetria Orbital &amp; Fleet Management
          </p>
        </div>

        <div className={styles.tabList}>
          <button
            className={`${styles.tabBtn} ${auth === "login" ? styles.tabBtnActive : ""}`}
            onClick={() => setAuthTab("login")}
          >
            Link
          </button>
          <button
            className={`${styles.tabBtn} ${authTab === "signup" ? styles.tabBtnActive : ""}`}
            onClick={() => setAuthTab("signup")}
          >
            Enlist
          </button>
        </div>

        {authTab === "login" && (
          <form
            onSubmit={(e) => handleAuth(e, "login")}
            className={styles.form}
          >
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-email" className={styles.label}>
                Email
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="someone@example.org"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-password" className={styles.label}>
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                className={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading && <Loader2 className={styles.spinner} />}
              Establish Link
            </button>
          </form>
        )}

        {authTab === "signup" && (
          <form
            onSubmit={(e) => handleAuth(e, "signup")}
            className={styles.form}
          >
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-semail" className={styles.label}>
                Email
              </label>
              <input
                id="auth-semail"
                name="email"
                type="email"
                placeholder="example@someone.org"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-spassword" className={styles.label}>
                Password
              </label>
              <input
                id="auth-spassword"
                name="password"
                type="password"
                required
                className={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading && <Loader2 className={styles.spinner} />}
              Register
            </button>
          </form>
        )}

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>Sector Scan</span>
          <span className={styles.dividerLine} />
        </div>

        <button
          className={styles.ghostBtn}
          onClick={handleAnonymous}
          disabled={isLoading}
        >
          Ghost Protocol
        </button>

        <p className={styles.footer}>Floating through the emptiness of space</p>
      </div>
    </div>
  );
}
