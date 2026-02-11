export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
};

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description:
      "Premium noise-cancelling wireless headphones with long battery life.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch",
    description:
      "Fitness tracker with heart rate monitoring and sleep analysis.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    category: "Electronics",
  },
  {
    id: "3",
    name: "Running Shoes",
    description: "Lightweight running shoes with responsive cushioning.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Sports",
  },
  {
    id: "4",
    name: "Ceramic Mug",
    description: "Handcrafted ceramic mug with minimalist design.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
    category: "Home",
  },
  {
    id: "5",
    name: "Leather Backpack",
    description: "Durable leather backpack with multiple compartments.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7",
    category: "Fashion",
  },
];
