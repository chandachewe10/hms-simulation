import { LoginShell } from "@/components/login/LoginShell";
import { TraditionalLoginForm } from "@/components/login/TraditionalLoginForm";

export default function TraditionalLoginPage() {
  return (
    <LoginShell
      accent="legacy"
      title="Hospital intranet sign-in"
      subtitle="Password authentication · trusted network assumed"
    >
      <TraditionalLoginForm />
    </LoginShell>
  );
}
