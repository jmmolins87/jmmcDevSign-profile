import { createClientPostRepository } from "@/app/[locale]/blog/repositories/post-repository";
import { POST_FIXTURES } from "@/app/[locale]/blog/repositories/post-fixtures";

export const postRepository = createClientPostRepository({ seed: POST_FIXTURES });
