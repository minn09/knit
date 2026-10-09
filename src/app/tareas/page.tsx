import type { Metadata } from "next";
import { TareasClient } from "./TareasClient";

export const metadata: Metadata = { title: "Tareas · Knit" };

export default function TareasPage() {
  return <TareasClient />;
}
