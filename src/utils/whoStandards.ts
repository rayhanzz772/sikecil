import { WHORecord, Gender, GrowthStatus, WeightStatus } from '../types';

// Height-for-Age (HAZ) Reference Data (0 to 60 Months)
// Interpolated smoothly using key milestones to keep the bundle small and computation elegant.
const HAZ_BOYS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 44.2, sd2neg: 46.1, sd1neg: 48.0, median: 49.9, sd1pos: 51.8, sd2pos: 53.7, sd3pos: 55.6 },
  { month: 1, sd3neg: 48.9, sd2neg: 50.8, sd1neg: 52.8, median: 54.7, sd1pos: 56.7, sd2pos: 58.6, sd3pos: 60.6 },
  { month: 2, sd3neg: 52.4, sd2neg: 54.4, sd1neg: 56.4, median: 58.4, sd1pos: 60.4, sd2pos: 62.4, sd3pos: 64.4 },
  { month: 3, sd3neg: 55.3, sd2neg: 57.3, sd1neg: 59.4, median: 61.4, sd1pos: 63.5, sd2pos: 65.5, sd3pos: 67.6 },
  { month: 4, sd3neg: 57.8, sd2neg: 59.7, sd1neg: 61.8, median: 63.9, sd1pos: 66.0, sd2pos: 68.0, sd3pos: 70.1 },
  { month: 5, sd3neg: 59.6, sd2neg: 61.7, sd1neg: 63.8, median: 65.9, sd1pos: 68.0, sd2pos: 70.1, sd3pos: 72.2 },
  { month: 6, sd3neg: 61.2, sd2neg: 63.3, sd1neg: 65.5, median: 67.6, sd1pos: 69.8, sd2pos: 71.9, sd3pos: 74.0 },
  { month: 7, sd3neg: 62.7, sd2neg: 64.8, sd1neg: 67.0, median: 69.2, sd1pos: 71.3, sd2pos: 73.5, sd3pos: 75.7 },
  { month: 8, sd3neg: 64.0, sd2neg: 66.2, sd1neg: 68.4, median: 70.6, sd1pos: 72.8, sd2pos: 75.0, sd3pos: 77.2 },
  { month: 9, sd3neg: 65.2, sd2neg: 67.5, sd1neg: 69.7, median: 72.0, sd1pos: 74.2, sd2pos: 76.5, sd3pos: 78.7 },
  { month: 10, sd3neg: 66.4, sd2neg: 68.7, sd1neg: 71.0, median: 73.3, sd1pos: 75.6, sd2pos: 77.9, sd3pos: 80.1 },
  { month: 11, sd3neg: 67.6, sd2neg: 69.9, sd1neg: 72.2, median: 74.5, sd1pos: 76.8, sd2pos: 79.2, sd3pos: 81.5 },
  { month: 12, sd3neg: 68.6, sd2neg: 71.0, sd1neg: 73.4, median: 75.7, sd1pos: 78.1, sd2pos: 80.5, sd3pos: 82.9 },
  { month: 15, sd3neg: 71.6, sd2neg: 74.1, sd1neg: 76.6, median: 79.1, sd1pos: 81.6, sd2pos: 84.1, sd3pos: 86.5 },
  { month: 18, sd3neg: 74.4, sd2neg: 76.9, sd1neg: 79.6, median: 82.3, sd1pos: 85.0, sd2pos: 87.7, sd3pos: 90.4 },
  { month: 21, sd3neg: 76.8, sd2neg: 79.4, sd1neg: 82.3, median: 85.1, sd1pos: 88.0, sd2pos: 90.9, sd3pos: 93.8 },
  { month: 24, sd3neg: 78.0, sd2neg: 81.0, sd1neg: 84.1, median: 87.1, sd1pos: 90.2, sd2pos: 93.2, sd3pos: 96.3 },
  { month: 30, sd3neg: 82.7, sd2neg: 86.0, sd1neg: 89.2, median: 92.3, sd1pos: 95.5, sd2pos: 98.6, sd3pos: 101.7 },
  { month: 36, sd3neg: 86.8, sd2neg: 90.1, sd1neg: 93.1, median: 96.1, sd1pos: 99.4, sd2pos: 102.7, sd3pos: 106.9 },
  { month: 42, sd3neg: 90.0, sd2neg: 93.8, sd1neg: 97.2, median: 100.6, sd1pos: 104.2, sd2pos: 107.8, sd3pos: 111.9 },
  { month: 48, sd3neg: 93.0, sd2neg: 97.0, sd1neg: 100.1, median: 103.3, sd1pos: 107.2, sd2pos: 111.1, sd3pos: 115.8 },
  { month: 54, sd3neg: 96.0, sd2neg: 100.5, sd1neg: 103.9, median: 107.2, sd1pos: 111.1, sd2pos: 115.0, sd3pos: 119.2 },
  { month: 60, sd3neg: 98.7, sd2neg: 103.3, sd1neg: 106.7, median: 110.0, sd1pos: 114.3, sd2pos: 118.5, sd3pos: 122.8 }
];

