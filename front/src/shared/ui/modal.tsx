"use client";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { X } from "lucide-react";

export function Modal({
  open,
  onOpenChange,
  title,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger className="ui-button ui-button--primary">
          {trigger}
        </DialogTrigger>
      )}
      <DialogBackdrop className="ui-dialog-backdrop" />
      <DialogContent className="ui-dialog">
        <DialogClose
          className="ui-dialog-x ui-button ui-button--icon"
          aria-label="Закрыть"
        >
          <X size={20} aria-hidden="true" />
        </DialogClose>
        <DialogTitle className="ui-dialog-title">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
