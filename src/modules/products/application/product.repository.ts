import type {
  CreateProductInput,
  CreateProductOutput,
  FindProductByIdInput,
  FindProductByIdOutput,
  FindProductByIdIncludingDeletedInput,
  FindProductByIdIncludingDeletedOutput,
  FindProductBySlugInput,
  FindProductBySlugOutput,
  FindAllProductsInput,
  FindAllProductsOutput,
  UpdateProductInput,
  UpdateProductOutput,
  DeleteProductInput,
  DeleteProductOutput,
  CheckSlugUniquenessInput,
  CheckSlugUniquenessOutput,
  FindAllTrashedProductsInput,
  FindAllTrashedProductsOutput,
  RestoreProductInput,
  RestoreProductOutput,
  PermanentDeleteProductInput,
  PermanentDeleteProductOutput,
} from "./types/product.types";

export interface ProductRepository {
  create(input: CreateProductInput): Promise<CreateProductOutput>;
  findById(input: FindProductByIdInput): Promise<FindProductByIdOutput>;
  findByIdIncludingDeleted(
    input: FindProductByIdIncludingDeletedInput,
  ): Promise<FindProductByIdIncludingDeletedOutput>;
  findBySlug(input: FindProductBySlugInput): Promise<FindProductBySlugOutput>;
  findAll(input: FindAllProductsInput): Promise<FindAllProductsOutput>;
  update(input: UpdateProductInput): Promise<UpdateProductOutput>;
  delete(input: DeleteProductInput): Promise<DeleteProductOutput>;
  checkSlugUniqueness(
    input: CheckSlugUniquenessInput,
  ): Promise<CheckSlugUniquenessOutput>;
  findAllTrashed(
    input: FindAllTrashedProductsInput,
  ): Promise<FindAllTrashedProductsOutput>;
  restore(input: RestoreProductInput): Promise<RestoreProductOutput>;
  permanentDelete(
    input: PermanentDeleteProductInput,
  ): Promise<PermanentDeleteProductOutput>;
}
