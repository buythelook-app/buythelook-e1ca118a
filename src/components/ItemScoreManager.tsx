import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface ItemScore {
  itemId: string;
  itemName: string;
  itemType: string;
  image: string;
  categoryFit: 'perfect' | 'good' | 'okay' | 'poor';
  compatibilityScore: number;
  userRating: number;
  matchingItems: string[];
}

interface ItemScoreManagerProps {
  items: any[];
  onScoreUpdate?: (itemId: string, score: number) => void;
}

export const ItemScoreManager: React.FC<ItemScoreManagerProps> = ({ items, onScoreUpdate }) => {
  const [itemScores, setItemScores] = useState<Record<string, ItemScore>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('casual');
  const [showOnlyRated, setShowOnlyRated] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      initializeItemScores();
    }
  }, [items]);

  const initializeItemScores = () => {
    const scores: Record<string, ItemScore> = {};
    
    items.forEach(item => {
      scores[item.id] = {
        itemId: item.id,
        itemName: item.name || item.title,
        itemType: item.type,
        image: item.image,
        categoryFit: 'good',
        compatibilityScore: calculateCompatibilityScore(item, items),
        userRating: 3,
        matchingItems: findMatchingItems(item, items)
      };
    });
    
    setItemScores(scores);
  };

  const calculateCompatibilityScore = (item: any, allItems: any[]): number => {
    // חישוב בסיסי של ציון התאמה בהתבסס על צבע וסוג
    let score = 50; // ציון בסיס
    
    // בונוס עבור פריטים בסיסיים
    if (item.type === 'top' && item.color?.includes('black') || item.color?.includes('white')) {
      score += 20;
    }
    
    // בונוס עבור חפצים מקצועיים
    if (item.name?.toLowerCase().includes('blazer') || 
        item.name?.toLowerCase().includes('shirt') ||
        item.name?.toLowerCase().includes('trousers')) {
      score += 15;
    }
    
    // בונוס עבור נעליים קלאסיות
    if (item.type === 'shoes' && 
        (item.name?.toLowerCase().includes('oxford') ||
         item.name?.toLowerCase().includes('loafer'))) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const findMatchingItems = (item: any, allItems: any[]): string[] => {
    return allItems
      .filter(other => other.id !== item.id)
      .filter(other => {
        // לוגיקה פשוטה למציאת פריטים תואמים
        if (item.type === 'top' && other.type === 'bottom') return true;
        if (item.type === 'bottom' && other.type === 'top') return true;
        if (item.type === 'shoes') return true;
        return false;
      })
      .map(other => other.id)
      .slice(0, 3); // הגבל ל-3 פריטים תואמים
  };

  const updateItemScore = (itemId: string, field: keyof ItemScore, value: any) => {
    setItemScores(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));

    if (field === 'userRating' && onScoreUpdate) {
      onScoreUpdate(itemId, value);
    }

    // שמירה בלוקל סטורג'
    const updatedScore = { ...itemScores[itemId], [field]: value };
    localStorage.setItem(`item-score-${itemId}`, JSON.stringify(updatedScore));
  };

  const saveToDatabase = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('נדרשת התחברות לשמירת ציונים');
        return;
      }

      const score = itemScores[itemId];
      // כאן תוכלי להוסיף שמירה לבסיס נתונים
      // לדוגמה טבלה של user_item_scores
      
      toast.success('הציון נשמר בהצלחה!');
    } catch (error) {
      toast.error('שגיאה בשמירת הציון');
    }
  };

  const getCategoryFitColor = (fit: string) => {
    switch (fit) {
      case 'perfect': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'okay': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = Object.values(itemScores).filter(item => 
    !showOnlyRated || item.userRating !== 3
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">ניהול ציוני פריטים</h3>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">קז'ואל</SelectItem>
              <SelectItem value="work">עבודה</SelectItem>
              <SelectItem value="formal">רשמי</SelectItem>
              <SelectItem value="sport">ספורט</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showOnlyRated ? "default" : "outline"}
            onClick={() => setShowOnlyRated(!showOnlyRated)}
          >
            {showOnlyRated ? "הצג הכל" : "רק מדורגים"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.itemId} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{item.itemName}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {item.itemType}
                  </Badge>
                </div>
                <img 
                  src={item.image} 
                  alt={item.itemName}
                  className="w-12 h-12 object-cover rounded"
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* התאמה לקטגוריה */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  התאמה לקטגוריה {selectedCategory}
                </label>
                <Select 
                  value={item.categoryFit} 
                  onValueChange={(value) => updateItemScore(item.itemId, 'categoryFit', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfect">מושלם</SelectItem>
                    <SelectItem value="good">טוב</SelectItem>
                    <SelectItem value="okay">בסדר</SelectItem>
                    <SelectItem value="poor">לא מתאים</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={`mt-1 ${getCategoryFitColor(item.categoryFit)}`}>
                  {item.categoryFit === 'perfect' && 'מושלם'}
                  {item.categoryFit === 'good' && 'טוב'}
                  {item.categoryFit === 'okay' && 'בסדר'}
                  {item.categoryFit === 'poor' && 'לא מתאים'}
                </Badge>
              </div>

              {/* ציון התאמה אוטומטי */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">ציון התאמה אוטומטי</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-bold">{item.compatibilityScore}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.compatibilityScore}%` }}
                  />
                </div>
              </div>

              {/* דירוג המשתמש */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  הדירוג שלך (1-5)
                </label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[item.userRating]}
                    onValueChange={(value) => updateItemScore(item.itemId, 'userRating', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-bold min-w-[20px]">{item.userRating}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-4 w-4 cursor-pointer ${
                        star <= item.userRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      onClick={() => updateItemScore(item.itemId, 'userRating', star)}
                    />
                  ))}
                </div>
              </div>

              {/* פריטים תואמים */}
              <div>
                <span className="text-sm font-medium">פריטים תואמים:</span>
                <div className="text-xs text-gray-600 mt-1">
                  {item.matchingItems.length} פריטים נמצאו
                </div>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => saveToDatabase(item.itemId)}
                  className="flex-1"
                >
                  שמור
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateItemScore(item.itemId, 'userRating', 
                    item.userRating === 5 ? 1 : item.userRating + 1)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          אין פריטים להצגה
        </div>
      )}
    </div>
  );
};