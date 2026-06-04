import { T } from "../constants";
import { ArrowRight } from "./icons";

interface ExternalLinkProps {
  url?: string;
  label?: string;
}

export function ExternalLink({ url, label }: ExternalLinkProps) {
  if (!url) return null;
  let href = url.trim();
  if (!/^https?:\/\//i.test(href)) href = "https://" + href;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-[5px] text-[13px] font-semibold no-underline"
      style={{ color: T.indigo }}
    >
      <ArrowRight size={13} /> {label || "Voir le site"}
    </a>
  );
}
