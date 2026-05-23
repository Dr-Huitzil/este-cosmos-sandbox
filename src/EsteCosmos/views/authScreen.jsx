import { useState } from "react";
import { useAuth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import styles from "../views/authScreen.module.css";

/**
 * Auth screen with login / signup tabs
 */
export function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // login | sign up
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "SIGNAL DISPATCHED",
        description: "Check your neural link (email) for recovery instructions.",
      });
      setIsForgotMode(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "UPLINK FAILED",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>ESTE</h1>
          <h2 className={styles.titleAccent}>COSMOS</h2>
          <p className={styles.subtitle}>FUEL TRACKING &amp; LOGISTICS</p>
        </div>

        <div className={styles.tabList}>
          <button
            className={`${styles.tabBtn} ${authTab === "login" ? styles.tabBtnActive : ""}`}
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

            <button
              type="button"
              className={styles.forgotBtn}
              onClick={() => setIsForgotMode(true)}
            >
              FORGOT ACCESS CODES?
            </button>
          </form>
        )}

        {authTab === "login" && isForgotMode && (
          <div className={styles.forgotOverlay}>
            <form onSubmit={handleResetPassword} className={styles.form}>
              <h3 className={styles.forgotTitle}>NEURAL RECOVERY</h3>
              <p className={styles.forgotDesc}>Enter your registered email to reset access.</p>
              <div className={styles.fieldGroup}>
                <input
                  type="email"
                  placeholder="PILOT@COSMOS.ORG"
                  required
                  className={styles.input}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <div className={styles.forgotActions}>
                <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                  {isLoading && <Loader2 className={styles.spinner} />}
                  SEND RESET LINK
                </button>
                <button type="button" className={styles.ghostBtn} onClick={() => setIsForgotMode(false)}>
                  ABORT
                </button>
              </div>
            </form>
          </div>
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

        <p className={styles.footer}>Floating through the emptiness of space</p>
      </div>
    </div>
  );
}
