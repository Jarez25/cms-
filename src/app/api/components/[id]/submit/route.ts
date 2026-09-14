import db from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json();
  await db.query("INSERT INTO cms_component_submissions (component_id, data) VALUES (?, ?)", [
    Number(id),
    JSON.stringify(body ?? {}),
  ]);
  return Response.json({ ok: true }, { status: 201 });
}
