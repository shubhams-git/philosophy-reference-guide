"use client";

import { ExternalLink, X } from "lucide-react";
import {
  isValidElement,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ExtraProps } from "streamdown";

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children);
  }

  return "";
}

function ExternalLinkDialog({
  open,
  url,
  onClose,
}: {
  open: boolean;
  url: string;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Close external link dialog"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2.5 pr-8">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ExternalLink className="size-4" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-950">
            Open external source?
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This academic reference will open in a new browser tab.
        </p>
        <div className="mt-4 max-h-32 overflow-y-auto break-all rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-5 text-zinc-600">
          {url}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Open source
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

type SafeLinkProps = ComponentPropsWithoutRef<"a"> &
  ExtraProps & {
    variant?: "citation" | "inline" | "source";
  };

export function SafeLink({
  ...inputProps
}: SafeLinkProps) {
  const cleanProps = { ...inputProps };
  Reflect.deleteProperty(cleanProps, "node");
  const { children, className, href = "", variant, ...props } = cleanProps;
  const [open, setOpen] = useState(false);
  const label = nodeText(children).trim();
  const isCitation = variant === "citation" || /^\d+$/.test(label);
  const isLocal = href.startsWith("/") || href.startsWith("#");

  if (isLocal) {
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={
          className ??
          "font-medium text-emerald-700 underline decoration-emerald-200 decoration-2 underline-offset-4 transition-colors hover:text-emerald-900"
        }
      >
        {children}
      </a>
    );
  }

  return (
    <>
      {isCitation ? (
        <sup className="mx-0.5 inline-flex align-super">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-800 transition-colors hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={`Open source ${label}`}
          >
            {children}
          </button>
        </sup>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            variant === "source"
              ? className
              : `inline font-medium text-emerald-700 underline decoration-emerald-200 decoration-2 underline-offset-4 transition-colors hover:text-emerald-900 ${className ?? ""}`
          }
        >
          {children}
        </button>
      )}
      <ExternalLinkDialog open={open} url={href} onClose={() => setOpen(false)} />
    </>
  );
}
