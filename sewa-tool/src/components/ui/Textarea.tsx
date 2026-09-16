import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, id, className = "", ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="field-group">
      {label ? (
        <label htmlFor={textareaId} className="field-label">
          {label}
        </label>
      ) : null}
      <textarea id={textareaId} className={`textarea ${className}`.trim()} {...props} />
    </div>
  );
}
