import MediaForm from "@/components/MediaForm";
import { CalendarPlus } from "lucide-react";

export default function AddMediaPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-mono text-theme-secondary mb-8 flex items-center">
        <CalendarPlus size={28} className="mr-3" /> Add New Media
      </h1>
      <div className="bg-theme-surface p-6 sm:p-8 rounded-lg">
        <MediaForm />
      </div>
    </div>
  );
}
