import { accountManualMarkdown } from "@/lib/account-manual-markdown";

export const dynamic = "force-static";

export function GET() {
  return new Response(accountManualMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nature-of-accounts.md"',
    },
  });
}