const HAZ_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 43.6, sd2neg: 45.4, sd1neg: 47.3, median: 49.1, sd1pos: 51.0, sd2pos: 52.9, sd3pos: 54.7 },
  { month: 1, sd3neg: 47.8, sd2neg: 49.8, sd1neg: 51.7, median: 53.7, sd1pos: 55.7, sd2pos: 57.6, sd3pos: 59.5 },
  { month: 2, sd3neg: 51.0, sd2neg: 53.0, sd1neg: 55.0, median: 57.1, sd1pos: 59.1, sd2pos: 61.1, sd3pos: 63.2 },
  { month: 3, sd3neg: 53.5, sd2neg: 55.6, sd1neg: 57.7, median: 59.8, sd1pos: 61.9, sd2pos: 64.0, sd3pos: 66.1 },
  { month: 4, sd3neg: 55.6, sd2neg: 57.8, sd1neg: 59.9, median: 62.1, sd1pos: 64.3, sd2pos: 66.4, sd3pos: 68.6 },
  { month: 5, sd3neg: 57.4, sd2neg: 59.6, sd1neg: 61.8, median: 64.0, sd1pos: 66.2, sd2pos: 68.5, sd3pos: 70.7 },
  { month: 6, sd3neg: 58.9, sd2neg: 61.2, sd1neg: 63.5, median: 65.7, sd1pos: 68.0, sd2pos: 70.3, sd3pos: 72.5 },
  { month: 7, sd3neg: 60.3, sd2neg: 62.7, sd1neg: 65.0, median: 67.3, sd1pos: 69.6, sd2pos: 71.9, sd3pos: 74.2 },
  { month: 8, sd3neg: 61.7, sd2neg: 64.0, sd1neg: 66.4, median: 68.7, sd1pos: 71.1, sd2pos: 73.5, sd3pos: 75.8 },
  { month: 9, sd3neg: 62.9, sd2neg: 65.3, sd1neg: 67.7, median: 70.1, sd1pos: 72.6, sd2pos: 75.0, sd3pos: 77.4 },
  { month: 10, sd3neg: 64.1, sd2neg: 66.5, sd1neg: 69.0, median: 71.5, sd1pos: 73.9, sd2pos: 76.4, sd3pos: 78.9 },
  { month: 11, sd3neg: 65.3, sd2neg: 67.7, sd1neg: 70.3, median: 72.8, sd1pos: 75.3, sd2pos: 77.8, sd3pos: 80.3 },
  { month: 12, sd3neg: 66.4, sd2neg: 68.9, sd1neg: 71.4, median: 74.0, sd1pos: 76.6, sd2pos: 79.2, sd3pos: 81.7 },
  { month: 15, sd3neg: 69.6, sd2neg: 72.0, sd1neg: 74.8, median: 77.5, sd1pos: 80.2, sd2pos: 83.0, sd3pos: 85.7 },
  { month: 18, sd3neg: 72.4, sd2neg: 74.9, sd1neg: 77.8, median: 80.7, sd1pos: 83.6, sd2pos: 86.5, sd3pos: 89.4 },
  { month: 21, sd3neg: 74.9, sd2neg: 77.5, sd1neg: 80.5, median: 83.5, sd1pos: 86.5, sd2pos: 89.6, sd3pos: 92.6 },
  { month: 24, sd3neg: 76.0, sd2neg: 79.0, sd1neg: 82.0, median: 85.0, sd1pos: 88.2, sd2pos: 91.3, sd3pos: 94.5 },
  { month: 30, sd3neg: 81.0, sd2neg: 84.2, sd1neg: 87.4, median: 90.7, sd1pos: 94.0, sd2pos: 97.3, sd3pos: 100.6 },
  { month: 36, sd3neg: 85.0, sd2neg: 88.4, sd1neg: 91.8, median: 95.1, sd1pos: 98.5, sd2pos: 101.9, sd3pos: 105.4 },
  { month: 42, sd3neg: 88.5, sd2neg: 92.1, sd1neg: 95.6, median: 99.0, sd1pos: 102.5, sd2pos: 106.0, sd3pos: 110.0 },
  { month: 48, sd3neg: 91.5, sd2neg: 95.4, sd1neg: 99.0, median: 102.7, sd1pos: 106.4, sd2pos: 110.0, sd3pos: 114.0 },
  { month: 54, sd3neg: 94.2, sd2neg: 98.4, sd1neg: 102.3, median: 106.2, sd1pos: 110.0, sd2pos: 113.8, sd3pos: 118.0 },
  { month: 60, sd3neg: 97.0, sd2neg: 101.1, sd1neg: 105.2, median: 109.4, sd1pos: 113.5, sd2pos: 117.5, sd3pos: 121.8 }
];

