const ACTIVITY_ICONS: Record<string, string> = {
  walk: "/icons/walk.png",
  groom: "/icons/groom.png",
};

/** Renders an activity's icon (or the original 🎾 emoji for playtime, which has no icon) + its label text. */
export default function ActivityLabel({ activity, text }: { activity: string; text: string }) {
  const icon = ACTIVITY_ICONS[activity];
  if (icon) {
    return <><img src={icon} alt="" className="icon-img-sm" /> {text}</>;
  }
  return <>🎾 {text}</>;
}
