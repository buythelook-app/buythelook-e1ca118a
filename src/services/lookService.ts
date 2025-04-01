/**
 * Main look service that exports all necessary functions for outfit generation
 */

import { fetchFirstOutfitSuggestion } from './outfitService';
import { fetchItemsForOccasion } from './dashboardService';
import { mapDashboardItemToOutfitItem } from './mappers/styleMappers';

export {
  fetchFirstOutfitSuggestion,
  fetchItemsForOccasion,
  mapDashboardItemToOutfitItem
};
