import { PageIntro } from "@/components/layout/page-intro";
import { PlaceholderCard } from "@/components/layout/placeholder-card";

export default function CvPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="CV"
        description="CV assets and versioning will be added later. The current route is a clean placeholder for that future work."
      />
      <PlaceholderCard title="CV library" body="Reserved for CV metadata, storage references, and future editing workflows." />
    </div>
  );
}
