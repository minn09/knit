import Image from "next/image";
import type { ReactNode } from "react";
import base from "@/assets/mascot/ovi.png";
import celebrate from "@/assets/mascot/ovi-celebrate.png";
import confused from "@/assets/mascot/ovi-confused.png";
import hello from "@/assets/mascot/ovi-hello.png";
import sleep from "@/assets/mascot/ovi-sleep.png";
import tasklist from "@/assets/mascot/ovi-tasklist.png";
import write from "@/assets/mascot/ovi-write.png";

const poses = { base, write, tasklist, sleep, hello, confused, celebrate };

export type OviPose = keyof typeof poses;

export function EmptyState({
  pose,
  title,
  text,
  size = 160,
  children,
}: {
  pose: OviPose;
  title: string;
  text?: string;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <div className="m-auto flex max-w-sm flex-col items-center gap-3 p-6 text-center">
      {/* Importada como archivo: Next conoce el tamaño real y calcula la altura */}
      <Image
        src={poses[pose]}
        alt=""
        width={size}
        loading="eager"
        style={{ width: size, height: "auto" }}
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      {text && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{text}</p>
      )}
      {children}
    </div>
  );
}
