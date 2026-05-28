import { createFileRoute } from "@tanstack/react-router";
import { VibeltConfig } from "@/components/VibeltConfig";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibelt Config — Smart Running Belt" },
      { name: "description", content: "AI-powered smart running belt dashboard for Deaf and Hard of Hearing runners." },
      { property: "og:title", content: "Vibelt Config" },
      { property: "og:description", content: "AI-powered smart running belt dashboard for DHH runners." },
    ],
  }),
  component: Index,
});

function Index() {
  return <VibeltConfig />;
}
