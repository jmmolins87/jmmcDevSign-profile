import type { CoverAsset } from "@/app/[locale]/blog/domain";
import { COVER_ASSETS } from "@/app/[locale]/blog/repositories/post-fixtures";

export interface CoverAssetRepository {
  list(): readonly CoverAsset[];
  get(id: string | undefined): CoverAsset | null;
}

export function createFixtureCoverAssetRepository(
  assets: readonly CoverAsset[] = COVER_ASSETS,
): CoverAssetRepository {
  return {
    list() {
      return assets;
    },
    get(id) {
      return assets.find((asset) => asset.id === id) ?? null;
    },
  };
}

export const coverAssetRepository = createFixtureCoverAssetRepository();

