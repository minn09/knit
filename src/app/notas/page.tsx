import type { Metadata } from "next";
import { NotasClient } from "./NotasClient";

export const metadata: Metadata = { title: "Notas · Knit" };

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string }>;
}) {
  const params = await searchParams;
  const initialNoteId = typeof params.note === "string" ? params.note : null;

  return <NotasClient initialNoteId={initialNoteId} />;
}
