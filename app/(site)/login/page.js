import { Suspense } from "react";
import LoginPage from "./LoginPage";

export default function LoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
