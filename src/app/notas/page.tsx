import type { Metadata } from "next";
import { NotasClient } from "./NotasClient";

export const metadata: Metadata = {
  title: "Notas · Knit",
};

export default function NotasPage() {
  return <NotasClient />;
}
