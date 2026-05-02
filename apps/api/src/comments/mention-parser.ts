export function extractMentionNames(body: string): string[] {
  const matches = body.match(/@[\w.-]+(?:\s[\w.-]+)?/g) ?? [];

  return matches
    .map((mention: string) => mention.replace('@', '').trim())
    .filter(Boolean);
}
