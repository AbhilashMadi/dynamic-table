import { NextRequest, NextResponse } from "next/server";
import NextCors from "nextjs-cors";

// CORS configuration
export const corsOptions = {
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"
      : "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
};

// Middleware wrapper for App Router
export async function withCors(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200 });
  }

  const response = await handler();

  // Add CORS headers
  const origin = request.headers.get("origin");
  const allowedOrigin = Array.isArray(corsOptions.origin)
    ? corsOptions.origin.includes(origin || "")
      ? origin
      : corsOptions.origin[0]
    : corsOptions.origin;

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin || "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    corsOptions.methods.join(",")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
