export async function parsePayuniPostBody(
  req: Request,
): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await req.json()) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(j).map(([k, v]) => [k, v == null ? "" : String(v)]),
    );
  }
  const fd = await req.formData();
  const o: Record<string, string> = {};
  fd.forEach((v, k) => {
    o[k] = typeof v === "string" ? v : "";
  });
  return o;
}
