import { LoginShell } from "@/components/login/LoginShell";
import { ZeroTrustLoginForm } from "@/components/login/ZeroTrustLoginForm";

export default function ZeroTrustLoginPage() {
  return (
    <LoginShell
      accent="zt"
      title="Verified clinical access"
      subtitle="Multi-factor · device posture · continuous session validation"
    >
      <ZeroTrustLoginForm />
    </LoginShell>
  );
}
