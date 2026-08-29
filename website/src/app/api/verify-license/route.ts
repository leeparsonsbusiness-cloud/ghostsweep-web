import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const licenseKey = searchParams.get("key") || searchParams.get("licenseKey") || "";

  return verifyLicense(licenseKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const licenseKey = body.licenseKey || body.key || "";
    return verifyLicense(licenseKey);
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid payload" }, { status: 400 });
  }
}

function verifyLicense(key: string) {
  const trimmed = key.trim().toUpperCase();
  const isValidFormat = /^GSWEEP-[A-Z0-9]{4}-[A-Z0-9]{4}-2026$/.test(trimmed);

  if (isValidFormat || trimmed === "GSWEEP-DEMO-VIP8-2026") {
    return NextResponse.json({
      valid: true,
      licenseKey: trimmed,
      tier: "lifetime_unlimited",
      features: [
        "unlimited_audits",
        "demographic_filters",
        "safe_10_batches",
        "75_min_engine",
        "vip_whitelist",
      ],
      manifestVersion: "v3",
      activatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      valid: false,
      error: "Invalid or expired GhostSweep license key. Format must be GSWEEP-XXXX-XXXX-2026.",
    },
    { status: 401 }
  );
}
