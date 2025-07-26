import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS Middleware
 *
 * Restricts API access to same-origin requests only.
 * Blocks cross-origin requests from other domains.
 * Handles preflight OPTIONS requests properly.
 * Works with both development (localhost) and production environments.
 *
 * @param request - The incoming request
 * @returns Response with appropriate CORS headers
 */
export function middleware(request: NextRequest) {
  // Only apply CORS to API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Get the origin from the request headers
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Construct the expected origin based on the protocol and host
  const protocol = request.nextUrl.protocol;
  const expectedOrigin = host ? `${protocol}//${host}` : null;

  // In development, also check for common localhost variations
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocalhost =
    host?.includes("localhost") || host?.includes("127.0.0.1");

  // Check if it's a same-origin request
  let isSameOrigin = !origin || origin === expectedOrigin;

  // In development, be more lenient with localhost variations
  if (isDevelopment && isLocalhost && origin) {
    const originUrl = new URL(origin);
    const hostUrl = new URL(expectedOrigin || `${protocol}//${host}`);

    // Allow if both are localhost/127.0.0.1 regardless of port
    isSameOrigin =
      (originUrl.hostname === "localhost" ||
        originUrl.hostname === "127.0.0.1") &&
      (hostUrl.hostname === "localhost" || hostUrl.hostname === "127.0.0.1") &&
      originUrl.port === hostUrl.port;
  }

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    if (isSameOrigin) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin || expectedOrigin || "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      });
    } else {
      // Reject cross-origin preflight requests
      return new NextResponse(
        JSON.stringify({
          error: "CORS policy: Cross-origin requests are not allowed",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // For actual requests, check if it's same-origin
  if (!isSameOrigin) {
    return new NextResponse(
      JSON.stringify({
        error: "CORS policy: Cross-origin requests are not allowed",
        details: isDevelopment
          ? {
              origin,
              expectedOrigin,
              host,
            }
          : undefined,
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // For same-origin requests, add CORS headers and continue
  const response = NextResponse.next();

  // Add CORS headers to the response
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Add additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: "/api/:path*",
};