// Weight-for-Age (WAZ) Reference Data (0 to 60 Months)
const WAZ_BOYS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 2.1, sd2neg: 2.5, sd1neg: 2.9, median: 3.3, sd1pos: 3.9, sd2pos: 4.4, sd3pos: 5.0 },
  { month: 1, sd3neg: 2.9, sd2neg: 3.4, sd1neg: 3.9, median: 4.5, sd1pos: 5.1, sd2pos: 5.8, sd3pos: 6.6 },
  { month: 2, sd3neg: 3.8, sd2neg: 4.3, sd1neg: 4.9, median: 5.6, sd1pos: 6.3, sd2pos: 7.1, sd3pos: 8.0 },
  { month: 3, sd3neg: 4.4, sd2neg: 5.0, sd1neg: 5.7, median: 6.4, sd1pos: 7.2, sd2pos: 8.0, sd3pos: 9.0 },
  { month: 4, sd3neg: 4.9, sd2neg: 5.6, sd1neg: 6.2, median: 7.0, sd1pos: 7.8, sd2pos: 8.7, sd3pos: 9.7 },
  { month: 5, sd3neg: 5.3, sd2neg: 6.0, sd1neg: 6.7, median: 7.5, sd1pos: 8.4, sd2pos: 9.3, sd3pos: 10.4 },
  { month: 6, sd3neg: 5.7, sd2neg: 6.4, sd1neg: 7.1, median: 7.9, sd1pos: 8.8, sd2pos: 9.8, sd3pos: 10.9 },
  { month: 7, sd3neg: 6.0, sd2neg: 6.7, sd1neg: 7.4, median: 8.3, sd1pos: 9.3, sd2pos: 10.3, sd3pos: 11.4 },
  { month: 8, sd3neg: 6.3, sd2neg: 7.0, sd1neg: 7.8, median: 8.6, sd1pos: 9.6, sd2pos: 10.7, sd3pos: 11.9 },
  { month: 9, sd3neg: 6.5, sd2neg: 7.2, sd1neg: 8.0, median: 8.9, sd1pos: 9.9, sd2pos: 11.0, sd3pos: 12.3 },
  { month: 10, sd3neg: 6.7, sd2neg: 7.4, sd1neg: 8.2, median: 9.2, sd1pos: 10.2, sd2pos: 11.4, sd3pos: 12.7 },
  { month: 11, sd3neg: 6.9, sd2neg: 7.6, sd1neg: 8.5, median: 9.4, sd1pos: 10.5, sd2pos: 11.7, sd3pos: 13.0 },
  { month: 12, sd3neg: 7.1, sd2neg: 7.8, sd1neg: 8.7, median: 9.6, sd1pos: 10.8, sd2pos: 12.0, sd3pos: 13.3 },
  { month: 15, sd3neg: 7.5, sd2neg: 8.3, sd1neg: 9.2, median: 10.3, sd1pos: 11.5, sd2pos: 12.8, sd3pos: 14.2 },
  { month: 18, sd3neg: 7.9, sd2neg: 8.8, sd1neg: 9.8, median: 10.9, sd1pos: 12.2, sd2pos: 13.7, sd3pos: 15.1 },
  { month: 21, sd3neg: 8.4, sd2neg: 9.2, sd1neg: 10.3, median: 11.5, sd1pos: 12.9, sd2pos: 14.5, sd3pos: 16.0 },
  { month: 24, sd3neg: 8.6, sd2neg: 9.7, sd1neg: 10.8, median: 12.2, sd1pos: 13.6, sd2pos: 15.3, sd3pos: 17.0 },
  { month: 30, sd3neg: 9.4, sd2neg: 10.5, sd1neg: 11.8, median: 13.3, sd1pos: 15.0, sd2pos: 16.9, sd3pos: 19.0 },
  { month: 36, sd3neg: 10.1, sd2neg: 11.3, sd1neg: 12.7, median: 14.3, sd1pos: 16.2, sd2pos: 18.3, sd3pos: 21.0 },
  { month: 42, sd3neg: 10.8, sd2neg: 12.1, sd1neg: 13.6, median: 15.3, sd1pos: 17.4, sd2pos: 19.7, sd3pos: 22.8 },
  { month: 48, sd3neg: 11.4, sd2neg: 12.7, sd1neg: 14.4, median: 16.3, sd1pos: 18.6, sd2pos: 21.2, sd3pos: 24.5 },
  { month: 54, sd3neg: 11.9, sd2neg: 13.4, sd1neg: 15.2, median: 17.3, sd1pos: 19.8, sd2pos: 22.7, sd3pos: 26.4 },
  { month: 60, sd3neg: 12.4, sd2neg: 14.1, sd1neg: 16.0, median: 18.3, sd1pos: 21.0, sd2pos: 24.2, sd3pos: 28.2 }
];

