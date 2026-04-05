import { redirect } from "next/navigation";
import { getNeonAuth } from "@/lib/auth/server";
import { LandingPage } from "@/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const auth = getNeonAuth();
    const { data: session } = await auth.getSession();
    if (session?.user) redirect("/app");
  } catch {
    // fail-open: render landing page on error
  }
  return <LandingPage />;
}
