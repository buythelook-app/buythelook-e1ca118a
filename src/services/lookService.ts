
/**
 * Main look service that exports all necessary functions for outfit generation
 */

import { fetchFirstOutfitSuggestion } from './outfitService';
import { fetchDashboardItems } from './dashboardService';
import { mapDashboardItemToOutfitItem } from './mappers/styleMappers';

export {
  fetchFirstOutfitSuggestion,
  fetchDashboardItems,
  mapDashboardItemToOutfitItem
};
