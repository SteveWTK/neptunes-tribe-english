import { Suspense } from "react";
import LoginPage from "./LoginPage.js";

export default function LoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
