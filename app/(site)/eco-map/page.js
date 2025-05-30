import EcoMapProgress from "@/app/components/EcoMapProgress";

export default function EcoMap() {
  return (
    <EcoMapProgress
      highlightedRegions={["BR", "ID", "KE"]}
      completedUnitsByCountry={{
        "076": ["Amazon Rainforest", "Mangroves"],
        360: ["Orangutan Rescue"],
        404: ["Great Rift Valley"],
      }}
    />
  );
}