const WAZ_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 2.0, sd2neg: 2.4, sd1neg: 2.8, median: 3.2, sd1pos: 3.7, sd2pos: 4.2, sd3pos: 4.8 },
  { month: 1, sd3neg: 2.7, sd2neg: 3.2, sd1neg: 3.6, median: 4.2, sd1pos: 4.8, sd2pos: 5.5, sd3pos: 6.2 },
  { month: 2, sd3neg: 3.4, sd2neg: 3.9, sd1neg: 4.5, median: 5.1, sd1pos: 5.8, sd2pos: 6.6, sd3pos: 7.5 },
  { month: 3, sd3neg: 4.0, sd2neg: 4.5, sd1neg: 5.1, median: 5.8, sd1pos: 6.6, sd2pos: 7.5, sd3pos: 8.5 },
  { month: 4, sd3neg: 4.4, sd2neg: 5.0, sd1neg: 5.6, median: 6.4, sd1pos: 7.2, sd2pos: 8.2, sd3pos: 9.3 },
  { month: 5, sd3neg: 4.8, sd2neg: 5.4, sd1neg: 6.1, median: 6.9, sd1pos: 7.8, sd2pos: 8.8, sd3pos: 10.0 },
  { month: 6, sd3neg: 5.1, sd2neg: 5.7, sd1neg: 6.4, median: 7.3, sd1pos: 8.2, sd2pos: 9.3, sd3pos: 10.6 },
  { month: 7, sd3neg: 5.3, sd2neg: 6.0, sd1neg: 6.8, median: 7.6, sd1pos: 8.6, sd2pos: 9.8, sd3pos: 11.1 },
  { month: 8, sd3neg: 5.6, sd2neg: 6.3, sd1neg: 7.1, median: 8.0, sd1pos: 9.0, sd2pos: 10.2, sd3pos: 11.6 },
  { month: 9, sd3neg: 5.8, sd2neg: 6.5, sd1neg: 7.3, median: 8.2, sd1pos: 9.3, sd2pos: 10.5, sd3pos: 12.0 },
  { month: 10, sd3neg: 5.9, sd2neg: 6.7, sd1neg: 7.5, median: 8.5, sd1pos: 9.6, sd2pos: 10.9, sd3pos: 12.4 },
  { month: 11, sd3neg: 6.1, sd2neg: 6.9, sd1neg: 7.8, median: 8.7, sd1pos: 9.9, sd2pos: 11.2, sd3pos: 12.8 },
  { month: 12, sd3neg: 6.3, sd2neg: 7.0, sd1neg: 7.9, median: 8.9, sd1pos: 10.1, sd2pos: 11.5, sd3pos: 13.1 },
  { month: 15, sd3neg: 6.7, sd2neg: 7.6, sd1neg: 8.5, median: 9.6, sd1pos: 11.0, sd2pos: 12.4, sd3pos: 14.1 },
  { month: 18, sd3neg: 7.2, sd2neg: 8.1, sd1neg: 9.1, median: 10.2, sd1pos: 11.6, sd2pos: 13.2, sd3pos: 15.0 },
  { month: 21, sd3neg: 7.6, sd2neg: 8.6, sd1neg: 9.7, median: 10.9, sd1pos: 12.4, sd2pos: 14.0, sd3pos: 16.0 },
  { month: 24, sd3neg: 8.1, sd2neg: 9.0, sd1neg: 10.2, median: 11.5, sd1pos: 13.1, sd2pos: 14.8, sd3pos: 17.0 },
  { month: 30, sd3neg: 8.9, sd2neg: 9.9, sd1neg: 11.2, median: 12.7, sd1pos: 14.5, sd2pos: 16.4, sd3pos: 19.0 },
  { month: 36, sd3neg: 9.6, sd2neg: 10.8, sd1neg: 12.2, median: 13.9, sd1pos: 15.9, sd2pos: 18.1, sd3pos: 21.0 },
  { month: 42, sd3neg: 10.2, sd2neg: 11.6, sd1neg: 13.1, median: 15.0, sd1pos: 17.2, sd2pos: 19.6, sd3pos: 22.8 },
  { month: 48, sd3neg: 10.9, sd2neg: 12.3, sd1neg: 14.0, median: 16.1, sd1pos: 18.5, sd2pos: 21.2, sd3pos: 24.5 },
  { month: 54, sd3neg: 11.4, sd2neg: 13.0, sd1neg: 14.8, median: 17.2, sd1pos: 19.8, sd2pos: 22.7, sd3pos: 26.4 },
  { month: 60, sd3neg: 12.0, sd2neg: 13.7, sd1neg: 15.8, median: 18.2, sd1pos: 21.0, sd2pos: 24.2, sd3pos: 28.2 }
];

