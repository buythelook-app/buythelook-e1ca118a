import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

interface DebugPanelProps {
  apiCallStatus?: string;
  itemsReceived?: number;
  rawApiData?: any;
  currentDisplayState?: any;
  errors?: string[];
  isLoading?: boolean;
}

export function DebugPanel({
  apiCallStatus = 'unknown',
  itemsReceived = 0,
  rawApiData = null,
  currentDisplayState = null,
  errors = [],
  isLoading = false
}: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-show panel if there are errors or important data
  useEffect(() => {
    if (errors.length > 0 || itemsReceived === 0) {
      setIsVisible(true);
    }
  }, [errors, itemsReceived]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-black/80 text-white border-white/20 hover:bg-white/10"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-500';
      case 'error': case 'failed': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-black/90 border-white/20 text-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">API Debug Panel</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-white hover:bg-white/10"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* API Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs">API Status:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(apiCallStatus)} text-white border-0`}
            >
              {isLoading ? 'Loading...' : apiCallStatus}
            </Badge>
          </div>

          {/* Items Count */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Items Received:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${itemsReceived > 0 ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}
            >
              {itemsReceived}
            </Badge>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-red-400">Errors:</span>
              {errors.map((error, index) => (
                <div key={index} className="text-xs bg-red-500/20 p-2 rounded border-l-2 border-red-500">
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Expandable sections */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-8 text-xs text-white hover:bg-white/10">
                Raw Data
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2">
              {/* Raw API Data */}
              {rawApiData && (
                <div className="space-y-1">
                  <span className="text-xs text-blue-400">API Response:</span>
                  <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-32 text-green-400">
                    {JSON.stringify(rawApiData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Current Display State */}
              {currentDisplayState && (
                <div className="space-y-1">
                  <span className="text-xs text-purple-400">Display State:</span>
                  <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-32 text-purple-300">
                    {JSON.stringify(currentDisplayState, null, 2)}
                  </pre>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}