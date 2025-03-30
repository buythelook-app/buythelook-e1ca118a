
/**
 * Main look service that exports all necessary functions for outfit generation
 */

import { fetchFirstOutfitSuggestion } from './outfitService';
import { fetchDashboardItems } from './dashboardService';
import { mapDashboardItemToOutfitItem } from './mappers/styleMappers';
import { hasSolidColorIndicator, hasPatternInName } from './outfitFactory';

export {
  fetchFirstOutfitSuggestion,
  fetchDashboardItems,
  mapDashboardItemToOutfitItem,
  hasSolidColorIndicator,
  hasPatternInName
};
