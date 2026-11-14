import { createClientPostRepository } from "@/app/es/blog/repositories/post-repository";
import { POST_FIXTURES } from "@/app/es/blog/repositories/post-fixtures";

export const postRepository = createClientPostRepository({ seed: POST_FIXTURES });
