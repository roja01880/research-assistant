import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/research/workspace";
export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library · Lumen Research" },
      {
        name: "description",
        content: "Browse papers, reports, and reviews in your research library.",
      },
      { property: "og:title", content: "Library · Lumen Research" },
      {
        property: "og:description",
        content: "Browse papers, reports, and reviews in your research library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Workspace section="library" />,
});
