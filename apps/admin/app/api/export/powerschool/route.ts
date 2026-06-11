import { createServerCaller } from "@/lib/trpc/server";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const caller = await createServerCaller();
    const csv = await caller.export.powerSchool();

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="kora-powerschool-export.csv"',
      },
    });
  } catch (error) {
    if (isForbiddenError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