// Head Circumference-for-Age (HCFA) Reference Data (0 to 60 Months)
const HCFA_BOYS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 31.9, sd2neg: 32.7, sd1neg: 33.6, median: 34.5, sd1pos: 35.4, sd2pos: 36.3, sd3pos: 37.1 },
  { month: 1, sd3neg: 34.7, sd2neg: 35.6, sd1neg: 36.4, median: 37.3, sd1pos: 38.2, sd2pos: 39.1, sd3pos: 40.0 },
  { month: 2, sd3neg: 36.5, sd2neg: 37.4, sd1neg: 38.2, median: 39.1, sd1pos: 40.0, sd2pos: 40.9, sd3pos: 41.8 },
  { month: 3, sd3neg: 37.9, sd2neg: 38.8, sd1neg: 39.6, median: 40.5, sd1pos: 41.4, sd2pos: 42.3, sd3pos: 43.1 },
  { month: 4, sd3neg: 39.0, sd2neg: 39.9, sd1neg: 40.7, median: 41.6, sd1pos: 42.5, sd2pos: 43.4, sd3pos: 44.3 },
  { month: 5, sd3neg: 39.9, sd2neg: 40.8, sd1neg: 41.6, median: 42.5, sd1pos: 43.4, sd2pos: 44.3, sd3pos: 45.2 },
  { month: 6, sd3neg: 40.7, sd2neg: 41.6, sd1neg: 42.4, median: 43.3, sd1pos: 44.2, sd2pos: 45.1, sd3pos: 46.0 },
  { month: 8, sd3neg: 42.0, sd2neg: 42.9, sd1neg: 43.7, median: 44.6, sd1pos: 45.5, sd2pos: 46.4, sd3pos: 47.3 },
  { month: 10, sd3neg: 43.0, sd2neg: 43.9, sd1neg: 44.7, median: 45.6, sd1pos: 46.5, sd2pos: 47.4, sd3pos: 48.3 },
  { month: 12, sd3neg: 43.5, sd2neg: 44.4, sd1neg: 45.2, median: 46.1, sd1pos: 47.0, sd2pos: 47.9, sd3pos: 48.8 },
  { month: 18, sd3neg: 44.9, sd2neg: 45.8, sd1neg: 46.6, median: 47.5, sd1pos: 48.4, sd2pos: 49.3, sd3pos: 50.2 },
  { month: 24, sd3neg: 45.7, sd2neg: 46.6, sd1neg: 47.4, median: 48.3, sd1pos: 49.2, sd2pos: 50.1, sd3pos: 51.0 },
  { month: 36, sd3neg: 46.7, sd2neg: 47.6, sd1neg: 48.4, median: 49.3, sd1pos: 50.2, sd2pos: 51.1, sd3pos: 52.0 },
  { month: 48, sd3neg: 47.5, sd2neg: 48.4, sd1neg: 49.2, median: 50.1, sd1pos: 51.0, sd2pos: 51.9, sd3pos: 52.8 },
  { month: 60, sd3neg: 48.2, sd2neg: 49.1, sd1neg: 49.9, median: 50.8, sd1pos: 51.7, sd2pos: 52.6, sd3pos: 53.5 }
];

