import type { ProductRepository } from "./product.repository";
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

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(input: CreateProductInput): Promise<CreateProductOutput> {
    return this.repository.create(input);
  }

  async findById(input: FindProductByIdInput): Promise<FindProductByIdOutput> {
    return this.repository.findById(input);
  }

  async findBySlug(
    input: FindProductBySlugInput,
  ): Promise<FindProductBySlugOutput> {
    return this.repository.findBySlug(input);
  }

  async findAll(input: FindAllProductsInput): Promise<FindAllProductsOutput> {
    return this.repository.findAll(input);
  }

  async update(input: UpdateProductInput): Promise<UpdateProductOutput> {
    return this.repository.update(input);
  }

  async delete(input: DeleteProductInput): Promise<DeleteProductOutput> {
    return this.repository.delete(input);
  }
}
