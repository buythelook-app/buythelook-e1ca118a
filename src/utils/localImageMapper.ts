
export interface LocalImageItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'shoes' | 'outerwear';
}

// Available local images mapped by type
export const LOCAL_IMAGE_MAPPING = {
  top: [
    '028933c6-ec95-471c-804c-0aa31a0e1f15',
    '97187c5b-b4bd-4ead-a4bf-644148da8924',
    'b2b5da4b-c967-4791-8832-747541e275be',
    '160222f3-86e6-41d7-b5c8-ecfc0b63851b'
  ],
  bottom: [
    '386cf438-be54-406f-9dbb-6495a8f8bde9',
    '6fe5dff3-dfba-447b-986f-7281b45a0703',
    'a1785297-040b-496d-a2fa-af4ecb55207a',
    '37542411-4b25-4f10-9cc8-782a286409a1'
  ],
  shoes: [
    '553ba2e6-53fd-46dd-82eb-64121072a826',
    '68407ade-0be5-4bc3-ab8a-300ad5130380',
    'c7a32d15-ffe2-4f07-ae82-a943d5128293'
  ]
};

/**
 * Maps item IDs to local image paths
 * @param itemId The item ID to map
 * @param itemType The type of item (top, bottom, shoes)
 * @returns The local image path
 */
export const getLocalImagePath = (itemId: string, itemType: 'top' | 'bottom' | 'shoes'): string => {
  // Check if the itemId is already a UUID from our local images
  const allImages = [...LOCAL_IMAGE_MAPPING.top, ...LOCAL_IMAGE_MAPPING.bottom, ...LOCAL_IMAGE_MAPPING.shoes];
  if (allImages.includes(itemId)) {
    return `/lovable-uploads/${itemId}.png`;
  }

  // Map based on item type and use modulo to cycle through available images
  const availableImages = LOCAL_IMAGE_MAPPING[itemType];
  if (availableImages.length === 0) {
    return '/placeholder.svg';
  }

  // Use hash of itemId to consistently map to same image
  const hash = itemId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % availableImages.length;
  return `/lovable-uploads/${availableImages[index]}.png`;
};

/**
 * Gets a random local image for a specific type
 * @param itemType The type of item
 * @returns A random local image path
 */
export const getRandomLocalImage = (itemType: 'top' | 'bottom' | 'shoes'): string => {
  const availableImages = LOCAL_IMAGE_MAPPING[itemType];
  if (availableImages.length === 0) {
    return '/placeholder.svg';
  }
  
  const randomIndex = Math.floor(Math.random() * availableImages.length);
  return `/lovable-uploads/${availableImages[randomIndex]}.png`;
};

/**
 * Creates a local outfit item with proper typing
 * @param itemId The item ID
 * @param itemType The type of item
 * @returns A LocalImageItem object
 */
export const createLocalOutfitItem = (itemId: string, itemType: 'top' | 'bottom' | 'shoes'): LocalImageItem => {
  return {
    id: itemId,
    image: getLocalImagePath(itemId, itemType),
    type: itemType
  };
};
