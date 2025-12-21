import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth.handler);

export async function POST(request: NextRequest) {
  try {
    console.log("Auth POST request:", request.url);
    return await handler.POST(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return new Response(
      JSON.stringify({
        error: "Authentication error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Auth GET request:", request.url);
    return await handler.GET(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return new Response(
      JSON.stringify({
        error: "Authentication error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
