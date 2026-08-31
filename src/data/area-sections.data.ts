import { indoorFacilitySections, outdoorFacilitySections } from './registration-data';

export interface AreaSectionSpec {
  tab: string;
  group: 'indoor' | 'outdoor';
}

/** The 14 area-section types from the PDF, mapped onto this build's real tab names
 *  ("Other Option" under Outdoor Facilities has no PDF-listed equivalent and is skipped). */
export const areaSections: AreaSectionSpec[] = [
  ...indoorFacilitySections.map((tab) => ({ tab, group: 'indoor' as const })),
  ...outdoorFacilitySections.map((tab) => ({ tab, group: 'outdoor' as const })),
];
