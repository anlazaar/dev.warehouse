import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | DEV.WAREHOUSE",
  description: "Private developer notebook and visual workspace authentication",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background bg-dot-grid relative overflow-hidden p-4 sm:p-6 select-none">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Form Container */}
      <LoginForm />
    </main>
  );
}