const HCFA_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 31.3, sd2neg: 32.1, sd1neg: 33.0, median: 33.9, sd1pos: 34.8, sd2pos: 35.7, sd3pos: 36.5 },
  { month: 1, sd3neg: 33.9, sd2neg: 34.7, sd1neg: 35.6, median: 36.5, sd1pos: 37.4, sd2pos: 38.3, sd3pos: 39.1 },
  { month: 2, sd3neg: 35.6, sd2neg: 36.4, sd1neg: 37.3, median: 38.2, sd1pos: 39.1, sd2pos: 40.0, sd3pos: 40.8 },
  { month: 3, sd3neg: 36.9, sd2neg: 37.8, sd1neg: 38.6, median: 39.5, sd1pos: 40.4, sd2pos: 41.3, sd3pos: 42.1 },
  { month: 4, sd3neg: 37.9, sd2neg: 38.8, sd1neg: 39.6, median: 40.5, sd1pos: 41.4, sd2pos: 42.3, sd3pos: 43.1 },
  { month: 5, sd3neg: 38.7, sd2neg: 39.6, sd1neg: 40.4, median: 41.3, sd1pos: 42.2, sd2pos: 43.1, sd3pos: 44.0 },
  { month: 6, sd3neg: 39.4, sd2neg: 40.3, sd1neg: 41.1, median: 42.0, sd1pos: 42.9, sd2pos: 43.8, sd3pos: 44.7 },
  { month: 8, sd3neg: 40.6, sd2neg: 41.5, sd1neg: 42.3, median: 43.2, sd1pos: 44.1, sd2pos: 45.0, sd3pos: 45.9 },
  { month: 10, sd3neg: 41.6, sd2neg: 42.5, sd1neg: 43.3, median: 44.2, sd1pos: 45.1, sd2pos: 46.0, sd3pos: 46.9 },
  { month: 12, sd3neg: 42.4, sd2neg: 43.3, sd1neg: 44.1, median: 45.0, sd1pos: 45.9, sd2pos: 46.8, sd3pos: 47.7 },
  { month: 18, sd3neg: 43.8, sd2neg: 44.7, sd1neg: 45.5, median: 46.4, sd1pos: 47.3, sd2pos: 48.2, sd3pos: 49.1 },
  { month: 24, sd3neg: 44.6, sd2neg: 45.5, sd1neg: 46.3, median: 47.2, sd1pos: 48.1, sd2pos: 49.0, sd3pos: 49.9 },
  { month: 36, sd3neg: 45.6, sd2neg: 46.5, sd1neg: 47.3, median: 48.2, sd1pos: 49.1, sd2pos: 50.0, sd3pos: 50.9 },
  { month: 48, sd3neg: 46.5, sd2neg: 47.4, sd1neg: 48.2, median: 49.1, sd1pos: 50.0, sd2pos: 50.9, sd3pos: 51.8 },
  { month: 60, sd3neg: 47.3, sd2neg: 48.2, sd1neg: 49.0, median: 49.9, sd1pos: 50.8, sd2pos: 51.7, sd3pos: 52.6 }
];

