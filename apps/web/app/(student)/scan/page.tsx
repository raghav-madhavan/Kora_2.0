import { redirect } from "next/navigation";

export default function ScanPage() {
  redirect("/log-hours#check-in");
}
