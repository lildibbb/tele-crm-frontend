import { redirect } from "next/navigation";

export default function CommandsRedirect() {
  redirect("/settings?tab=commands");
}
