export function pickTranslation<
  T extends { languages_code: string },
  K extends keyof T,
>(
  translations: T[] | undefined | null,
  locale: string,
  field: K,
): string | null {
  const match = (translations ?? []).find(
    (item) =>
      String(item.languages_code ?? "")
        .toLowerCase()
        .slice(0, 2) === locale,
  );
  const value = match?.[field];
  return typeof value === "string" ? value : null;
}
