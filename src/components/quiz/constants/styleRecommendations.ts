import { StyleRecommendations } from '../types/styleTypes';

export const styleRecommendations: Record<string, StyleRecommendations> = {
  Classic: {
    tops: [
      // חולצות קלאסיות מכופתרות
      { family: "CAMISA", subfamily: "B.CAMISA", colors: ["white", "cream", "light blue", "navy", "powder blue", "soft pink"], style: "elegant" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light blue", "navy", "powder blue"], style: "elegant" },
      
      // בלייזרים מובנים
      { family: "BLASIER", subfamily: "B.BLASIER", colors: ["navy", "black", "white", "cream", "charcoal", "camel"], style: "tailored" },
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["navy", "black", "white", "cream", "charcoal", "camel"], style: "tailored" },
      
      // סוודרים איכותיים
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["navy", "cream", "beige", "black", "charcoal", "camel"], style: "refined" },
      { family: "CHALECO", subfamily: "PUNTO CHALECO", colors: ["navy", "cream", "beige", "black"], style: "layered" },
      
      // חולצות פולו
      { family: "POLO", subfamily: "C.POLO", colors: ["navy", "white", "cream", "light blue"], style: "preppy" },
      
      // טי שירטים איכותיים
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["white", "cream", "navy", "light gray"], style: "elevated basic" }
    ],
    bottoms: [
      // מכנסיים מחויטים
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["navy", "black", "gray", "beige", "charcoal", "camel"], style: "tailored" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["navy", "black", "gray", "beige", "charcoal", "camel"], style: "tailored" },
      { family: "PANTALON", subfamily: "B.PANT.RECTOS", colors: ["navy", "black", "gray", "beige"], style: "straight" },
      { family: "PANTALON", subfamily: "W.PANT.RECTOS", colors: ["navy", "black", "gray", "beige"], style: "straight" },
      
      // חצאיות קלאסיות
      { family: "FALDA", subfamily: "B.FALDA", colors: ["navy", "black", "gray", "charcoal"], style: "pencil" },
      { family: "FALDA", subfamily: "W.FALDA", colors: ["navy", "black", "gray", "charcoal"], style: "pencil" },
      { family: "FALDA", subfamily: "B.FALDA MIDI", colors: ["navy", "black", "beige", "cream"], style: "midi" },
      { family: "FALDA", subfamily: "W.FALDA MIDI", colors: ["navy", "black", "beige", "cream"], style: "midi" },
      
      // מכנסיים רחבים אלגנטיים
      { family: "PANTALON", subfamily: "W.PANT.PALAZZO", colors: ["navy", "black", "cream", "beige"], style: "wide leg" }
    ],
    shoes: [
      // נעלי עקב קלאסיות
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO", colors: ["black", "nude", "brown", "navy"], style: "classic" },
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO OXFORD", colors: ["black", "brown", "burgundy"], style: "oxford heel" },
      
      // נעליים שטוחות אלגנטיות
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["black", "nude", "brown", "navy"], style: "elegant" },
      { family: "MOCASIN", subfamily: "Z1W:MOCASIN", colors: ["black", "brown", "burgundy"], style: "loafer" },
      
      // מגפיים קלאסיים
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "brown", "navy"], style: "refined" },
      { family: "BOTA TACON", subfamily: "Z1W:BOTA", colors: ["black", "brown"], style: "knee high" }
    ],
    outerwear: [
      // מעילים קלאסיים
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["navy", "black", "beige", "camel", "charcoal"], style: "classic" },
      { family: "TRENCH", subfamily: "C. TRENCH", colors: ["beige", "navy", "black"], style: "trench" },
      
      // בלייזרים וז׳קטים
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["navy", "black", "gray", "cream"], style: "structured" },
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["navy", "cream", "beige", "charcoal"], style: "refined" },
      { family: "CHAQUETON", subfamily: "W.CHAQUETON", colors: ["navy", "black", "camel"], style: "wool coat" }
    ],
    accessories: [
      // תכשיטים קלאסיים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["gold", "silver", "pearl", "rose gold"], style: "timeless" },
      { family: "RELOJ", subfamily: "Z-RELOJ", colors: ["gold", "silver", "leather"], style: "classic watch" },
      
      // תיקים מובנים
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["black", "brown", "navy", "beige"], style: "structured" },
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["black", "brown", "navy"], style: "crossbody" },
      
      // אקססוריז נוספים
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["black", "brown", "gold", "tortoise"], style: "classic" },
      { family: "CINTURONES", subfamily: "Z-CINTURONES", colors: ["black", "brown", "navy"], style: "leather belt" }
    ]
  },
  
  Minimalist: {
    tops: [
      // בסיסים נקיים
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["white", "cream", "beige", "gray", "soft gray", "oatmeal"], style: "clean" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["oatmeal", "cream", "beige", "taupe", "soft gray"], style: "simple" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light gray", "soft beige"], style: "minimal" },
      
      // טי שירטים מינימליסטיים
      { family: "CAMISETA", subfamily: "C.CTAS MANGA LARGA", colors: ["white", "cream", "beige", "light gray"], style: "long sleeve" },
      
      // סוודרים פשוטים
      { family: "JERSEY", subfamily: "PUNTO JERSEY CUELLO", colors: ["cream", "beige", "taupe", "light gray"], style: "crew neck" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY PICO", colors: ["cream", "beige", "oatmeal"], style: "v-neck" }
    ],
    bottoms: [
      // מכנסיים נקיים
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["taupe", "beige", "cream", "light gray", "soft camel"], style: "straight" },
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["beige", "taupe", "cream", "light khaki"], style: "relaxed" },
      { family: "PANTALON", subfamily: "W.PANT.RECTOS", colors: ["beige", "cream", "taupe", "light gray"], style: "wide leg" },
      
      // חצאיות פשוטות
      { family: "FALDA", subfamily: "W.FALDA", colors: ["beige", "cream", "taupe", "soft gray"], style: "simple" },
      { family: "FALDA", subfamily: "W.FALDA MIDI", colors: ["cream", "beige", "taupe"], style: "midi length" },
      
      // מכנסיים קצרים מינימליסטיים
      { family: "SHORT", subfamily: "W.SHORT", colors: ["beige", "cream", "khaki"], style: "tailored short" }
    ],
    shoes: [
      // נעליים פשוטות
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["tan", "beige", "white", "cream"], style: "minimal" },
      { family: "BOTIN PLANO", subfamily: "Z1W:BOTIN", colors: ["tan", "beige", "cream", "taupe"], style: "clean" },
      { family: "MOCASIN", subfamily: "Z1W:MOCASIN", colors: ["tan", "beige", "cream"], style: "loafer" },
      
      // סניקרס מינימליסטיים
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "cream", "light gray"], style: "minimal sneaker" }
    ],
    outerwear: [
      // מעילים פשוטים
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["oatmeal", "beige", "cream", "soft camel"], style: "unstructured" },
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["cream", "oatmeal", "beige", "taupe"], style: "clean-lined" },
      { family: "BLAZER", subfamily: "W.BLASIER", colors: ["beige", "cream", "taupe"], style: "soft blazer" },
      
      // קרדיגנים
      { family: "REBECA", subfamily: "PUNTO REBECA", colors: ["cream", "beige", "oatmeal"], style: "open cardigan" }
    ],
    accessories: [
      // תכשיטים דקיקים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["gold", "silver", "rose gold"], style: "delicate" },
      
      // תיקים פשוטים
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["tan", "beige", "cream", "soft gray"], style: "simple" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["beige", "cream", "tan"], style: "structured tote" },
      
      // אקססוריז מינימליסטיים
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["clear", "light brown", "gold"], style: "minimal frames" },
      { family: "CINTURONES", subfamily: "Z-CINTURONES", colors: ["tan", "beige", "cream"], style: "thin belt" }
    ]
  },
  
  Casual: {
    tops: [
      // טי שירטים נוחים
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["light blue", "white", "gray", "navy", "khaki", "olive"], style: "relaxed" },
      { family: "CAMISETA", subfamily: "C.CTAS MANGA LARGA", colors: ["white", "gray", "navy", "khaki"], style: "long sleeve casual" },
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["denim", "gray", "white"], style: "printed tee" },
      
      // סוודרים נוחים
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["gray", "navy", "white", "khaki", "olive"], style: "comfortable" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["blue", "gray", "cream", "khaki"], style: "cozy" },
      
      // חולצות דנים וכפתוריות נוחות
      { family: "CAMISA", subfamily: "B.CAMISA", colors: ["denim", "khaki", "white", "light blue"], style: "casual shirt" },
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["denim", "white", "light blue", "striped"], style: "relaxed fit" }
    ],
    bottoms: [
      // ג׳ינסים
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["blue", "black", "gray", "khaki"], style: "relaxed" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["denim", "khaki", "olive", "gray"], style: "boyfriend fit" },
      { family: "JEAN", subfamily: "B.JEAN", colors: ["blue", "black", "gray"], style: "straight jean" },
      { family: "JEAN", subfamily: "W.JEAN", colors: ["blue", "black", "white"], style: "casual jean" },
      
      // מכנסיים קצרים ונוחים
      { family: "BERMUDA", subfamily: "B.BERMUDA", colors: ["khaki", "navy", "gray", "olive"], style: "comfortable" },
      { family: "SHORT", subfamily: "W.SHORT", colors: ["denim", "khaki", "white"], style: "casual short" },
      
      // לגינס נוח
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "navy", "olive"], style: "stretchy" }
    ],
    shoes: [
      // סניקרס
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "black", "gray", "navy"], style: "comfortable" },
      { family: "CONVERSE", subfamily: "Z1:CONVERSE", colors: ["white", "black", "navy"], style: "classic sneaker" },
      
      // נעליים שטוחות נוחות
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["tan", "white", "black", "navy"], style: "casual" },
      { family: "MOCASIN", subfamily: "Z1W:MOCASIN", colors: ["brown", "tan", "navy"], style: "loafer" },
      
      // סנדלים נוחים
      { family: "SANDALIA", subfamily: "Z1W:SANDALIA", colors: ["brown", "black", "tan"], style: "casual sandal" }
    ],
    outerwear: [
      // ז׳קטים נוחים
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["blue", "khaki", "gray", "olive"], style: "relaxed" },
      { family: "CHAQUETA", subfamily: "B.CHAQUETA DENIM", colors: ["blue", "black", "white"], style: "denim jacket" },
      
      // סוודרים עם רוכסן
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["gray", "navy", "khaki", "olive"], style: "comfortable" },
      
      // קרדיגן נוח
      { family: "REBECA", subfamily: "PUNTO REBECA", colors: ["gray", "navy", "cream"], style: "open cardigan" }
    ],
    accessories: [
      // כובעים
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["navy", "gray", "black", "denim"], style: "casual" },
      { family: "GORRA", subfamily: "Z-GORRAS", colors: ["navy", "black", "white"], style: "baseball cap" },
      
      // תיקים פרקטיים
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["navy", "black", "khaki", "brown"], style: "practical" },
      { family: "MOCHILA", subfamily: "Z1:MOCHILA", colors: ["black", "navy", "gray"], style: "backpack" },
      
      // אקססוריז נוספים
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["black", "brown", "clear"], style: "casual frames" },
      { family: "CINTURONES", subfamily: "Z-CINTURONES", colors: ["brown", "black", "canvas"], style: "casual belt" }
    ]
  },
  
  Elegant: {
    tops: [
      // חולצות מרשימות
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["cream", "white", "light pink", "champagne", "soft blue"], style: "luxurious" },
      { family: "BLASIER", subfamily: "W.BLASIER", colors: ["black", "navy", "cream", "burgundy", "charcoal"], style: "sophisticated" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["cream", "black", "navy", "burgundy"], style: "refined" },
      
      // חולצות ערב
      { family: "TOPS Y OTRAS P.", subfamily: "W.TOPS Y OTRAS", colors: ["black", "navy", "burgundy", "gold"], style: "evening top" },
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["black", "navy", "metallic"], style: "dressy tee" },
      
      // בלוזות סאטן או משי
      { family: "BLUSA", subfamily: "W.BLUSA", colors: ["champagne", "navy", "burgundy", "black"], style: "silk blouse" },
      
      // סוודרים יוקרתיים
      { family: "JERSEY", subfamily: "PUNTO JERSEY CASHMERE", colors: ["cream", "black", "navy", "camel"], style: "cashmere" }
    ],
    bottoms: [
      // חצאיות אלגנטיות
      { family: "FALDA", subfamily: "W.FALDA", colors: ["black", "navy", "cream", "burgundy"], style: "fitted" },
      { family: "FALDA", subfamily: "W.FALDA MIDI", colors: ["black", "navy", "burgundy", "cream"], style: "midi elegant" },
      { family: "FALDA", subfamily: "W.FALDA LARGA", colors: ["black", "navy", "burgundy"], style: "maxi skirt" },
      
      // מכנסיים מחויטים
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["black", "navy", "cream", "charcoal"], style: "tailored" },
      { family: "PANTALON", subfamily: "W.PANT.PALAZZO", colors: ["black", "navy", "burgundy"], style: "wide leg elegant" },
      
      // שמלות אלגנטיות
      { family: "VESTIDO", subfamily: "W.VESTIDO", colors: ["black", "navy", "burgundy", "champagne"], style: "cocktail dress" },
      { family: "VESTIDO", subfamily: "W.VESTIDO LARGO", colors: ["black", "navy", "burgundy"], style: "evening dress" }
    ],
    shoes: [
      // נעלי עקב יוקרתיות
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO", colors: ["nude", "black", "gold", "burgundy"], style: "elegant" },
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO STILETTO", colors: ["black", "nude", "burgundy"], style: "stiletto" },
      
      // מגפי עקב
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "nude", "brown", "burgundy"], style: "sophisticated" },
      { family: "BOTA TACON", subfamily: "Z1W:BOTA", colors: ["black", "brown", "burgundy"], style: "elegant boot" },
      
      // נעליים שטוחות אלגנטיות
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO BALLET", colors: ["nude", "black", "gold"], style: "ballet flat" },
      { family: "MOCASIN", subfamily: "Z1W:MOCASIN LUX", colors: ["black", "burgundy", "gold"], style: "luxury loafer" }
    ],
    outerwear: [
      // מעילים יוקרתיים
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["beige", "black", "navy", "burgundy", "camel"], style: "classic" },
      { family: "ABRIGO", subfamily: "C. ABRIGO LARGO", colors: ["black", "navy", "camel"], style: "long coat" },
      
      // ז׳קטים אלגנטיים
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["cream", "black", "navy", "burgundy"], style: "elegant" },
      { family: "BLAZER", subfamily: "W.BLASIER NOCHE", colors: ["black", "navy", "burgundy"], style: "evening blazer" },
      
      // מעילי פרווה או צמר
      { family: "CHAQUETON", subfamily: "W.CHAQUETON LUX", colors: ["black", "navy", "camel"], style: "luxury coat" }
    ],
    accessories: [
      // תכשיטים יוקרתיים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "gold", "pearl", "diamond"], style: "sophisticated" },
      { family: "RELOJ", subfamily: "Z-RELOJ LUX", colors: ["gold", "silver", "rose gold"], style: "luxury watch" },
      
      // תיקים אלגנטיים
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["black", "nude", "brown", "burgundy"], style: "elegant" },
      { family: "BOLSOS", subfamily: "Z1:BAGS CLUTCH", colors: ["black", "gold", "silver"], style: "evening clutch" },
      
      // אקססוריז ערב
      { family: "GAFAS", subfamily: "Z-GAFAS LUX", colors: ["gold", "black", "tortoise"], style: "designer frames" },
      { family: "CINTURONES", subfamily: "Z-CINTURONES LUX", colors: ["black", "brown", "gold"], style: "luxury belt" },
      { family: "PAÑUELOS", subfamily: "Z-PAÑUELOS", colors: ["silk prints", "gold", "burgundy"], style: "silk scarf" }
    ]
  },
  
  Romantic: {
    tops: [
      // חולצות רומנטיות
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["pink", "cream", "white", "lavender", "dusty rose", "soft blue"], style: "feminine" },
      { family: "BLUSA", subfamily: "W.BLUSA", colors: ["pink", "cream", "lavender", "white"], style: "flowing blouse" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["pink", "cream", "lavender", "dusty rose"], style: "soft" },
      
      // טי שירטים עדינים
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["pink", "white", "cream", "floral"], style: "delicate" },
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["pink", "cream", "white", "dusty rose"], style: "soft basic" },
      
      // טופים רומנטיים
      { family: "TOPS Y OTRAS P.", subfamily: "W.TOPS Y OTRAS", colors: ["pink", "cream", "lavender"], style: "romantic top" },
      { family: "BODY", subfamily: "C. BODY", colors: ["pink", "cream", "white"], style: "delicate bodysuit" }
    ],
    bottoms: [
      // חצאיות זורמות
      { family: "FALDA", subfamily: "W.FALDA", colors: ["pink", "cream", "white", "lavender"], style: "flowing" },
      { family: "FALDA", subfamily: "W.FALDA MIDI", colors: ["pink", "cream", "dusty rose"], style: "midi romantic" },
      { family: "FALDA", subfamily: "W.FALDA LARGA", colors: ["cream", "pink", "lavender"], style: "maxi flowing" },
      
      // מכנסיים רכים
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["cream", "pink", "lavender", "soft gray"], style: "soft" },
      { family: "PANTALON", subfamily: "W.PANT.PALAZZO", colors: ["cream", "pink", "white"], style: "flowing wide leg" },
      
      // שמלות רומנטיות
      { family: "VESTIDO", subfamily: "W.VESTIDO", colors: ["pink", "cream", "lavender", "floral"], style: "romantic dress" },
      { family: "VESTIDO", subfamily: "W.VESTIDO LARGO", colors: ["pink", "cream", "dusty rose"], style: "maxi dress" }
    ],
    shoes: [
      // נעליים עדינות
      { family: "ZAPATO PLANO", subfamily: "Z1W:ZAPATO", colors: ["nude", "pink", "cream", "rose gold"], style: "feminine" },
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO", colors: ["nude", "pink", "rose gold"], style: "delicate heel" },
      
      // סנדלים רומנטיים
      { family: "SANDALIA", subfamily: "Z1W:SANDALIA", colors: ["nude", "pink", "gold", "rose gold"], style: "delicate" },
      { family: "SANDALIA", subfamily: "Z1W:SANDALIA TACON", colors: ["nude", "pink", "gold"], style: "romantic heel" },
      
      // מגפיים עדינים
      { family: "BOTIN PLANO", subfamily: "Z1W:BOTIN", colors: ["nude", "pink", "cream"], style: "ankle boot" }
    ],
    outerwear: [
      // ז׳קטים רכים
      { family: "CHAQUETA", subfamily: "PUNTO CHAQUETA", colors: ["pink", "cream", "lavender", "dusty rose"], style: "soft" },
      { family: "REBECA", subfamily: "PUNTO REBECA", colors: ["pink", "cream", "lavender"], style: "romantic cardigan" },
      
      // מעילים נשיים
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["pink", "cream", "beige", "dusty rose"], style: "feminine" },
      { family: "BLAZER", subfamily: "W.BLASIER", colors: ["pink", "cream", "white"], style: "soft blazer" }
    ],
    accessories: [
      // תכשיטים עדינים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["rose gold", "pearl", "silver", "pink"], style: "delicate" },
      { family: "RELOJ", subfamily: "Z-RELOJ", colors: ["rose gold", "pink", "pearl"], style: "feminine watch" },
      
      // תיקים רומנטיים
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["pink", "cream", "nude", "rose gold"], style: "feminine" },
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["pink", "cream", "nude"], style: "romantic tote" },
      
      // אקססוריז עדינים
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["pink", "rose gold", "clear"], style: "delicate frames" },
      { family: "PAÑUELOS", subfamily: "Z-PAÑUELOS", colors: ["pink", "floral", "cream"], style: "silk scarf" },
      { family: "CINTURONES", subfamily: "Z-CINTURONES", colors: ["pink", "cream", "rose gold"], style: "delicate belt" }
    ]
  },
  
  Boohoo: {
    tops: [
      // טופים צמודים ועכשוויים
      { family: "TOPS Y OTRAS P.", subfamily: "B.TOPS Y OTRAS", colors: ["black", "gray", "white", "neon"], style: "fitted" },
      { family: "TOPS Y OTRAS P.", subfamily: "W.TOPS Y OTRAS", colors: ["black", "gray", "white", "bright colors"], style: "trendy" },
      { family: "CAMISETA", subfamily: "C.CTAS FANTASI", colors: ["black", "gray", "white", "graphic"], style: "trendy" },
      { family: "BODY", subfamily: "C. BODY", colors: ["black", "white", "gray", "neon"], style: "fitted" },
      
      // קרופ טופים
      { family: "CAMISETA", subfamily: "C.CTAS CROP", colors: ["black", "white", "gray", "bright"], style: "crop top" },
      
      // חולצות רשת או שקופות
      { family: "CAMISETA", subfamily: "C.CTAS MESH", colors: ["black", "white"], style: "mesh" }
    ],
    bottoms: [
      // מכנסיים צמודים וגבוהים
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["black", "gray", "blue", "leather look"], style: "high-waisted" },
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["black", "gray", "vinyl"], style: "skinny" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "leather look"], style: "tight" },
      
      // חצאיות מיני וצמודות
      { family: "FALDA", subfamily: "W.FALDA", colors: ["black", "gray", "vinyl"], style: "mini" },
      { family: "FALDA", subfamily: "W.FALDA TUBO", colors: ["black", "gray"], style: "bodycon" },
      
      // שורטים צמודים
      { family: "SHORT", subfamily: "W.SHORT", colors: ["black", "denim", "leather look"], style: "cycling shorts" }
    ],
    shoes: [
      // מגפי עקב דרמטיים
      { family: "BOTIN TACON", subfamily: "Z1W:BOTIN", colors: ["black", "brown", "patent"], style: "heeled" },
      { family: "BOTA TACON", subfamily: "Z1W:BOTA", colors: ["black", "patent"], style: "thigh high" },
      
      // נעלי פלטפורמה
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["black", "white", "chunky"], style: "platform" },
      { family: "ZAPATO TACON", subfamily: "Z1W:ZAPATO PLATFORM", colors: ["black", "nude"], style: "platform heel" }
    ],
    outerwear: [
      // ז׳קטים קצרים ועכשוויים
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["black", "brown", "vinyl"], style: "cropped" },
      { family: "CHAQUETA", subfamily: "B.CHAQUETA BIKER", colors: ["black", "brown"], style: "biker jacket" },
      { family: "CHAQUETON", subfamily: "B.CHAQUETON", colors: ["black", "gray", "oversized"], style: "oversized" },
      
      // בלייזרים אוברסייז
      { family: "BLAZER", subfamily: "W.BLASIER OVERSIZE", colors: ["black", "gray", "plaid"], style: "oversized blazer" }
    ],
    accessories: [
      // תכשיטים בולטים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "black", "gold", "chunky"], style: "statement" },
      { family: "CADENAS", subfamily: "Z-CADENAS", colors: ["silver", "gold", "black"], style: "chain jewelry" },
      
      // תיקים עכשוויים
      { family: "BOLSOS", subfamily: "Z1:BAGS SMALL", colors: ["black", "white", "neon"], style: "edgy" },
      { family: "RIÑONERA", subfamily: "Z1:RIÑONERA", colors: ["black", "neon"], style: "belt bag" },
      
      // אקססוריז דרמטיים
      { family: "GAFAS", subfamily: "Z-GAFAS", colors: ["black", "oversized", "colored"], style: "statement frames" },
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["black", "beanie"], style: "street style" }
    ]
  },
  
  Nordic: {
    tops: [
      // סוודרים חמים ונוחים
      { family: "JERSEY", subfamily: "PUNTO JERSEY", colors: ["cream", "beige", "gray", "white", "oatmeal", "stone"], style: "chunky" },
      { family: "JERSEY", subfamily: "PUNTO JERSEY GRUESO", colors: ["cream", "beige", "camel", "gray"], style: "thick knit" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["cream", "beige", "gray", "oatmeal"], style: "oversized" },
      
      // חולצות נוחות
      { family: "CAMISA", subfamily: "W.CAMISA", colors: ["white", "cream", "light gray", "checked"], style: "relaxed" },
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["cream", "beige", "gray", "white"], style: "organic cotton" },
      
      // קרדיגנים ארוכים
      { family: "REBECA", subfamily: "PUNTO REBECA", colors: ["cream", "beige", "camel", "gray"], style: "long cardigan" }
    ],
    bottoms: [
      // מכנסיים נוחים וחמים
      { family: "PANTALON", subfamily: "W.PANT.PAQUETER", colors: ["beige", "cream", "taupe", "stone"], style: "relaxed" },
      { family: "PANTALON", subfamily: "B.PANT.PAQUETER", colors: ["beige", "gray", "camel"], style: "wool blend" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "cream"], style: "warm" },
      
      // מכנסיים רחבים נוחים
      { family: "PANTALON", subfamily: "W.PANT.PALAZZO", colors: ["cream", "beige", "stone"], style: "wide leg cozy" },
      
      // שמלות סוודר
      { family: "VESTIDO", subfamily: "W.VESTIDO PUNTO", colors: ["cream", "beige", "gray"], style: "sweater dress" }
    ],
    shoes: [
      // מגפיים חמים ונוחים
      { family: "BOTIN PLANO", subfamily: "Z1W:BOTIN", colors: ["black", "brown", "beige", "sheepskin"], style: "chunky" },
      { family: "BOTA PLANA", subfamily: "Z1W:BOTA", colors: ["black", "brown", "camel"], style: "warm" },
      { family: "UGG", subfamily: "Z1W:UGG", colors: ["beige", "brown", "gray"], style: "sheepskin boot" },
      
      // נעליים שטוחות נוחות
      { family: "MOCASIN", subfamily: "Z1W:MOCASIN", colors: ["brown", "beige", "sheepskin"], style: "warm loafer" },
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "cream", "gray"], style: "minimal sneaker" }
    ],
    outerwear: [
      // מעילים חמים ונוחים
      { family: "ABRIGO", subfamily: "C. ABRIGO", colors: ["camel", "beige", "gray", "oatmeal"], style: "oversized" },
      { family: "CHAQUETON", subfamily: "W.CHAQUETON", colors: ["beige", "gray", "cream", "camel"], style: "cozy" },
      { family: "PLUMAS", subfamily: "C. PLUMAS", colors: ["beige", "black", "navy"], style: "down jacket" },
      
      // קרדיגנים ארוכים
      { family: "REBECA", subfamily: "PUNTO REBECA LARGA", colors: ["cream", "beige", "camel"], style: "long cardigan coat" }
    ],
    accessories: [
      // תכשיטים מינימליסטיים
      { family: "BISUTERIA", subfamily: "Z-BISUTERIA ZA", colors: ["silver", "wood", "natural"], style: "minimal" },
      
      // כובעים וצעיפים חמים
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["beige", "gray", "cream", "wool"], style: "knitted" },
      { family: "BUFANDA", subfamily: "Z-BUFANDA", colors: ["cream", "beige", "camel"], style: "wool scarf" },
      
      // תיקים פרקטיים
      { family: "BOLSOS", subfamily: "Z1:BAGS MEDIUM", colors: ["brown", "beige", "canvas"], style: "practical tote" },
      { family: "MOCHILA", subfamily: "Z1:MOCHILA", colors: ["brown", "canvas", "leather"], style: "backpack" }
    ]
  },
  
  Sportive: {
    tops: [
      // בגדי ספורט מקצועיים
      { family: "DEPORTIVO", subfamily: "C.DEPORTIVO", colors: ["black", "white", "gray", "navy", "neon"], style: "athletic" },
      { family: "CAMISETA", subfamily: "C.CTAS DEPORTIVAS", colors: ["black", "white", "gray", "bright"], style: "performance tee" },
      { family: "CAMISETA", subfamily: "C.CTAS BASICAS", colors: ["black", "white", "gray", "navy"], style: "sporty" },
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["black", "gray", "navy", "neon"], style: "athletic" },
      
      // חולצות ספורט מתקדמות
      { family: "TOP DEPORTIVO", subfamily: "W.TOP DEPORTIVO", colors: ["black", "gray", "bright colors"], style: "sports bra" },
      { family: "TANK TOP", subfamily: "C.TANK DEPORTIVO", colors: ["black", "white", "neon"], style: "athletic tank" }
    ],
    bottoms: [
      // לגינסים ומכנסי ספורט
      { family: "LEGGINGS", subfamily: "W.LEGGINGS", colors: ["black", "gray", "navy", "neon"], style: "athletic" },
      { family: "LEGGINGS", subfamily: "W.LEGGINGS DEPORTIVOS", colors: ["black", "gray", "bright"], style: "performance leggings" },
      { family: "PANTALON", subfamily: "B.PANT.DEPORTIVO", colors: ["black", "gray", "navy"], style: "jogger" },
      { family: "SHORT", subfamily: "W.SHORT", colors: ["black", "gray", "navy", "bright"], style: "sporty" },
      { family: "SHORT", subfamily: "W.SHORT DEPORTIVO", colors: ["black", "neon", "gray"], style: "athletic shorts" }
    ],
    shoes: [
      // נעלי ספורט מתקדמות
      { family: "BAMBAS", subfamily: "Z1B:DEPORTIVO", colors: ["white", "black", "gray", "neon"], style: "athletic" },
      { family: "RUNNING", subfamily: "Z1:RUNNING", colors: ["white", "black", "neon", "bright"], style: "performance" },
      { family: "TRAINING", subfamily: "Z1:TRAINING", colors: ["black", "white", "gray"], style: "cross training" },
      { family: "BASKETBALL", subfamily: "Z1:BASKETBALL", colors: ["black", "white", "red"], style: "basketball" }
    ],
    outerwear: [
      // ז׳קטי ספורט
      { family: "SUDADERA", subfamily: "ST. SUDADERA", colors: ["black", "gray", "navy", "neon"], style: "zip-up" },
      { family: "CAZADORA", subfamily: "B.P-EXTER.CORTA", colors: ["black", "navy", "neon"], style: "windbreaker" },
      { family: "CHAQUETA DEPORTIVA", subfamily: "CHAQUETA RUNNING", colors: ["black", "bright", "reflective"], style: "running jacket" }
    ],
    accessories: [
      // אקססוריז ספורט
      { family: "GORRO", subfamily: "Z-GORROS", colors: ["black", "gray", "white", "neon"], style: "athletic" },
      { family: "GORRA", subfamily: "Z-GORRAS DEPORTIVAS", colors: ["black", "white", "bright"], style: "sports cap" },
      { family: "BOLSOS", subfamily: "Z1:BAGS DEPORTIVOS", colors: ["black", "gray", "neon"], style: "gym bag" },
      { family: "RELOJ", subfamily: "Z-RELOJ DEPORTIVO", colors: ["black", "white", "bright"], style: "sports watch" }
    ]
  }
};
