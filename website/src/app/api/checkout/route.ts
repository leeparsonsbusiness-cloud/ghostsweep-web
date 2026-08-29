import { NextRequest, NextResponse } from "next/server";

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  email: string;
  licenseKey: string;
  tier: "lifetime";
  amountPaid: number;
  downloadUrl: string;
  createdAt: string;
}

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `GSWEEP-${part1}-${part2}-2026`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email is required for license delivery." },
        { status: 400 }
      );
    }

    const licenseKey = generateLicenseKey();
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const responseData: CheckoutResponse = {
      success: true,
      orderId,
      email: email.trim().toLowerCase(),
      licenseKey,
      tier: "lifetime",
      amountPaid: 1.99,
      downloadUrl: `/api/download-extension?licenseKey=${licenseKey}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
