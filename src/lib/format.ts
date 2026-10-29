export const formatDate = (
  date: Date,
  month: "short" | "long" = "short",
  withYear = true,
) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month,
    year: withYear ? "numeric" : undefined,
  });

export const formatReadTime = (minutes: number) =>
  `${minutes} ${minutes === 1 ? "min" : "mins"}`;
