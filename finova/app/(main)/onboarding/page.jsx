export const dynamic = "force-dynamic";

import { checkOnboardingStatus } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import OnboardingWizard from "./_components/onboarding-wizard";

export default async function OnboardingPage() {
  const { isOnboarded } = await checkOnboardingStatus();
  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <OnboardingWizard />
    </div>
  );
}
