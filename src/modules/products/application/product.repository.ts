import type {
  CreateProductInput,
  CreateProductOutput,
  FindProductByIdInput,
  FindProductByIdOutput,
  FindProductBySlugInput,
  FindProductBySlugOutput,
  FindAllProductsInput,
  FindAllProductsOutput,
  UpdateProductInput,
  UpdateProductOutput,
  DeleteProductInput,
  DeleteProductOutput,
} from "./types/product.types";

export interface ProductRepository {
  create(input: CreateProductInput): Promise<CreateProductOutput>;
  findById(input: FindProductByIdInput): Promise<FindProductByIdOutput>;
  findBySlug(input: FindProductBySlugInput): Promise<FindProductBySlugOutput>;
  findAll(input: FindAllProductsInput): Promise<FindAllProductsOutput>;
  update(input: UpdateProductInput): Promise<UpdateProductOutput>;
  delete(input: DeleteProductInput): Promise<DeleteProductOutput>;
}

