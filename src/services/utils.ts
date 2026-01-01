export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Infinity, unit: "year" },
  ];

  const diff = date.getTime() - Date.now();
  let duration = Math.round(diff / 1000);
  for (const d of divisions) {
    if (Math.abs(duration) < d.amount) {
      return rtf.format(Math.round(duration), d.unit);
    }
    duration /= d.amount;
  }

  return dateString;
};
