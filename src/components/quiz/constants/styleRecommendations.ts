import { StyleRecommendations } from '../types/styleTypes';

export const styleRecommendations: Record<string, StyleRecommendations> = {
  Classic: {
    tops: [
      { family: "CAMISA", subfamily: "B.CAMISA", colors: ["white", "cream", "light blue", "navy"], style: "elegant" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light blue"], style: "elegant" },
      { family: "BLASIER", subfamily: "B.BLASIER", colors: ["navy", "black", "white", "cream"], style: "tailored" },
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["navy", "black", "white", "cream"], style: "tailored" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["navy", "cream", "beige", "black"], style: "refined" }
    ],
    bottoms: [
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["navy", "black", "gray", "beige"], style: "tailored" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["navy", "black", "gray", "beige"], style: "tailored" },
      { family: "FALDA", subfamily: "B.FALDA", colors: ["navy", "black", "gray"], style: "pencil" },
      { family: "FALDA", subfamily: "W.FALDA", colors: ["navy", "black", "gray"], style: "pencil" }
    ],
    shoes: [
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO", colors: ["black", "nude", "brown"], style: "classic" },
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["black", "nude", "brown"], style: "elegant" },
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "brown"], style: "refined" }
    ],
    outerwear: [
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["navy", "black", "beige", "camel"], style: "classic" },
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["navy", "black", "gray"], style: "structured" },
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["navy", "cream", "beige"], style: "refined" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["gold", "silver", "pearl"], style: "timeless" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["black", "brown", "navy"], style: "structured" },
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["black", "brown", "gold"], style: "classic" }
    ]
  },
  
  Minimalist: {
    tops: [
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["white", "cream", "beige", "gray"], style: "clean" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["oatmeal", "cream", "beige", "taupe"], style: "simple" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light gray"], style: "minimal" }
    ],
    bottoms: [
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["taupe", "beige", "cream", "light gray"], style: "straight" },
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["beige", "taupe", "cream"], style: "relaxed" },
      { family: "FALDA", subfamily: "W.FALDA", colors: ["beige", "cream", "taupe"], style: "simple" }
    ],
    shoes: [
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["tan", "beige", "white"], style: "minimal" },
      { family: "BOTIN PLANO", subfamily: "Z1W:BOTIN", colors: ["tan", "beige", "cream"], style: "clean" }
    ],
    outerwear: [
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["oatmeal", "beige", "cream"], style: "unstructured" },
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["cream", "oatmeal", "beige"], style: "clean-lined" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["gold", "silver"], style: "delicate" },
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["tan", "beige", "cream"], style: "simple" }
    ]
  },
  
  Casual: {
    tops: [
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["light blue", "white", "gray", "navy"], style: "relaxed" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["gray", "navy", "white"], style: "comfortable" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["blue", "gray", "cream"], style: "cozy" }
    ],
    bottoms: [
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["blue", "khaki", "gray"], style: "relaxed" },
      { family: "BERMUDA", subfamily: "B.BERMUDA", colors: ["khaki", "navy", "gray"], style: "comfortable" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "navy"], style: "stretchy" }
    ],
    shoes: [
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "black", "gray"], style: "comfortable" },
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["tan", "white", "black"], style: "casual" }
    ],
    outerwear: [
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["blue", "khaki", "gray"], style: "relaxed" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["gray", "navy", "khaki"], style: "comfortable" }
    ],
    accessories: [
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["navy", "gray", "black"], style: "casual" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["navy", "black", "khaki"], style: "practical" }
    ]
  },
  
  Elegant: {
    tops: [
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["cream", "white", "light pink"], style: "luxurious" },
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["black", "navy", "cream"], style: "sophisticated" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["cream", "black", "navy"], style: "refined" }
    ],
    bottoms: [
      { family: "FALDA", subfamily: "W.FALDA", colors: ["black", "navy", "cream"], style: "fitted" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["black", "navy", "cream"], style: "tailored" }
    ],
    shoes: [
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO", colors: ["nude", "black", "gold"], style: "elegant" },
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "nude", "brown"], style: "sophisticated" }
    ],
    outerwear: [
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["beige", "black", "navy"], style: "classic" },
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["cream", "black", "navy"], style: "elegant" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "gold", "pearl"], style: "sophisticated" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["black", "nude", "brown"], style: "elegant" }
    ]
  },
  
  Romantic: {
    tops: [
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["pink", "cream", "white", "lavender"], style: "feminine" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["pink", "cream", "lavender"], style: "soft" },
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["pink", "white", "cream"], style: "delicate" }
    ],
    bottoms: [
      { family: "FALDA", subfamily: "W.FALDA", colors: ["pink", "cream", "white"], style: "flowing" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["cream", "pink", "lavender"], style: "soft" }
    ],
    shoes: [
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["nude", "pink", "cream"], style: "feminine" },
      { family: "SANDALIA", subfamily: "Z1W:SANDALIA", colors: ["nude", "pink", "gold"], style: "delicate" }
    ],
    outerwear: [
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["pink", "cream", "lavender"], style: "soft" },
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["pink", "cream", "beige"], style: "feminine" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["rose gold", "pearl", "silver"], style: "delicate" },
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["pink", "cream", "nude"], style: "feminine" }
    ]
  },
  
  Boohoo: {
    tops: [
      { family: "TOPS Y OTRAS P.", subfamily: "B.TOPS Y OTRAS", colors: ["black", "gray", "white"], style: "fitted" },
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["black", "gray", "white"], style: "trendy" },
      { family: "BODY", subfamily: "C. BODY", colors: ["black", "white", "gray"], style: "fitted" }
    ],
    bottoms: [
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["black", "gray", "blue"], style: "high-waisted" },
      { family: "FALDA", subfamily: "W.FALDA", colors: ["black", "gray"], style: "mini" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray"], style: "tight" }
    ],
    shoes: [
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "brown"], style: "heeled" },
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["black", "white"], style: "platform" }
    ],
    outerwear: [
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["black", "brown"], style: "cropped" },
      { family: "CHAQUETON", subfamily: "B.CHAQUETON", colors: ["black", "gray"], style: "oversized" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "black", "gold"], style: "statement" },
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["black", "white"], style: "edgy" }
    ]
  },
  
  Nordic: {
    tops: [
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["cream", "beige", "gray", "white"], style: "chunky" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["cream", "beige", "gray"], style: "oversized" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light gray"], style: "relaxed" }
    ],
    bottoms: [
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["beige", "cream", "taupe"], style: "relaxed" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray"], style: "warm" }
    ],
    shoes: [
      { family: "BOTIN PLANO", subfamily: "Z1W:BOTIN", colors: ["black", "brown", "beige"], style: "chunky" },
      { family: "BOTA PLANA", subfamily: "Z1W:BOTA", colors: ["black", "brown"], style: "warm" }
    ],
    outerwear: [
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["camel", "beige", "gray"], style: "oversized" },
      { family: "CHAQUETON", subfamily: "W.CHAQUETON", colors: ["beige", "gray", "cream"], style: "cozy" }
    ],
    accessories: [
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "wood"], style: "minimal" },
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["beige", "gray", "cream"], style: "knitted" }
    ]
  },
  
  Sportive: {
    tops: [
      { family: "DEPORTIVO", subfamily: "C.DEPORTIVO", colors: ["black", "white", "gray", "navy"], style: "athletic" },
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["black", "white", "gray"], style: "sporty" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["black", "gray", "navy"], style: "athletic" }
    ],
    bottoms: [
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "navy"], style: "athletic" },
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["black", "gray", "navy"], style: "jogger" },
      { family: "SHORT", subfamily: "W.SHORT", colors: ["black", "gray", "navy"], style: "sporty" }
    ],
    shoes: [
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "black", "gray"], style: "athletic" },
      { family: "RUNNING", subfamily: "Z1:RUNNING", colors: ["white", "black", "neon"], style: "performance" }
    ],
    outerwear: [
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["black", "gray", "navy"], style: "zip-up" },
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["black", "navy"], style: "windbreaker" }
    ],
    accessories: [
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["black", "gray", "white"], style: "athletic" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["black", "gray"], style: "sporty" }
    ]
  }
};
