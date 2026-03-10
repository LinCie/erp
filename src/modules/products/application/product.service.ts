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
  CheckSlugUniquenessInput,
  CheckSlugUniquenessOutput,
} from "./types/product.types";
import type { VariantService } from "@/modules/variants/application/variant.service";

export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly variantService: VariantService,
  ) {}

  async create(input: CreateProductInput): Promise<CreateProductOutput> {
    const { isAvailable } = await this.repository.checkSlugUniqueness({
      organizationId: input.organizationId,
      slug: input.slug,
    });

    if (!isAvailable) {
      throw new Error("Slug is already taken");
    }

    const product = await this.repository.create(input);

    // Auto-create variant(s): use provided variants or generate a default
    if (input.variants && input.variants.length > 0) {
      await this.variantService.bulkCreate({
        productId: product.id,
        variants: input.variants,
      });
    } else {
      await this.variantService.createDefaultForProduct(product.id);
    }

    return product;
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
    if (input.slug !== undefined) {
      const { isAvailable } = await this.repository.checkSlugUniqueness({
        organizationId: input.organizationId,
        slug: input.slug,
        excludeId: input.id,
      });

      if (!isAvailable) {
        throw new Error("Slug is already taken");
      }
    }

    return this.repository.update(input);
  }

  async delete(input: DeleteProductInput): Promise<DeleteProductOutput> {
    return this.repository.delete(input);
  }

  async checkSlugUniqueness(
    input: CheckSlugUniquenessInput,
  ): Promise<CheckSlugUniquenessOutput> {
    return this.repository.checkSlugUniqueness(input);
  }
}
