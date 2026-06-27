import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", text = "New items will appear here when available." }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
      <Inbox className="mx-auto text-neutral-400" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{text}</p>
    </div>
  );
}
