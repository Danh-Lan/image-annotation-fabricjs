import "fabric";

declare module "fabric" {
  interface FabricObject {
    data?: {
      role?: string;
    };
  }
}