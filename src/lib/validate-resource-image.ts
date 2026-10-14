import "server-only";

import cloudinary from "@/lib/cloudinary";

type ImageReference = {
  imageUrl?: string;
  imagePublicId?: string;
};

export async function isValidResourceImage(
  data: ImageReference
): Promise<boolean> {
  if (!data.imageUrl && !data.imagePublicId) {
    return true;
  }

  if (!data.imageUrl || !data.imagePublicId) {
    return false;
  }

  if (!data.imagePublicId.startsWith("reservehub/resources/")) {
    return false;
  }

  try {
    const image = await cloudinary.api.resource(
      data.imagePublicId,
      { resource_type: "image" }
    );

    return (
      image.secure_url === data.imageUrl &&
      image.public_id === data.imagePublicId &&
      image.resource_type === "image"
    );
  } catch {
    return false;
  }
}