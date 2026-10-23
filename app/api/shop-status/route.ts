import { getShopConfig, getShopEnvironment, publicShopStatus } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(publicShopStatus(getShopConfig(await getShopEnvironment())), {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
