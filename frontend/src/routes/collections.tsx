import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/research/workspace";
export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections · Lumen Research" },
      { name: "description", content: "Organize saved sources around your research questions." },
      { property: "og:title", content: "Collections · Lumen Research" },
      {
        property: "og:description",
        content: "Organize saved sources around your research questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Workspace section="collections" />,
});
