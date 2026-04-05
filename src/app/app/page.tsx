import { redirect } from "next/navigation";
import { getNeonAuth } from "@/lib/auth/server";
import LabelStudio from "./label-studio";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const auth = getNeonAuth();
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return <LabelStudio />;
}
