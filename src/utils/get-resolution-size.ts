export default function getResolutionSize(resolution: string) {
  switch (resolution) {
    case "480p":
      return "720x480";
    case "720p":
      return "1280x720";
    case "1080p":
      return "1920x1080";
    default:
      return "1280x720";
  }
}