// Helper to interpolate between WHO records smoothly
export function getInterpolatedRecord(month: number, gender: Gender, type: 'height' | 'weight' | 'head'): WHORecord {
  const milestones = type === 'height' 
    ? (gender === 'Laki-laki' ? HAZ_BOYS_MILESTONES : HAZ_GIRLS_MILESTONES)
    : type === 'weight'
      ? (gender === 'Laki-laki' ? WAZ_BOYS_MILESTONES : WAZ_GIRLS_MILESTONES)
      : (gender === 'Laki-laki' ? HCFA_BOYS_MILESTONES : HCFA_GIRLS_MILESTONES);

  // Bound the input month
  const targetMonth = Math.max(0, Math.min(60, month));

  // Find adjacent milestones
  let m1 = milestones[0];
  let m2 = milestones[milestones.length - 1];

  for (let i = 0; i < milestones.length - 1; i++) {
    if (targetMonth >= milestones[i].month && targetMonth <= milestones[i+1].month) {
      m1 = milestones[i];
      m2 = milestones[i+1];
      break;
    }
  }

  // If exact match
  if (m1.month === m2.month) return { ...m1 };

  // Calculate interpolation factor
  const factor = (targetMonth - m1.month) / (m2.month - m1.month);

  const interpolateValue = (v1: number, v2: number) => {
    return Number((v1 + (v2 - v1) * factor).toFixed(2));
  };

  return {
    month: Number(targetMonth.toFixed(1)),
    sd3neg: interpolateValue(m1.sd3neg, m2.sd3neg),
    sd2neg: interpolateValue(m1.sd2neg, m2.sd2neg),
    sd1neg: interpolateValue(m1.sd1neg, m2.sd1neg),
    median: interpolateValue(m1.median, m2.median),
    sd1pos: interpolateValue(m1.sd1pos, m2.sd1pos),
    sd2pos: interpolateValue(m1.sd2pos, m2.sd2pos),
    sd3pos: interpolateValue(m1.sd3pos, m2.sd3pos),
  };
}

// Generate complete array of data points for plotting WHO bands in charts
export function generateWHOChartData(gender: Gender, maxMonths: number = 24, type: 'height' | 'weight' | 'head'): WHORecord[] {
  const data: WHORecord[] = [];
  // We can push points at every month for smooth plotting
  for (let m = 0; m <= maxMonths; m++) {
    data.push(getInterpolatedRecord(m, gender, type));
  }
  return data;
}

// Calculate Age details (Years, Months, Days) from Birth Date and Target Date
export function calculateAge(birthDateStr: string, targetDateStr: string = new Date().toISOString().split('T')[0]) {
  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Get last day of previous month
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Total absolute age in months (as a float for perfect calculations)
  const totalDays = (target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
  const absoluteMonths = Number((totalDays / 30.4375).toFixed(2));

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalMonthsFloat: Math.max(0, absoluteMonths)
  };
}

