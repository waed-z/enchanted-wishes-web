import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="studio-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function EditorCard({ title, subtitle, children, onDelete, onMoveUp, onMoveDown }: { title: string; subtitle?: string; children: ReactNode; onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void }) {
  return <article className="editor-card">
    <header><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div><div className="editor-card__actions">
      {onMoveUp && <button onClick={onMoveUp} aria-label={`Move ${title} up`}><ChevronUp /></button>}
      {onMoveDown && <button onClick={onMoveDown} aria-label={`Move ${title} down`}><ChevronDown /></button>}
      {onDelete && <button onClick={onDelete} aria-label={`Delete ${title}`}><Trash2 /></button>}
    </div></header>
    {children}
  </article>;
}
