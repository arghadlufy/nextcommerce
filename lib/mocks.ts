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

// ---------------------------------------------------------------------------
// Translation data for seeding
// Keyed by English product name → { language → { name, description } }
// ---------------------------------------------------------------------------

export type ProductTranslationData = {
  name: string;
  description: string;
};

export const productTranslations: Record<
  string,
  Record<string, ProductTranslationData>
> = {
  "Wireless Headphones": {
    nl: {
      name: "Draadloze Koptelefoon",
      description:
        "Premium ruisonderdrukkende draadloze koptelefoon met lange batterijduur.",
    },
    hi: {
      name: "वायरलेस हेडफ़ोन",
      description:
        "लंबी बैटरी लाइफ वाले प्रीमियम नॉइज़-कैंसलिंग वायरलेस हेडफ़ोन।",
    },
  },
  "Smart Watch": {
    nl: {
      name: "Slimme Horloge",
      description:
        "Fitnesstracker met hartslagmeting en slaapanalyse.",
    },
    hi: {
      name: "स्मार्ट वॉच",
      description:
        "हृदय गति निगरानी और नींद विश्लेषण के साथ फिटनेस ट्रैकर।",
    },
  },
  "Running Shoes": {
    nl: {
      name: "Hardloopschoenen",
      description: "Lichte hardloopschoenen met responsieve demping.",
    },
    hi: {
      name: "रनिंग शूज़",
      description: "रिस्पॉन्सिव कुशनिंग वाले हल्के रनिंग शूज़।",
    },
  },
  "Ceramic Mug": {
    nl: {
      name: "Keramische Mok",
      description: "Handgemaakt keramisch mok met minimalistisch ontwerp.",
    },
    hi: {
      name: "सिरेमिक मग",
      description: "न्यूनतम डिज़ाइन वाला हस्तनिर्मित सिरेमिक मग।",
    },
  },
  "Leather Backpack": {
    nl: {
      name: "Leren Rugzak",
      description: "Duurzame leren rugzak met meerdere compartimenten.",
    },
    hi: {
      name: "लेदर बैकपैक",
      description: "कई कम्पार्टमेंट वाला टिकाऊ लेदर बैकपैक।",
    },
  },
};

// ---------------------------------------------------------------------------
// Category translations
// Keyed by English category name → { language → translated name }
// ---------------------------------------------------------------------------

export const categoryTranslations: Record<string, Record<string, string>> = {
  Electronics: { nl: "Elektronica", hi: "इलेक्ट्रॉनिक्स" },
  Sports: { nl: "Sport", hi: "खेल" },
  Home: { nl: "Huis", hi: "घर" },
  Fashion: { nl: "Mode", hi: "फैशन" },
};