// Format Indonesian friendly Age Text
export function formatAgeText(birthDateStr: string, targetDateStr: string = new Date().toISOString().split('T')[0]): string {
  const { years, months, days } = calculateAge(birthDateStr, targetDateStr);
  if (years === 0 && months === 0) {
    return `${days} Hari`;
  }
  if (years === 0) {
    return `${months} Bulan ${days} Hari`;
  }
  return `${years} Tahun ${months} Bulan ${days} Hari`;
}

// Determine Stunting Status (HAZ - Height for Age Z-Score)
export function getStuntingStatus(height: number, ageMonths: number, gender: Gender): { status: GrowthStatus; colorClass: string; textClass: string; zScore: number } {
  const ref = getInterpolatedRecord(ageMonths, gender, 'height');
  
  // Calculate Z-Score
  // Z = (value - median) / SD
  let zScore = 0;
  if (height < ref.median) {
    // If lower than median, SD is calculated from median to -1 SD
    const sdLower = ref.median - ref.sd1neg;
    zScore = (height - ref.median) / sdLower;
  } else {
    // If higher than median, SD is calculated from median to +1 SD
    const sdUpper = ref.sd1pos - ref.median;
    zScore = (height - ref.median) / sdUpper;
  }

  zScore = Number(zScore.toFixed(2));

  if (zScore < -3) {
    return { status: 'Sangat Pendek', colorClass: 'bg-red-50 text-red-700 border-red-200', textClass: 'text-red-600', zScore };
  }
  if (zScore < -2) {
    return { status: 'Pendek', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-600', zScore };
  }
  if (zScore <= 3) {
    return { status: 'Normal', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', textClass: 'text-emerald-600', zScore };
  }
  return { status: 'Tinggi', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', textClass: 'text-blue-600', zScore };
}

// Determine Weight Status (WAZ - Weight for Age Z-Score)
export function getWeightStatus(weight: number, ageMonths: number, gender: Gender): { status: WeightStatus; colorClass: string; textClass: string; zScore: number } {
  const ref = getInterpolatedRecord(ageMonths, gender, 'weight');
  
  let zScore = 0;
  if (weight < ref.median) {
    const sdLower = ref.median - ref.sd1neg;
    zScore = (weight - ref.median) / sdLower;
  } else {
    const sdUpper = ref.sd1pos - ref.median;
    zScore = (weight - ref.median) / sdUpper;
  }

  zScore = Number(zScore.toFixed(2));

  if (zScore < -3) {
    return { status: 'Sangat Kurang', colorClass: 'bg-red-50 text-red-700 border-red-200', textClass: 'text-red-600', zScore };
  }
  if (zScore < -2) {
    return { status: 'Kurang', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-600', zScore };
  }
  if (zScore <= 2) {
    return { status: 'Normal', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', textClass: 'text-emerald-600', zScore };
  }
  return { status: 'Risiko Berat Badan Lebih', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', textClass: 'text-blue-600', zScore };
}

// Determine Head Circumference Status (HCFA - Head Circumference for Age Z-Score)
export function getHeadCircumferenceStatus(headCirc: number, ageMonths: number, gender: Gender): { status: 'Sangat Kecil' | 'Kecil' | 'Normal' | 'Sangat Besar'; colorClass: string; textClass: string; zScore: number } {
  const ref = getInterpolatedRecord(ageMonths, gender, 'head');
  
  let zScore = 0;
  if (headCirc < ref.median) {
    const sdLower = ref.median - ref.sd1neg;
    zScore = (headCirc - ref.median) / sdLower;
  } else {
    const sdUpper = ref.sd1pos - ref.median;
    zScore = (headCirc - ref.median) / sdUpper;
  }

  zScore = Number(zScore.toFixed(2));

  if (zScore < -3) {
    return { status: 'Sangat Kecil', colorClass: 'bg-red-50 text-red-700 border-red-200', textClass: 'text-red-600', zScore };
  }
  if (zScore < -2) {
    return { status: 'Kecil', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-600', zScore };
  }
  if (zScore <= 2) {
    return { status: 'Normal', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', textClass: 'text-emerald-600', zScore };
  }
  return { status: 'Sangat Besar', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', textClass: 'text-blue-600', zScore };
}
