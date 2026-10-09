"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Diálogo para pedir un texto (reemplaza window.prompt). */
export function PromptDialog({
  open,
  title,
  description,
  label,
  defaultValue = "",
  placeholder,
  confirmText = "Guardar",
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  // Reinicia el valor cada vez que el diálogo se abre.
  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  const trimmed = value.trim();

  function submit() {
    if (!trimmed) {
      return;
    }
    onConfirm(trimmed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-2">
          {label && <Label htmlFor="prompt-dialog-input">{label}</Label>}
          <Input
            id="prompt-dialog-input"
            value={value}
            placeholder={placeholder}
            autoFocus
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!trimmed}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
