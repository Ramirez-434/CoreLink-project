import { NextResponse } from "next/server";
import { warmupDatabaseConnection } from "@/lib/prisma";

export async function GET() {
  try {
    const telemetry = await warmupDatabaseConnection();
    return NextResponse.json({
      status: "HEALTHY",
      engine: "Neon Serverless PostgreSQL + PrismaPg Pool",
      retryPolicy: "Exponential Backoff (maxRetries=3, baseDelay=250ms)",
      ...telemetry,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        error: error?.message || "Falha ao conectar ao banco serverless",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
