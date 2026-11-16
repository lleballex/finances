"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { X } from "lucide-react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Подтвердить",
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger className="ui-button ui-button--secondary">
        {trigger}
      </DialogTrigger>
      <DialogBackdrop className="ui-dialog-backdrop" />
      <DialogContent className="ui-dialog">
        <DialogClose
          className="ui-dialog-x ui-button ui-button--icon"
          aria-label="Закрыть"
        >
          <X size={20} aria-hidden="true" />
        </DialogClose>
        <DialogTitle className="ui-dialog-title">{title}</DialogTitle>
        <DialogDescription className="ui-dialog-description">
          {description}
        </DialogDescription>
        <div className="ui-dialog-actions">
          <DialogClose className="ui-button ui-button--secondary">
            Отмена
          </DialogClose>
          <DialogClose
            className="ui-button ui-button--primary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
