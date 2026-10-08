import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/research/workspace";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover · Lumen Research" },
      {
        name: "description",
        content: "Explore research, connect evidence, and discover new perspectives.",
      },
      { property: "og:title", content: "Discover · Lumen Research" },
      {
        property: "og:description",
        content: "Explore research, connect evidence, and discover new perspectives.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Workspace section="discover" />,
});
