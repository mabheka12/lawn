export type LawnCategory = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export const lawnCategories: LawnCategory[] = [
  {
    slug: "lawn-mowers",
    name: "Lawn Mowers",
    emoji: "🚜",
    description:
      "Push mowers, electric mowers, cordless mowers and riding mowers for maintaining residential lawns.",
  },
  {
    slug: "grass-trimmers",
    name: "Grass Trimmers",
    emoji: "🌿",
    description:
      "Grass trimmers and string trimmers for cutting around lawn edges, fences and hard-to-reach areas.",
  },
  {
    slug: "lawn-edgers",
    name: "Lawn Edgers",
    emoji: "✂️",
    description:
      "Lawn edgers and edging tools for creating clean, defined borders around lawns and garden beds.",
  },
  {
    slug: "leaf-blowers",
    name: "Leaf Blowers",
    emoji: "🍂",
    description:
      "Leaf blowers and garden blowers for clearing leaves, grass clippings and garden debris.",
  },
  {
    slug: "lawn-tools",
    name: "Lawn Tools",
    emoji: "🛠️",
    description:
      "Essential lawn-care tools including rakes, shears, spreaders and other garden equipment.",
  },
  {
    slug: "grass-seed",
    name: "Grass Seed",
    emoji: "🌱",
    description:
      "Grass seed products for establishing new lawns, repairing bare patches and improving existing grass.",
  },
  {
    slug: "lawn-fertilizers",
    name: "Lawn Fertilizers",
    emoji: "🌿",
    description:
      "Lawn fertilizers and plant nutrition products for supporting healthy grass growth.",
  },
  {
    slug: "weed-control",
    name: "Weed Control",
    emoji: "🌾",
    description:
      "Lawn and garden products designed to help manage unwanted weeds.",
  },
  {
    slug: "sprinklers-irrigation",
    name: "Sprinklers & Irrigation",
    emoji: "💧",
    description:
      "Sprinklers, hoses, irrigation equipment and watering accessories for lawns and gardens.",
  },
];

export type AmazonLinks = {
  US?: string;
  AU?: string;
};

export type LawnProduct = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  amazon: AmazonLinks;
  features: string[];
  searchKeywords?: string[];
};

