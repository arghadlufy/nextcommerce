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
];
