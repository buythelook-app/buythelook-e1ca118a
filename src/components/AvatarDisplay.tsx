import React from "react";

interface OutfitItem {
  imageUrl: string;
  name: string;
  category: string;
}

interface Props {
  avatarUrl: string;
  outfit: OutfitItem[];
}

const AvatarDisplay: React.FC<Props> = ({ avatarUrl, outfit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <img src={avatarUrl} alt="Avatar" className="w-60 h-auto rounded-2xl shadow-md" />
        <p className="mt-2 text-sm text-muted-foreground">*Future version will show selected clothes on avatar*</p>
      </div>

      {/* Outfit Items Section */}
      <div className="flex flex-col gap-4">
        {outfit.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow border">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
            <div>
              <h3 className="text-lg font-semibold capitalize text-foreground">{item.category}</h3>
              <p className="text-muted-foreground">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarDisplay;