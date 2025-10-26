import { db } from '../db';
import { materials, materialLikes } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { MaterialListItem, MaterialDetail, MaterialLikeResponse } from '../dtos/material.dto';
import { NotFoundException } from '../utils/exceptions';

/**
 * Get all materials with like status for user
 */
export async function getAllMaterials(userId: number): Promise<MaterialListItem[]> {
  const result = await db
    .select({
      id: materials.id,
      slug: materials.slug,
      title: materials.title,
      description: materials.description,
      orderIndex: materials.orderIndex,
      likeId: materialLikes.id,
    })
    .from(materials)
    .leftJoin(
      materialLikes,
      and(
        eq(materialLikes.materialId, materials.id),
        eq(materialLikes.userId, userId)
      )
    )
    .orderBy(asc(materials.orderIndex));

  return result.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    orderIndex: row.orderIndex,
    isLikedByUser: row.likeId !== null,
  }));
}

/**
 * Get single material by slug with like status
 */
export async function getMaterialBySlug(slug: string, userId: number): Promise<MaterialDetail> {
  const [result] = await db
    .select({
      id: materials.id,
      slug: materials.slug,
      title: materials.title,
      description: materials.description,
      contentHtml: materials.contentHtml,
      likeId: materialLikes.id,
    })
    .from(materials)
    .leftJoin(
      materialLikes,
      and(
        eq(materialLikes.materialId, materials.id),
        eq(materialLikes.userId, userId)
      )
    )
    .where(eq(materials.slug, slug))
    .limit(1);

  if (!result) {
    throw new NotFoundException('Material not found');
  }

  return {
    id: result.id,
    slug: result.slug,
    title: result.title,
    description: result.description,
    contentHtml: result.contentHtml,
    isLikedByUser: result.likeId !== null,
  };
}

/**
 * Toggle like status for material
 */
export async function toggleMaterialLike(slug: string, userId: number): Promise<MaterialLikeResponse> {
  // First, get the material
  const [material] = await db
    .select({ id: materials.id })
    .from(materials)
    .where(eq(materials.slug, slug))
    .limit(1);

  if (!material) {
    throw new NotFoundException('Material not found');
  }

  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(materialLikes)
    .where(
      and(
        eq(materialLikes.userId, userId),
        eq(materialLikes.materialId, material.id)
      )
    )
    .limit(1);

  if (existingLike) {
    // Unlike - delete the like
    await db
      .delete(materialLikes)
      .where(eq(materialLikes.id, existingLike.id));

    return { liked: false };
  } else {
    // Like - insert new like
    await db
      .insert(materialLikes)
      .values({
        userId,
        materialId: material.id,
      });

    return { liked: true };
  }
}
