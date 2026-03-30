import { PageIntro } from "@/components/layout/page-intro";
import { PlaceholderCard } from "@/components/layout/placeholder-card";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Jobs"
        description="This surface is reserved for the curated jobs feed. Ingestion, ranking, and saved-job workflows are intentionally not implemented yet."
      />
      <PlaceholderCard title="Feed placeholder" body="The jobs list will land here after ingestion pipelines and data contracts are defined." />
    </div>
  );
}
