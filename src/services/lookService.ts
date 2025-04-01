
/**
 * Main look service that exports all necessary functions for outfit generation
 */

import { fetchFirstOutfitSuggestion } from './outfitService';
import { fetchItemsForOccasion } from './dashboardService';
import { mapDashboardItemToOutfitItem } from './mappers/styleMappers';
import { findBestColorMatch } from './fetchers/itemsFetcher';

export {
  fetchFirstOutfitSuggestion,
  fetchItemsForOccasion,
  mapDashboardItemToOutfitItem,
  findBestColorMatch
};
