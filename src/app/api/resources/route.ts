import { NextResponse } from "next/server";
import { getAllResources } from "@/services/resource.service";

export async function GET() {
  try {
    const resources = await getAllResources();

    return NextResponse.json(
      {
        success: true,
        data: resources,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve resources",
      },
      { status: 500 }
    );
  }
}