export const lawnProducts: LawnProduct[] = [
  {
    id: 1,
    slug: "example-cordless-lawn-mower",
    title: "Cordless Lawn Mower",
    category: "lawn-mowers",
    image: "https://m.media-amazon.com/images/I/71kjrWYu+VL._AC_UY218_.jpg",
    description:
      "A cordless lawn mower can be a convenient option for homeowners who want to maintain their lawn without dealing with petrol engines or extension cords.",
    amazon: {
      US: "https://amzn.to/3RUXQWF",
      AU: "https://amzn.to/3RUXQWF",
    },
    features: [
      "Cordless operation",
      "Adjustable cutting height",
      "Suitable for residential lawns",
      "Easy to store",
    ],
    searchKeywords: [
      "cordless lawn mower",
      "battery lawn mower",
      "electric lawn mower",
    ],
  },

  {
    id: 2,
    slug: "example-grass-trimmer",
    title: "Cordless Grass Trimmer",
    category: "grass-trimmers",
    image: "https://m.media-amazon.com/images/I/61RV-uzw97L._AC_UY218_.jpg",
    description:
      "A cordless grass trimmer is useful for tidying areas that a lawn mower cannot easily reach, including lawn edges, fences and garden borders.",
    amazon: {
      US: "https://amzn.to/45vTOHi",
      AU: "https://amzn.to/45vTOHi",
    },
    features: [
      "Cordless operation",
      "Lightweight design",
      "Useful for lawn edges",
      "Suitable for trimming around obstacles",
    ],
    searchKeywords: [
      "cordless grass trimmer",
      "battery string trimmer",
      "weed eater",
    ],
  },

  {
    id: 3,
    slug: "example-leaf-blower",
    title: "Cordless Leaf Blower",
    category: "leaf-blowers",
    image: "https://m.media-amazon.com/images/I/71IAbWUq5qL._AC_UY218_.jpg",
    description:
      "A cordless leaf blower can make it easier to clear leaves, grass clippings and other lightweight debris from lawns, paths and driveways.",
    amazon: {
      US: "https://amzn.to/45yinDp",
      AU: "https://amzn.to/45yinDp",
    },
    features: [
      "Cordless operation",
      "Easy to carry",
      "Useful for lawn cleanup",
      "Suitable for leaves and grass clippings",
    ],
    searchKeywords: [
      "cordless leaf blower",
      "battery leaf blower",
      "garden blower",
    ],
  },
  {
    id: 4,
    slug: "example-lawn-fertilizer",
    title: "Lawn Fertilizer",
    category: "lawn-fertilizers",
    image: "https://m.media-amazon.com/images/I/81tVjfRVk6L._AC_UY218_.jpg",
    description:
      "A high-quality lawn fertilizer can help promote healthy grass growth and improve the overall appearance of your lawn.",
    amazon: {
      US: "https://amzn.to/4gcfhLH",
      AU: "https://amzn.to/4gcfhLH",
    },
    features: [
      "Promotes healthy grass growth",
      "Improves lawn appearance",
      "Easy to apply",
      "Suitable for various grass types",
    ],
    searchKeywords: [
      "lawn fertilizer",
      "grass fertilizer",
      "garden fertilizer",
    ],
  },
  {
    id: 5,
    slug: "example-sprinkler-system",
    title: "Sprinkler System",
    category: "sprinkler-systems",
    image: "https://m.media-amazon.com/images/I/61XJ9ZJQZSL._AC_UY218_.jpg",
    description:
      "A reliable sprinkler system can help keep your lawn hydrated and healthy throughout the growing season.",
    amazon: {
      US: "https://amzn.to/45vTOHi",
      AU: "https://amzn.to/45vTOHi",
    },
    features: [
      "Even water distribution",
      "Adjustable spray patterns",
      "Durable construction",
      "Easy to install and maintain",
    ],
    searchKeywords: [
      "sprinkler system",
      "lawn irrigation",
      "garden sprinkler",
    ],
  },
  {
    id: 6,
      slug: "example-lawn-edger",
      title: "Lawn Edger",
      category: "lawn-edgers",
      image: "https://m.media-amazon.com/images/I/511Qi-88TmL._AC_UY218_.jpg",
      description:
        "A lawn edger can help create clean, defined borders around your lawn and garden beds.",
        amazon: {
          US: "https://amzn.to/4bUoyp7",
          AU: "https://amzn.to/4bUoyp7",
        },
      features: [
        "Creates clean lawn edges",
        "Adjustable cutting depth",
        "Durable construction",
        "Easy to use and maintain",
        ],
        searchKeywords: [
            "lawn edger",
            "garden edger",
            "lawn edging tool",
        ],      
  },
  {
    id: 7,
    slug: "example-weed-control",
    title: "Weed Control",
    category: "weed-control",
    image: "https://m.media-amazon.com/images/I/81ERGLJpsdL._AC_UY218_.jpg",
    description:
      "An effective weed control solution can help keep your lawn free from unwanted weeds and promote healthy grass growth.",
    amazon: {
      US: "https://amzn.to/4hDTgXa",
      AU: "https://amzn.to/4hDTgXa",
    },
    features: [
      "Effective weed control",
      "Promotes healthy grass growth",
      "Easy to apply",
      "Suitable for various weed types",
    ],
    searchKeywords: [
      "weed control",
      "lawn weed killer",
      "garden weed control",
    ],
  },
  {
    id: 8,
    slug: "example-grass-seed",
    title: "Grass Seed",
    category: "grass-seed",
    image: "https://m.media-amazon.com/images/I/511Qi-88TmL._AC_UY218_.jpg",
    description:
      "High-quality grass seed can help establish a lush, healthy lawn from the ground up.",
    amazon: {
      US: "https://amzn.to/4bUoyp7",
      AU: "https://amzn.to/4bUoyp7",
    },
    features: [
      "Promotes healthy grass growth",
      "Suitable for various grass types",
      "Easy to plant",
      "Durable and long-lasting",
    ],
    searchKeywords: [
      "grass seed",
      "lawn seed",
      "garden seed",
    ],
  },
  {
    id: 9,
    slug: "example-lawn-tool-set",
    title: "Lawn Tool Set",
    category: "lawn-tools",
    image: "https://m.media-amazon.com/images/I/81J192gG8GL._AC_UL320_.jpg",
    description:
      "A comprehensive set of lawn tools can help you maintain your yard with ease and efficiency.",
    amazon: {
      US: "https://amzn.to/4zlWIvX",
      AU: "https://amzn.to/4zlWIvX",
    },
    features: [
      "Complete set of essential lawn tools",
      "Durable construction",
      "Easy to use and maintain",
      "Ideal for various lawn care tasks",
    ],
    searchKeywords: [
      "lawn tool set",
      "garden tools",
      "lawn care tools",
    ],
  },
  {
    id: 10,
    slug: "example-irrigation-kit",
    title: "Irrigation Kit",
    category: "sprinklers-irrigation",
    image: "https://m.media-amazon.com/images/I/81qS+0iTxTL._AC_UL320_.jpg",
    description:
      "An efficient irrigation kit can help you water your lawn and garden evenly and effectively.",
    amazon: {
      US: "https://amzn.to/4bSsOVY",
      AU: "https://amzn.to/4bSsOVY",
    },
    features: [
      "Efficient water distribution",
      "Adjustable spray patterns",
      "Durable construction",
      "Easy to install and use",
    ],
    searchKeywords: [
      "irrigation kit",
      "lawn irrigation",
      "garden watering system",
    ],
  },
];