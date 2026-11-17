import { NextResponse } from "next/server";
import { warmupDatabaseConnection } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const telemetry = await warmupDatabaseConnection();
    const admin = await verifyAdminSession();

    if (admin) {
      return NextResponse.json({
        status: "HEALTHY",
        engine: "Neon Serverless PostgreSQL + PrismaPg Pool",
        retryPolicy: "Exponential Backoff (maxRetries=3, baseDelay=250ms)",
        ...telemetry,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "HEALTHY",
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("[HealthCheck DB Error]:", error);
    return NextResponse.json(
      {
        status: "DEGRADED",
        ok: false,
        error: "Serviço de banco de dados temporariamente indisponível.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
