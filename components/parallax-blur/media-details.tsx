import { View } from "react-native";
import Lists from "./lists";

const MediaDetails = ({ media, type }: { media: any; type: "movie" }) => {
  const title = media?.title;

  const listItems = media
    ? [
        {
          label: type === "movie" ? "Release Date" : "First Air Date",
          value:
            type === "movie" && media.release_date
              ? new Date(media.release_date).toLocaleDateString()
              : "N/A",
        },
        {
          label: "Age Rating",
          value: media.adult ? "Adult" : "All Ages",
        },
        {
          label: type === "movie" ? "Runtime" : "Episode Runtime",
          value:
            type === "movie"
              ? `${media.runtime} minutes`
              : `${media.episode_run_time?.[0] || "N/A"} minutes`,
        },
        {
          label: "Budget",
          value: media.budget
            ? `$${(media.budget / 1000000).toFixed(1)}M`
            : "N/A",
        },
        {
          label: "Revenue",
          value: media.revenue
            ? `$${(media.revenue / 1000000).toFixed(1)}M`
            : "N/A",
        },
        {
          label: "Countries",
          value:
            media.production_countries
              ?.map((c: { name: string }) => c.name)
              .join(", ") || "N/A",
        },
        {
          label: "Languages",
          value:
            media.spoken_languages
              ?.map((l: { name: string }) => l.name)
              .join(", ") || "N/A",
        },
        {
          label: "Genres",
          value:
            media.genres?.map((g: { name: string }) => g.name).join(", ") ||
            "N/A",
        },
      ]
    : [];

  return (
    <View style={{ backgroundColor: "white" }}>
      <View style={{ marginTop: 24 }}>
        <Lists title="About" items={listItems} />
      </View>
    </View>
  );
};

export default MediaDetails;
