import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check administrator role from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required",
        },
        { status: 403 }
      );
    }

    // 3. Read uploaded image
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Image file is required" },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, and WebP images are allowed",
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be between 1 byte and 5 MB",
        },
        { status: 400 }
      );
    }

    // 6. Ensure Cloudinary is configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary environment variables are missing");

      return NextResponse.json(
        {
          success: false,
          message: "Image upload service is not configured",
        },
        { status: 500 }
      );
    }

    // 7. Validate actual image signature
    const bytes = Buffer.from(await file.arrayBuffer());

    const isJpeg =
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;

    const isPng =
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );

    const isWebp =
      bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";

    const validSignature =
      (file.type === "image/jpeg" && isJpeg) ||
      (file.type === "image/png" && isPng) ||
      (file.type === "image/webp" && isWebp);

    if (!validSignature) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image file",
        },
        { status: 400 }
      );
    }

    // 8. Upload image to Cloudinary
    const uploadedImage = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "reservehub/resources",
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              height: 800,
              crop: "limit",
              quality: "auto",
            },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(bytes);
    });

    // 9. Return uploaded image details
    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        data: {
          imageUrl: uploadedImage.secure_url,
          imagePublicId: uploadedImage.public_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resource image upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload image",
      },
      { status: 500 }
    );
  }
}