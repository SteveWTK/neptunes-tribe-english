// app/(site)/eco-news/page.js
import EcoNewsClient from "./EcoNewsClient";

export const metadata = {
  title: "Eco-News & Insights - Neptune's Tribe",
  description:
    "Stay updated with the latest environmental news, expert insights, and inspiring student solutions from around the globe.",
};

export default function EcoNewsPage() {
  return <EcoNewsClient />;
}
