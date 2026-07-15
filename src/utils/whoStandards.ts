import { WHORecord, Gender, GrowthStatus, WeightStatus } from '../types';

// Height-for-Age (HAZ) Reference Data (0 to 60 Months)
// Interpolated smoothly using key milestones to keep the bundle small and computation elegant.
const HAZ_BOYS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 44.2, sd2neg: 46.1, sd1neg: 48.0, median: 49.9, sd1pos: 51.8, sd2pos: 53.7, sd3pos: 55.6 },
  { month: 1, sd3neg: 48.9, sd2neg: 50.8, sd1neg: 52.8, median: 54.7, sd1pos: 56.7, sd2pos: 58.6, sd3pos: 60.6 },
  { month: 2, sd3neg: 52.4, sd2neg: 54.4, sd1neg: 56.4, median: 58.4, sd1pos: 60.4, sd2pos: 62.4, sd3pos: 64.4 },
  { month: 3, sd3neg: 55.3, sd2neg: 57.3, sd1neg: 59.4, median: 61.4, sd1pos: 63.5, sd2pos: 65.5, sd3pos: 67.6 },
  { month: 4, sd3neg: 57.6, sd2neg: 59.7, sd1neg: 61.8, median: 63.9, sd1pos: 66.0, sd2pos: 68.0, sd3pos: 70.1 },
  { month: 5, sd3neg: 59.6, sd2neg: 61.7, sd1neg: 63.8, median: 65.9, sd1pos: 68.0, sd2pos: 70.1, sd3pos: 72.2 },
  { month: 6, sd3neg: 61.2, sd2neg: 63.3, sd1neg: 65.5, median: 67.6, sd1pos: 69.8, sd2pos: 71.9, sd3pos: 74.0 },
  { month: 7, sd3neg: 62.7, sd2neg: 64.8, sd1neg: 67.0, median: 69.2, sd1pos: 71.3, sd2pos: 73.5, sd3pos: 75.7 },
  { month: 8, sd3neg: 64.0, sd2neg: 66.2, sd1neg: 68.4, median: 70.6, sd1pos: 72.8, sd2pos: 75.0, sd3pos: 77.2 },
  { month: 9, sd3neg: 65.2, sd2neg: 67.5, sd1neg: 69.7, median: 72.0, sd1pos: 74.2, sd2pos: 76.5, sd3pos: 78.7 },
  { month: 10, sd3neg: 66.4, sd2neg: 68.7, sd1neg: 71.0, median: 73.3, sd1pos: 75.6, sd2pos: 77.9, sd3pos: 80.1 },
  { month: 11, sd3neg: 67.6, sd2neg: 69.9, sd1neg: 72.2, median: 74.5, sd1pos: 76.9, sd2pos: 79.2, sd3pos: 81.5 },
  { month: 12, sd3neg: 68.6, sd2neg: 71.0, sd1neg: 73.4, median: 75.7, sd1pos: 78.1, sd2pos: 80.5, sd3pos: 82.9 },
  { month: 13, sd3neg: 69.6, sd2neg: 72.1, sd1neg: 74.5, median: 76.9, sd1pos: 79.3, sd2pos: 81.8, sd3pos: 84.2 },
  { month: 14, sd3neg: 70.6, sd2neg: 73.1, sd1neg: 75.6, median: 78.0, sd1pos: 80.5, sd2pos: 83.0, sd3pos: 85.5 },
  { month: 15, sd3neg: 71.6, sd2neg: 74.1, sd1neg: 76.6, median: 79.1, sd1pos: 81.7, sd2pos: 84.2, sd3pos: 86.7 },
  { month: 16, sd3neg: 72.5, sd2neg: 75.0, sd1neg: 77.6, median: 80.2, sd1pos: 82.8, sd2pos: 85.4, sd3pos: 88.0 },
  { month: 17, sd3neg: 73.3, sd2neg: 76.0, sd1neg: 78.6, median: 81.2, sd1pos: 83.9, sd2pos: 86.5, sd3pos: 89.2 },
  { month: 18, sd3neg: 74.2, sd2neg: 76.9, sd1neg: 79.6, median: 82.3, sd1pos: 85.0, sd2pos: 87.7, sd3pos: 90.4 },
  { month: 19, sd3neg: 75.0, sd2neg: 77.7, sd1neg: 80.5, median: 83.2, sd1pos: 86.0, sd2pos: 88.8, sd3pos: 91.5 },
  { month: 20, sd3neg: 75.8, sd2neg: 78.6, sd1neg: 81.4, median: 84.2, sd1pos: 87.0, sd2pos: 89.8, sd3pos: 92.6 },
  { month: 21, sd3neg: 76.5, sd2neg: 79.4, sd1neg: 82.3, median: 85.1, sd1pos: 88.0, sd2pos: 90.9, sd3pos: 93.8 },
  { month: 22, sd3neg: 77.2, sd2neg: 80.2, sd1neg: 83.1, median: 86.0, sd1pos: 89.0, sd2pos: 91.9, sd3pos: 94.9 },
  { month: 23, sd3neg: 78.0, sd2neg: 81.0, sd1neg: 83.9, median: 86.9, sd1pos: 89.9, sd2pos: 92.9, sd3pos: 95.9 },
  { month: 24, sd3neg: 78.7, sd2neg: 81.7, sd1neg: 84.8, median: 87.8, sd1pos: 90.9, sd2pos: 93.9, sd3pos: 97.0 },
  { month: 25, sd3neg: 78.6, sd2neg: 81.7, sd1neg: 84.9, median: 88.0, sd1pos: 91.1, sd2pos: 94.2, sd3pos: 97.3 },
  { month: 26, sd3neg: 79.3, sd2neg: 82.5, sd1neg: 85.6, median: 88.8, sd1pos: 92.0, sd2pos: 95.2, sd3pos: 98.3 },
  { month: 27, sd3neg: 79.9, sd2neg: 83.1, sd1neg: 86.4, median: 89.6, sd1pos: 92.9, sd2pos: 96.1, sd3pos: 99.3 },
  { month: 28, sd3neg: 80.5, sd2neg: 83.8, sd1neg: 87.1, median: 90.4, sd1pos: 93.7, sd2pos: 97.0, sd3pos: 100.3 },
  { month: 29, sd3neg: 81.1, sd2neg: 84.5, sd1neg: 87.8, median: 91.2, sd1pos: 94.5, sd2pos: 97.9, sd3pos: 101.2 },
  { month: 30, sd3neg: 81.7, sd2neg: 85.1, sd1neg: 88.5, median: 91.9, sd1pos: 95.3, sd2pos: 98.7, sd3pos: 102.1 },
  { month: 31, sd3neg: 82.3, sd2neg: 85.7, sd1neg: 89.2, median: 92.7, sd1pos: 96.1, sd2pos: 99.6, sd3pos: 103.0 },
  { month: 32, sd3neg: 82.8, sd2neg: 86.4, sd1neg: 89.9, median: 93.4, sd1pos: 96.9, sd2pos: 100.4, sd3pos: 103.9 },
  { month: 33, sd3neg: 83.4, sd2neg: 86.9, sd1neg: 90.5, median: 94.1, sd1pos: 97.6, sd2pos: 101.2, sd3pos: 104.8 },
  { month: 34, sd3neg: 83.9, sd2neg: 87.5, sd1neg: 91.1, median: 94.8, sd1pos: 98.4, sd2pos: 102.0, sd3pos: 105.6 },
  { month: 35, sd3neg: 84.4, sd2neg: 88.1, sd1neg: 91.8, median: 95.4, sd1pos: 99.1, sd2pos: 102.7, sd3pos: 106.4 },
  { month: 36, sd3neg: 85.0, sd2neg: 88.7, sd1neg: 92.4, median: 96.1, sd1pos: 99.8, sd2pos: 103.5, sd3pos: 107.2 },
  { month: 37, sd3neg: 85.5, sd2neg: 89.2, sd1neg: 93.0, median: 96.7, sd1pos: 100.5, sd2pos: 104.2, sd3pos: 108.0 },
  { month: 38, sd3neg: 86.0, sd2neg: 89.8, sd1neg: 93.6, median: 97.4, sd1pos: 101.2, sd2pos: 105.0, sd3pos: 108.8 },
  { month: 39, sd3neg: 86.5, sd2neg: 90.3, sd1neg: 94.2, median: 98.0, sd1pos: 101.8, sd2pos: 105.7, sd3pos: 109.5 },
  { month: 40, sd3neg: 87.0, sd2neg: 90.9, sd1neg: 94.7, median: 98.6, sd1pos: 102.5, sd2pos: 106.4, sd3pos: 110.3 },
  { month: 41, sd3neg: 87.5, sd2neg: 91.4, sd1neg: 95.3, median: 99.2, sd1pos: 103.2, sd2pos: 107.1, sd3pos: 111.0 },
  { month: 42, sd3neg: 88.0, sd2neg: 91.9, sd1neg: 95.9, median: 99.9, sd1pos: 103.8, sd2pos: 107.8, sd3pos: 111.7 },
  { month: 43, sd3neg: 88.4, sd2neg: 92.4, sd1neg: 96.4, median: 100.4, sd1pos: 104.5, sd2pos: 108.5, sd3pos: 112.5 },
  { month: 44, sd3neg: 88.9, sd2neg: 93.0, sd1neg: 97.0, median: 101.0, sd1pos: 105.1, sd2pos: 109.1, sd3pos: 113.2 },
  { month: 45, sd3neg: 89.4, sd2neg: 93.5, sd1neg: 97.5, median: 101.6, sd1pos: 105.7, sd2pos: 109.8, sd3pos: 113.9 },
  { month: 46, sd3neg: 89.8, sd2neg: 94.0, sd1neg: 98.1, median: 102.2, sd1pos: 106.3, sd2pos: 110.4, sd3pos: 114.6 },
  { month: 47, sd3neg: 90.3, sd2neg: 94.4, sd1neg: 98.6, median: 102.8, sd1pos: 106.9, sd2pos: 111.1, sd3pos: 115.2 },
  { month: 48, sd3neg: 90.7, sd2neg: 94.9, sd1neg: 99.1, median: 103.3, sd1pos: 107.5, sd2pos: 111.7, sd3pos: 115.9 },
  { month: 49, sd3neg: 91.2, sd2neg: 95.4, sd1neg: 99.7, median: 103.9, sd1pos: 108.1, sd2pos: 112.4, sd3pos: 116.6 },
  { month: 50, sd3neg: 91.6, sd2neg: 95.9, sd1neg: 100.2, median: 104.4, sd1pos: 108.7, sd2pos: 113.0, sd3pos: 117.3 },
  { month: 51, sd3neg: 92.1, sd2neg: 96.4, sd1neg: 100.7, median: 105.0, sd1pos: 109.3, sd2pos: 113.6, sd3pos: 117.9 },
  { month: 52, sd3neg: 92.5, sd2neg: 96.9, sd1neg: 101.2, median: 105.6, sd1pos: 109.9, sd2pos: 114.2, sd3pos: 118.6 },
  { month: 53, sd3neg: 93.0, sd2neg: 97.4, sd1neg: 101.7, median: 106.1, sd1pos: 110.5, sd2pos: 114.9, sd3pos: 119.2 },
  { month: 54, sd3neg: 93.4, sd2neg: 97.8, sd1neg: 102.3, median: 106.7, sd1pos: 111.1, sd2pos: 115.5, sd3pos: 119.9 },
  { month: 55, sd3neg: 93.9, sd2neg: 98.3, sd1neg: 102.8, median: 107.2, sd1pos: 111.7, sd2pos: 116.1, sd3pos: 120.6 },
  { month: 56, sd3neg: 94.3, sd2neg: 98.8, sd1neg: 103.3, median: 107.8, sd1pos: 112.3, sd2pos: 116.7, sd3pos: 121.2 },
  { month: 57, sd3neg: 94.7, sd2neg: 99.3, sd1neg: 103.8, median: 108.3, sd1pos: 112.8, sd2pos: 117.4, sd3pos: 121.9 },
  { month: 58, sd3neg: 95.2, sd2neg: 99.7, sd1neg: 104.3, median: 108.9, sd1pos: 113.4, sd2pos: 118.0, sd3pos: 122.6 },
  { month: 59, sd3neg: 95.6, sd2neg: 100.2, sd1neg: 104.8, median: 109.4, sd1pos: 114.0, sd2pos: 118.6, sd3pos: 123.2 },
  { month: 60, sd3neg: 96.1, sd2neg: 100.7, sd1neg: 105.3, median: 110.0, sd1pos: 114.6, sd2pos: 119.2, sd3pos: 123.9 }
];

const HAZ_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 43.6, sd2neg: 45.4, sd1neg: 47.3, median: 49.1, sd1pos: 51.0, sd2pos: 52.9, sd3pos: 54.7 },
  { month: 1, sd3neg: 47.8, sd2neg: 49.8, sd1neg: 51.7, median: 53.7, sd1pos: 55.6, sd2pos: 57.6, sd3pos: 59.5 },
  { month: 2, sd3neg: 51.0, sd2neg: 53.0, sd1neg: 55.0, median: 57.1, sd1pos: 59.1, sd2pos: 61.1, sd3pos: 63.2 },
  { month: 3, sd3neg: 53.5, sd2neg: 55.6, sd1neg: 57.7, median: 59.8, sd1pos: 61.9, sd2pos: 64.0, sd3pos: 66.1 },
  { month: 4, sd3neg: 55.6, sd2neg: 57.8, sd1neg: 59.9, median: 62.1, sd1pos: 64.3, sd2pos: 66.4, sd3pos: 68.6 },
  { month: 5, sd3neg: 57.4, sd2neg: 59.6, sd1neg: 61.8, median: 64.0, sd1pos: 66.2, sd2pos: 68.5, sd3pos: 70.7 },
  { month: 6, sd3neg: 58.9, sd2neg: 61.2, sd1neg: 63.5, median: 65.7, sd1pos: 68.0, sd2pos: 70.3, sd3pos: 72.5 },
  { month: 7, sd3neg: 60.3, sd2neg: 62.7, sd1neg: 65.0, median: 67.3, sd1pos: 69.6, sd2pos: 71.9, sd3pos: 74.2 },
  { month: 8, sd3neg: 61.7, sd2neg: 64.0, sd1neg: 66.4, median: 68.7, sd1pos: 71.1, sd2pos: 73.5, sd3pos: 75.8 },
  { month: 9, sd3neg: 62.9, sd2neg: 65.3, sd1neg: 67.7, median: 70.1, sd1pos: 72.6, sd2pos: 75.0, sd3pos: 77.4 },
  { month: 10, sd3neg: 64.1, sd2neg: 66.5, sd1neg: 69.0, median: 71.5, sd1pos: 73.9, sd2pos: 76.4, sd3pos: 78.9 },
  { month: 11, sd3neg: 65.2, sd2neg: 67.7, sd1neg: 70.3, median: 72.8, sd1pos: 75.3, sd2pos: 77.8, sd3pos: 80.3 },
  { month: 12, sd3neg: 66.3, sd2neg: 68.9, sd1neg: 71.4, median: 74.0, sd1pos: 76.6, sd2pos: 79.2, sd3pos: 81.7 },
  { month: 13, sd3neg: 67.3, sd2neg: 70.0, sd1neg: 72.6, median: 75.2, sd1pos: 77.8, sd2pos: 80.5, sd3pos: 83.1 },
  { month: 14, sd3neg: 68.3, sd2neg: 71.0, sd1neg: 73.7, median: 76.4, sd1pos: 79.1, sd2pos: 81.7, sd3pos: 84.4 },
  { month: 15, sd3neg: 69.3, sd2neg: 72.0, sd1neg: 74.8, median: 77.5, sd1pos: 80.2, sd2pos: 83.0, sd3pos: 85.7 },
  { month: 16, sd3neg: 70.2, sd2neg: 73.0, sd1neg: 75.8, median: 78.6, sd1pos: 81.4, sd2pos: 84.2, sd3pos: 87.0 },
  { month: 17, sd3neg: 71.1, sd2neg: 74.0, sd1neg: 76.8, median: 79.7, sd1pos: 82.5, sd2pos: 85.4, sd3pos: 88.2 },
  { month: 18, sd3neg: 72.0, sd2neg: 74.9, sd1neg: 77.8, median: 80.7, sd1pos: 83.6, sd2pos: 86.5, sd3pos: 89.4 },
  { month: 19, sd3neg: 72.8, sd2neg: 75.8, sd1neg: 78.8, median: 81.7, sd1pos: 84.7, sd2pos: 87.6, sd3pos: 90.6 },
  { month: 20, sd3neg: 73.7, sd2neg: 76.7, sd1neg: 79.7, median: 82.7, sd1pos: 85.7, sd2pos: 88.7, sd3pos: 91.7 },
  { month: 21, sd3neg: 74.5, sd2neg: 77.5, sd1neg: 80.6, median: 83.7, sd1pos: 86.7, sd2pos: 89.8, sd3pos: 92.9 },
  { month: 22, sd3neg: 75.2, sd2neg: 78.4, sd1neg: 81.5, median: 84.6, sd1pos: 87.7, sd2pos: 90.8, sd3pos: 94.0 },
  { month: 23, sd3neg: 76.0, sd2neg: 79.2, sd1neg: 82.3, median: 85.5, sd1pos: 88.7, sd2pos: 91.9, sd3pos: 95.0 },
  { month: 24, sd3neg: 76.7, sd2neg: 80.0, sd1neg: 83.2, median: 86.4, sd1pos: 89.6, sd2pos: 92.9, sd3pos: 96.1 },
  { month: 25, sd3neg: 76.8, sd2neg: 80.0, sd1neg: 83.3, median: 86.6, sd1pos: 89.9, sd2pos: 93.1, sd3pos: 96.4 },
  { month: 26, sd3neg: 77.5, sd2neg: 80.8, sd1neg: 84.1, median: 87.4, sd1pos: 90.8, sd2pos: 94.1, sd3pos: 97.4 },
  { month: 27, sd3neg: 78.1, sd2neg: 81.5, sd1neg: 84.9, median: 88.3, sd1pos: 91.7, sd2pos: 95.0, sd3pos: 98.4 },
  { month: 28, sd3neg: 78.8, sd2neg: 82.2, sd1neg: 85.7, median: 89.1, sd1pos: 92.5, sd2pos: 96.0, sd3pos: 99.4 },
  { month: 29, sd3neg: 79.5, sd2neg: 82.9, sd1neg: 86.4, median: 89.9, sd1pos: 93.4, sd2pos: 96.9, sd3pos: 100.3 },
  { month: 30, sd3neg: 80.1, sd2neg: 83.6, sd1neg: 87.1, median: 90.7, sd1pos: 94.2, sd2pos: 97.7, sd3pos: 101.3 },
  { month: 31, sd3neg: 80.7, sd2neg: 84.3, sd1neg: 87.9, median: 91.4, sd1pos: 95.0, sd2pos: 98.6, sd3pos: 102.2 },
  { month: 32, sd3neg: 81.3, sd2neg: 84.9, sd1neg: 88.6, median: 92.2, sd1pos: 95.8, sd2pos: 99.4, sd3pos: 103.1 },
  { month: 33, sd3neg: 81.9, sd2neg: 85.6, sd1neg: 89.3, median: 92.9, sd1pos: 96.6, sd2pos: 100.3, sd3pos: 103.9 },
  { month: 34, sd3neg: 82.5, sd2neg: 86.2, sd1neg: 89.9, median: 93.6, sd1pos: 97.4, sd2pos: 101.1, sd3pos: 104.8 },
  { month: 35, sd3neg: 83.1, sd2neg: 86.8, sd1neg: 90.6, median: 94.4, sd1pos: 98.1, sd2pos: 101.9, sd3pos: 105.6 },
  { month: 36, sd3neg: 83.6, sd2neg: 87.4, sd1neg: 91.2, median: 95.1, sd1pos: 98.9, sd2pos: 102.7, sd3pos: 106.5 },
  { month: 37, sd3neg: 84.2, sd2neg: 88.0, sd1neg: 91.9, median: 95.7, sd1pos: 99.6, sd2pos: 103.4, sd3pos: 107.3 },
  { month: 38, sd3neg: 84.7, sd2neg: 88.6, sd1neg: 92.5, median: 96.4, sd1pos: 100.3, sd2pos: 104.2, sd3pos: 108.1 },
  { month: 39, sd3neg: 85.3, sd2neg: 89.2, sd1neg: 93.1, median: 97.1, sd1pos: 101.0, sd2pos: 105.0, sd3pos: 108.9 },
  { month: 40, sd3neg: 85.8, sd2neg: 89.8, sd1neg: 93.8, median: 97.7, sd1pos: 101.7, sd2pos: 105.7, sd3pos: 109.7 },
  { month: 41, sd3neg: 86.3, sd2neg: 90.4, sd1neg: 94.4, median: 98.4, sd1pos: 102.4, sd2pos: 106.4, sd3pos: 110.5 },
  { month: 42, sd3neg: 86.8, sd2neg: 90.9, sd1neg: 95.0, median: 99.0, sd1pos: 103.1, sd2pos: 107.2, sd3pos: 111.2 },
  { month: 43, sd3neg: 87.4, sd2neg: 91.5, sd1neg: 95.6, median: 99.7, sd1pos: 103.8, sd2pos: 107.9, sd3pos: 112.0 },
  { month: 44, sd3neg: 87.9, sd2neg: 92.0, sd1neg: 96.2, median: 100.3, sd1pos: 104.5, sd2pos: 108.6, sd3pos: 112.7 },
  { month: 45, sd3neg: 88.4, sd2neg: 92.5, sd1neg: 96.7, median: 100.9, sd1pos: 105.1, sd2pos: 109.3, sd3pos: 113.5 },
  { month: 46, sd3neg: 88.9, sd2neg: 93.1, sd1neg: 97.3, median: 101.5, sd1pos: 105.8, sd2pos: 110.0, sd3pos: 114.2 },
  { month: 47, sd3neg: 89.3, sd2neg: 93.6, sd1neg: 97.9, median: 102.1, sd1pos: 106.4, sd2pos: 110.7, sd3pos: 114.9 },
  { month: 48, sd3neg: 89.8, sd2neg: 94.1, sd1neg: 98.4, median: 102.7, sd1pos: 107.0, sd2pos: 111.3, sd3pos: 115.7 },
  { month: 49, sd3neg: 90.3, sd2neg: 94.6, sd1neg: 99.0, median: 103.3, sd1pos: 107.7, sd2pos: 112.0, sd3pos: 116.4 },
  { month: 50, sd3neg: 90.7, sd2neg: 95.1, sd1neg: 99.5, median: 103.9, sd1pos: 108.3, sd2pos: 112.7, sd3pos: 117.1 },
  { month: 51, sd3neg: 91.2, sd2neg: 95.6, sd1neg: 100.1, median: 104.5, sd1pos: 108.9, sd2pos: 113.3, sd3pos: 117.7 },
  { month: 52, sd3neg: 91.7, sd2neg: 96.1, sd1neg: 100.6, median: 105.0, sd1pos: 109.5, sd2pos: 114.0, sd3pos: 118.4 },
  { month: 53, sd3neg: 92.1, sd2neg: 96.6, sd1neg: 101.1, median: 105.6, sd1pos: 110.1, sd2pos: 114.6, sd3pos: 119.1 },
  { month: 54, sd3neg: 92.6, sd2neg: 97.1, sd1neg: 101.6, median: 106.2, sd1pos: 110.7, sd2pos: 115.2, sd3pos: 119.8 },
  { month: 55, sd3neg: 93.0, sd2neg: 97.6, sd1neg: 102.2, median: 106.7, sd1pos: 111.3, sd2pos: 115.9, sd3pos: 120.4 },
  { month: 56, sd3neg: 93.4, sd2neg: 98.1, sd1neg: 102.7, median: 107.3, sd1pos: 111.9, sd2pos: 116.5, sd3pos: 121.1 },
  { month: 57, sd3neg: 93.9, sd2neg: 98.5, sd1neg: 103.2, median: 107.8, sd1pos: 112.5, sd2pos: 117.1, sd3pos: 121.8 },
  { month: 58, sd3neg: 94.3, sd2neg: 99.0, sd1neg: 103.7, median: 108.4, sd1pos: 113.0, sd2pos: 117.7, sd3pos: 122.4 },
  { month: 59, sd3neg: 94.7, sd2neg: 99.5, sd1neg: 104.2, median: 108.9, sd1pos: 113.6, sd2pos: 118.3, sd3pos: 123.1 },
  { month: 60, sd3neg: 95.2, sd2neg: 99.9, sd1neg: 104.7, median: 109.4, sd1pos: 114.2, sd2pos: 118.9, sd3pos: 123.7 }
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
  { month: 7, sd3neg: 5.9, sd2neg: 6.7, sd1neg: 7.4, median: 8.3, sd1pos: 9.2, sd2pos: 10.3, sd3pos: 11.4 },
  { month: 8, sd3neg: 6.2, sd2neg: 6.9, sd1neg: 7.7, median: 8.6, sd1pos: 9.6, sd2pos: 10.7, sd3pos: 11.9 },
  { month: 9, sd3neg: 6.4, sd2neg: 7.1, sd1neg: 8.0, median: 8.9, sd1pos: 9.9, sd2pos: 11.0, sd3pos: 12.3 },
  { month: 10, sd3neg: 6.6, sd2neg: 7.4, sd1neg: 8.2, median: 9.2, sd1pos: 10.2, sd2pos: 11.4, sd3pos: 12.7 },
  { month: 11, sd3neg: 6.8, sd2neg: 7.6, sd1neg: 8.4, median: 9.4, sd1pos: 10.5, sd2pos: 11.7, sd3pos: 13.0 },
  { month: 12, sd3neg: 6.9, sd2neg: 7.7, sd1neg: 8.6, median: 9.6, sd1pos: 10.8, sd2pos: 12.0, sd3pos: 13.3 },
  { month: 13, sd3neg: 7.1, sd2neg: 7.9, sd1neg: 8.8, median: 9.9, sd1pos: 11.0, sd2pos: 12.3, sd3pos: 13.7 },
  { month: 14, sd3neg: 7.2, sd2neg: 8.1, sd1neg: 9.0, median: 10.1, sd1pos: 11.3, sd2pos: 12.6, sd3pos: 14.0 },
  { month: 15, sd3neg: 7.4, sd2neg: 8.3, sd1neg: 9.2, median: 10.3, sd1pos: 11.5, sd2pos: 12.8, sd3pos: 14.3 },
  { month: 16, sd3neg: 7.5, sd2neg: 8.4, sd1neg: 9.4, median: 10.5, sd1pos: 11.7, sd2pos: 13.1, sd3pos: 14.6 },
  { month: 17, sd3neg: 7.7, sd2neg: 8.6, sd1neg: 9.6, median: 10.7, sd1pos: 12.0, sd2pos: 13.4, sd3pos: 14.9 },
  { month: 18, sd3neg: 7.8, sd2neg: 8.8, sd1neg: 9.8, median: 10.9, sd1pos: 12.2, sd2pos: 13.7, sd3pos: 15.3 },
  { month: 19, sd3neg: 8.0, sd2neg: 8.9, sd1neg: 10.0, median: 11.1, sd1pos: 12.5, sd2pos: 13.9, sd3pos: 15.6 },
  { month: 20, sd3neg: 8.1, sd2neg: 9.1, sd1neg: 10.1, median: 11.3, sd1pos: 12.7, sd2pos: 14.2, sd3pos: 15.9 },
  { month: 21, sd3neg: 8.2, sd2neg: 9.2, sd1neg: 10.3, median: 11.5, sd1pos: 12.9, sd2pos: 14.5, sd3pos: 16.2 },
  { month: 22, sd3neg: 8.4, sd2neg: 9.4, sd1neg: 10.5, median: 11.8, sd1pos: 13.2, sd2pos: 14.7, sd3pos: 16.5 },
  { month: 23, sd3neg: 8.5, sd2neg: 9.5, sd1neg: 10.7, median: 12.0, sd1pos: 13.4, sd2pos: 15.0, sd3pos: 16.8 },
  { month: 24, sd3neg: 8.6, sd2neg: 9.7, sd1neg: 10.8, median: 12.2, sd1pos: 13.6, sd2pos: 15.3, sd3pos: 17.1 },
  { month: 25, sd3neg: 8.8, sd2neg: 9.8, sd1neg: 11.0, median: 12.4, sd1pos: 13.9, sd2pos: 15.5, sd3pos: 17.5 },
  { month: 26, sd3neg: 8.9, sd2neg: 10.0, sd1neg: 11.2, median: 12.5, sd1pos: 14.1, sd2pos: 15.8, sd3pos: 17.8 },
  { month: 27, sd3neg: 9.0, sd2neg: 10.1, sd1neg: 11.3, median: 12.7, sd1pos: 14.3, sd2pos: 16.1, sd3pos: 18.1 },
  { month: 28, sd3neg: 9.1, sd2neg: 10.2, sd1neg: 11.5, median: 12.9, sd1pos: 14.5, sd2pos: 16.3, sd3pos: 18.4 },
  { month: 29, sd3neg: 9.2, sd2neg: 10.4, sd1neg: 11.7, median: 13.1, sd1pos: 14.8, sd2pos: 16.6, sd3pos: 18.7 },
  { month: 30, sd3neg: 9.4, sd2neg: 10.5, sd1neg: 11.8, median: 13.3, sd1pos: 15.0, sd2pos: 16.9, sd3pos: 19.0 },
  { month: 31, sd3neg: 9.5, sd2neg: 10.7, sd1neg: 12.0, median: 13.5, sd1pos: 15.2, sd2pos: 17.1, sd3pos: 19.3 },
  { month: 32, sd3neg: 9.6, sd2neg: 10.8, sd1neg: 12.1, median: 13.7, sd1pos: 15.4, sd2pos: 17.4, sd3pos: 19.6 },
  { month: 33, sd3neg: 9.7, sd2neg: 10.9, sd1neg: 12.3, median: 13.8, sd1pos: 15.6, sd2pos: 17.6, sd3pos: 19.9 },
  { month: 34, sd3neg: 9.8, sd2neg: 11.0, sd1neg: 12.4, median: 14.0, sd1pos: 15.8, sd2pos: 17.8, sd3pos: 20.2 },
  { month: 35, sd3neg: 9.9, sd2neg: 11.2, sd1neg: 12.6, median: 14.2, sd1pos: 16.0, sd2pos: 18.1, sd3pos: 20.4 },
  { month: 36, sd3neg: 10.0, sd2neg: 11.3, sd1neg: 12.7, median: 14.3, sd1pos: 16.2, sd2pos: 18.3, sd3pos: 20.7 },
  { month: 37, sd3neg: 10.1, sd2neg: 11.4, sd1neg: 12.9, median: 14.5, sd1pos: 16.4, sd2pos: 18.6, sd3pos: 21.0 },
  { month: 38, sd3neg: 10.2, sd2neg: 11.5, sd1neg: 13.0, median: 14.7, sd1pos: 16.6, sd2pos: 18.8, sd3pos: 21.3 },
  { month: 39, sd3neg: 10.3, sd2neg: 11.6, sd1neg: 13.1, median: 14.8, sd1pos: 16.8, sd2pos: 19.0, sd3pos: 21.6 },
  { month: 40, sd3neg: 10.4, sd2neg: 11.8, sd1neg: 13.3, median: 15.0, sd1pos: 17.0, sd2pos: 19.3, sd3pos: 21.9 },
  { month: 41, sd3neg: 10.5, sd2neg: 11.9, sd1neg: 13.4, median: 15.2, sd1pos: 17.2, sd2pos: 19.5, sd3pos: 22.1 },
  { month: 42, sd3neg: 10.6, sd2neg: 12.0, sd1neg: 13.6, median: 15.3, sd1pos: 17.4, sd2pos: 19.7, sd3pos: 22.4 },
  { month: 43, sd3neg: 10.7, sd2neg: 12.1, sd1neg: 13.7, median: 15.5, sd1pos: 17.6, sd2pos: 20.0, sd3pos: 22.7 },
  { month: 44, sd3neg: 10.8, sd2neg: 12.2, sd1neg: 13.8, median: 15.7, sd1pos: 17.8, sd2pos: 20.2, sd3pos: 23.0 },
  { month: 45, sd3neg: 10.9, sd2neg: 12.4, sd1neg: 14.0, median: 15.8, sd1pos: 18.0, sd2pos: 20.5, sd3pos: 23.3 },
  { month: 46, sd3neg: 11.0, sd2neg: 12.5, sd1neg: 14.1, median: 16.0, sd1pos: 18.2, sd2pos: 20.7, sd3pos: 23.6 },
  { month: 47, sd3neg: 11.1, sd2neg: 12.6, sd1neg: 14.3, median: 16.2, sd1pos: 18.4, sd2pos: 20.9, sd3pos: 23.9 },
  { month: 48, sd3neg: 11.2, sd2neg: 12.7, sd1neg: 14.4, median: 16.3, sd1pos: 18.6, sd2pos: 21.2, sd3pos: 24.2 },
  { month: 49, sd3neg: 11.3, sd2neg: 12.8, sd1neg: 14.5, median: 16.5, sd1pos: 18.8, sd2pos: 21.4, sd3pos: 24.5 },
  { month: 50, sd3neg: 11.4, sd2neg: 12.9, sd1neg: 14.7, median: 16.7, sd1pos: 19.0, sd2pos: 21.7, sd3pos: 24.8 },
  { month: 51, sd3neg: 11.5, sd2neg: 13.1, sd1neg: 14.8, median: 16.8, sd1pos: 19.2, sd2pos: 21.9, sd3pos: 25.1 },
  { month: 52, sd3neg: 11.6, sd2neg: 13.2, sd1neg: 15.0, median: 17.0, sd1pos: 19.4, sd2pos: 22.2, sd3pos: 25.4 },
  { month: 53, sd3neg: 11.7, sd2neg: 13.3, sd1neg: 15.1, median: 17.2, sd1pos: 19.6, sd2pos: 22.4, sd3pos: 25.7 },
  { month: 54, sd3neg: 11.8, sd2neg: 13.4, sd1neg: 15.2, median: 17.3, sd1pos: 19.8, sd2pos: 22.7, sd3pos: 26.0 },
  { month: 55, sd3neg: 11.9, sd2neg: 13.5, sd1neg: 15.4, median: 17.5, sd1pos: 20.0, sd2pos: 22.9, sd3pos: 26.3 },
  { month: 56, sd3neg: 12.0, sd2neg: 13.6, sd1neg: 15.5, median: 17.7, sd1pos: 20.2, sd2pos: 23.2, sd3pos: 26.6 },
  { month: 57, sd3neg: 12.1, sd2neg: 13.7, sd1neg: 15.6, median: 17.8, sd1pos: 20.4, sd2pos: 23.4, sd3pos: 26.9 },
  { month: 58, sd3neg: 12.2, sd2neg: 13.8, sd1neg: 15.8, median: 18.0, sd1pos: 20.6, sd2pos: 23.7, sd3pos: 27.2 },
  { month: 59, sd3neg: 12.3, sd2neg: 14.0, sd1neg: 15.9, median: 18.2, sd1pos: 20.8, sd2pos: 23.9, sd3pos: 27.6 },
  { month: 60, sd3neg: 12.4, sd2neg: 14.1, sd1neg: 16.0, median: 18.3, sd1pos: 21.0, sd2pos: 24.2, sd3pos: 27.9 }
];

const WAZ_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 2.0, sd2neg: 2.4, sd1neg: 2.8, median: 3.2, sd1pos: 3.7, sd2pos: 4.2, sd3pos: 4.8 },
  { month: 1, sd3neg: 2.7, sd2neg: 3.2, sd1neg: 3.6, median: 4.2, sd1pos: 4.8, sd2pos: 5.5, sd3pos: 6.2 },
  { month: 2, sd3neg: 3.4, sd2neg: 3.9, sd1neg: 4.5, median: 5.1, sd1pos: 5.8, sd2pos: 6.6, sd3pos: 7.5 },
  { month: 3, sd3neg: 4.0, sd2neg: 4.5, sd1neg: 5.2, median: 5.8, sd1pos: 6.6, sd2pos: 7.5, sd3pos: 8.5 },
  { month: 4, sd3neg: 4.4, sd2neg: 5.0, sd1neg: 5.7, median: 6.4, sd1pos: 7.3, sd2pos: 8.2, sd3pos: 9.3 },
  { month: 5, sd3neg: 4.8, sd2neg: 5.4, sd1neg: 6.1, median: 6.9, sd1pos: 7.8, sd2pos: 8.8, sd3pos: 10.0 },
  { month: 6, sd3neg: 5.1, sd2neg: 5.7, sd1neg: 6.5, median: 7.3, sd1pos: 8.2, sd2pos: 9.3, sd3pos: 10.6 },
  { month: 7, sd3neg: 5.3, sd2neg: 6.0, sd1neg: 6.8, median: 7.6, sd1pos: 8.6, sd2pos: 9.8, sd3pos: 11.1 },
  { month: 8, sd3neg: 5.6, sd2neg: 6.3, sd1neg: 7.0, median: 7.9, sd1pos: 9.0, sd2pos: 10.2, sd3pos: 11.6 },
  { month: 9, sd3neg: 5.8, sd2neg: 6.5, sd1neg: 7.3, median: 8.2, sd1pos: 9.3, sd2pos: 10.5, sd3pos: 12.0 },
  { month: 10, sd3neg: 5.9, sd2neg: 6.7, sd1neg: 7.5, median: 8.5, sd1pos: 9.6, sd2pos: 10.9, sd3pos: 12.4 },
  { month: 11, sd3neg: 6.1, sd2neg: 6.9, sd1neg: 7.7, median: 8.7, sd1pos: 9.9, sd2pos: 11.2, sd3pos: 12.8 },
  { month: 12, sd3neg: 6.3, sd2neg: 7.0, sd1neg: 7.9, median: 8.9, sd1pos: 10.1, sd2pos: 11.5, sd3pos: 13.1 },
  { month: 13, sd3neg: 6.4, sd2neg: 7.2, sd1neg: 8.1, median: 9.2, sd1pos: 10.4, sd2pos: 11.8, sd3pos: 13.5 },
  { month: 14, sd3neg: 6.6, sd2neg: 7.4, sd1neg: 8.3, median: 9.4, sd1pos: 10.6, sd2pos: 12.1, sd3pos: 13.8 },
  { month: 15, sd3neg: 6.7, sd2neg: 7.6, sd1neg: 8.5, median: 9.6, sd1pos: 10.9, sd2pos: 12.4, sd3pos: 14.1 },
  { month: 16, sd3neg: 6.9, sd2neg: 7.7, sd1neg: 8.7, median: 9.8, sd1pos: 11.1, sd2pos: 12.6, sd3pos: 14.5 },
  { month: 17, sd3neg: 7.0, sd2neg: 7.9, sd1neg: 8.9, median: 10.0, sd1pos: 11.4, sd2pos: 12.9, sd3pos: 14.8 },
  { month: 18, sd3neg: 7.2, sd2neg: 8.1, sd1neg: 9.1, median: 10.2, sd1pos: 11.6, sd2pos: 13.2, sd3pos: 15.1 },
  { month: 19, sd3neg: 7.3, sd2neg: 8.2, sd1neg: 9.2, median: 10.4, sd1pos: 11.8, sd2pos: 13.5, sd3pos: 15.4 },
  { month: 20, sd3neg: 7.5, sd2neg: 8.4, sd1neg: 9.4, median: 10.6, sd1pos: 12.1, sd2pos: 13.7, sd3pos: 15.7 },
  { month: 21, sd3neg: 7.6, sd2neg: 8.6, sd1neg: 9.6, median: 10.9, sd1pos: 12.3, sd2pos: 14.0, sd3pos: 16.0 },
  { month: 22, sd3neg: 7.8, sd2neg: 8.7, sd1neg: 9.8, median: 11.1, sd1pos: 12.5, sd2pos: 14.3, sd3pos: 16.4 },
  { month: 23, sd3neg: 7.9, sd2neg: 8.9, sd1neg: 10.0, median: 11.3, sd1pos: 12.8, sd2pos: 14.6, sd3pos: 16.7 },
  { month: 24, sd3neg: 8.1, sd2neg: 9.0, sd1neg: 10.2, median: 11.5, sd1pos: 13.0, sd2pos: 14.8, sd3pos: 17.0 },
  { month: 25, sd3neg: 8.2, sd2neg: 9.2, sd1neg: 10.3, median: 11.7, sd1pos: 13.3, sd2pos: 15.1, sd3pos: 17.3 },
  { month: 26, sd3neg: 8.4, sd2neg: 9.4, sd1neg: 10.5, median: 11.9, sd1pos: 13.5, sd2pos: 15.4, sd3pos: 17.7 },
  { month: 27, sd3neg: 8.5, sd2neg: 9.5, sd1neg: 10.7, median: 12.1, sd1pos: 13.7, sd2pos: 15.7, sd3pos: 18.0 },
  { month: 28, sd3neg: 8.6, sd2neg: 9.7, sd1neg: 10.9, median: 12.3, sd1pos: 14.0, sd2pos: 16.0, sd3pos: 18.3 },
  { month: 29, sd3neg: 8.8, sd2neg: 9.8, sd1neg: 11.1, median: 12.5, sd1pos: 14.2, sd2pos: 16.2, sd3pos: 18.7 },
  { month: 30, sd3neg: 8.9, sd2neg: 10.0, sd1neg: 11.2, median: 12.7, sd1pos: 14.4, sd2pos: 16.5, sd3pos: 19.0 },
  { month: 31, sd3neg: 9.0, sd2neg: 10.1, sd1neg: 11.4, median: 12.9, sd1pos: 14.7, sd2pos: 16.8, sd3pos: 19.3 },
  { month: 32, sd3neg: 9.1, sd2neg: 10.3, sd1neg: 11.6, median: 13.1, sd1pos: 14.9, sd2pos: 17.1, sd3pos: 19.6 },
  { month: 33, sd3neg: 9.3, sd2neg: 10.4, sd1neg: 11.7, median: 13.3, sd1pos: 15.1, sd2pos: 17.3, sd3pos: 20.0 },
  { month: 34, sd3neg: 9.4, sd2neg: 10.5, sd1neg: 11.9, median: 13.5, sd1pos: 15.4, sd2pos: 17.6, sd3pos: 20.3 },
  { month: 35, sd3neg: 9.5, sd2neg: 10.7, sd1neg: 12.0, median: 13.7, sd1pos: 15.6, sd2pos: 17.9, sd3pos: 20.6 },
  { month: 36, sd3neg: 9.6, sd2neg: 10.8, sd1neg: 12.2, median: 13.9, sd1pos: 15.8, sd2pos: 18.1, sd3pos: 20.9 },
  { month: 37, sd3neg: 9.7, sd2neg: 10.9, sd1neg: 12.4, median: 14.0, sd1pos: 16.0, sd2pos: 18.4, sd3pos: 21.3 },
  { month: 38, sd3neg: 9.8, sd2neg: 11.1, sd1neg: 12.5, median: 14.2, sd1pos: 16.3, sd2pos: 18.7, sd3pos: 21.6 },
  { month: 39, sd3neg: 9.9, sd2neg: 11.2, sd1neg: 12.7, median: 14.4, sd1pos: 16.5, sd2pos: 19.0, sd3pos: 22.0 },
  { month: 40, sd3neg: 10.1, sd2neg: 11.3, sd1neg: 12.8, median: 14.6, sd1pos: 16.7, sd2pos: 19.2, sd3pos: 22.3 },
  { month: 41, sd3neg: 10.2, sd2neg: 11.5, sd1neg: 13.0, median: 14.8, sd1pos: 16.9, sd2pos: 19.5, sd3pos: 22.7 },
  { month: 42, sd3neg: 10.3, sd2neg: 11.6, sd1neg: 13.1, median: 15.0, sd1pos: 17.2, sd2pos: 19.8, sd3pos: 23.0 },
  { month: 43, sd3neg: 10.4, sd2neg: 11.7, sd1neg: 13.3, median: 15.2, sd1pos: 17.4, sd2pos: 20.1, sd3pos: 23.4 },
  { month: 44, sd3neg: 10.5, sd2neg: 11.8, sd1neg: 13.4, median: 15.3, sd1pos: 17.6, sd2pos: 20.4, sd3pos: 23.7 },
  { month: 45, sd3neg: 10.6, sd2neg: 12.0, sd1neg: 13.6, median: 15.5, sd1pos: 17.8, sd2pos: 20.7, sd3pos: 24.1 },
  { month: 46, sd3neg: 10.7, sd2neg: 12.1, sd1neg: 13.7, median: 15.7, sd1pos: 18.1, sd2pos: 20.9, sd3pos: 24.5 },
  { month: 47, sd3neg: 10.8, sd2neg: 12.2, sd1neg: 13.9, median: 15.9, sd1pos: 18.3, sd2pos: 21.2, sd3pos: 24.8 },
  { month: 48, sd3neg: 10.9, sd2neg: 12.3, sd1neg: 14.0, median: 16.1, sd1pos: 18.5, sd2pos: 21.5, sd3pos: 25.2 },
  { month: 49, sd3neg: 11.0, sd2neg: 12.4, sd1neg: 14.2, median: 16.3, sd1pos: 18.8, sd2pos: 21.8, sd3pos: 25.5 },
  { month: 50, sd3neg: 11.1, sd2neg: 12.6, sd1neg: 14.3, median: 16.4, sd1pos: 19.0, sd2pos: 22.1, sd3pos: 25.9 },
  { month: 51, sd3neg: 11.2, sd2neg: 12.7, sd1neg: 14.5, median: 16.6, sd1pos: 19.2, sd2pos: 22.4, sd3pos: 26.3 },
  { month: 52, sd3neg: 11.3, sd2neg: 12.8, sd1neg: 14.6, median: 16.8, sd1pos: 19.4, sd2pos: 22.6, sd3pos: 26.6 },
  { month: 53, sd3neg: 11.4, sd2neg: 12.9, sd1neg: 14.8, median: 17.0, sd1pos: 19.7, sd2pos: 22.9, sd3pos: 27.0 },
  { month: 54, sd3neg: 11.5, sd2neg: 13.0, sd1neg: 14.9, median: 17.2, sd1pos: 19.9, sd2pos: 23.2, sd3pos: 27.4 },
  { month: 55, sd3neg: 11.6, sd2neg: 13.2, sd1neg: 15.1, median: 17.3, sd1pos: 20.1, sd2pos: 23.5, sd3pos: 27.7 },
  { month: 56, sd3neg: 11.7, sd2neg: 13.3, sd1neg: 15.2, median: 17.5, sd1pos: 20.3, sd2pos: 23.8, sd3pos: 28.1 },
  { month: 57, sd3neg: 11.8, sd2neg: 13.4, sd1neg: 15.3, median: 17.7, sd1pos: 20.6, sd2pos: 24.1, sd3pos: 28.5 },
  { month: 58, sd3neg: 11.9, sd2neg: 13.5, sd1neg: 15.5, median: 17.9, sd1pos: 20.8, sd2pos: 24.4, sd3pos: 28.8 },
  { month: 59, sd3neg: 12.0, sd2neg: 13.6, sd1neg: 15.6, median: 18.0, sd1pos: 21.0, sd2pos: 24.6, sd3pos: 29.2 },
  { month: 60, sd3neg: 12.1, sd2neg: 13.7, sd1neg: 15.8, median: 18.2, sd1pos: 21.2, sd2pos: 24.9, sd3pos: 29.5 }
];

// Head Circumference-for-Age (HCFA) Reference Data (0 to 60 Months)
const HCFA_BOYS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 30.7, sd2neg: 31.9, sd1neg: 33.2, median: 34.5, sd1pos: 35.7, sd2pos: 37.0, sd3pos: 38.3 },
  { month: 1, sd3neg: 33.8, sd2neg: 34.9, sd1neg: 36.1, median: 37.3, sd1pos: 38.4, sd2pos: 39.6, sd3pos: 40.8 },
  { month: 2, sd3neg: 35.6, sd2neg: 36.8, sd1neg: 38.0, median: 39.1, sd1pos: 40.3, sd2pos: 41.5, sd3pos: 42.6 },
  { month: 3, sd3neg: 37.0, sd2neg: 38.1, sd1neg: 39.3, median: 40.5, sd1pos: 41.7, sd2pos: 42.9, sd3pos: 44.1 },
  { month: 4, sd3neg: 38.0, sd2neg: 39.2, sd1neg: 40.4, median: 41.6, sd1pos: 42.8, sd2pos: 44.0, sd3pos: 45.2 },
  { month: 5, sd3neg: 38.9, sd2neg: 40.1, sd1neg: 41.4, median: 42.6, sd1pos: 43.8, sd2pos: 45.0, sd3pos: 46.2 },
  { month: 6, sd3neg: 39.7, sd2neg: 40.9, sd1neg: 42.1, median: 43.3, sd1pos: 44.6, sd2pos: 45.8, sd3pos: 47.0 },
  { month: 7, sd3neg: 40.3, sd2neg: 41.5, sd1neg: 42.7, median: 44.0, sd1pos: 45.2, sd2pos: 46.4, sd3pos: 47.7 },
  { month: 8, sd3neg: 40.8, sd2neg: 42.0, sd1neg: 43.3, median: 44.5, sd1pos: 45.8, sd2pos: 47.0, sd3pos: 48.3 },
  { month: 9, sd3neg: 41.2, sd2neg: 42.5, sd1neg: 43.7, median: 45.0, sd1pos: 46.3, sd2pos: 47.5, sd3pos: 48.8 },
  { month: 10, sd3neg: 41.6, sd2neg: 42.9, sd1neg: 44.1, median: 45.4, sd1pos: 46.7, sd2pos: 47.9, sd3pos: 49.2 },
  { month: 11, sd3neg: 41.9, sd2neg: 43.2, sd1neg: 44.5, median: 45.8, sd1pos: 47.0, sd2pos: 48.3, sd3pos: 49.6 },
  { month: 12, sd3neg: 42.2, sd2neg: 43.5, sd1neg: 44.8, median: 46.1, sd1pos: 47.4, sd2pos: 48.6, sd3pos: 49.9 },
  { month: 13, sd3neg: 42.5, sd2neg: 43.8, sd1neg: 45.0, median: 46.3, sd1pos: 47.6, sd2pos: 48.9, sd3pos: 50.2 },
  { month: 14, sd3neg: 42.7, sd2neg: 44.0, sd1neg: 45.3, median: 46.6, sd1pos: 47.9, sd2pos: 49.2, sd3pos: 50.5 },
  { month: 15, sd3neg: 42.9, sd2neg: 44.2, sd1neg: 45.5, median: 46.8, sd1pos: 48.1, sd2pos: 49.4, sd3pos: 50.7 },
  { month: 16, sd3neg: 43.1, sd2neg: 44.4, sd1neg: 45.7, median: 47.0, sd1pos: 48.3, sd2pos: 49.6, sd3pos: 51.0 },
  { month: 17, sd3neg: 43.2, sd2neg: 44.6, sd1neg: 45.9, median: 47.2, sd1pos: 48.5, sd2pos: 49.8, sd3pos: 51.2 },
  { month: 18, sd3neg: 43.4, sd2neg: 44.7, sd1neg: 46.0, median: 47.4, sd1pos: 48.7, sd2pos: 50.0, sd3pos: 51.4 },
  { month: 19, sd3neg: 43.5, sd2neg: 44.9, sd1neg: 46.2, median: 47.5, sd1pos: 48.9, sd2pos: 50.2, sd3pos: 51.5 },
  { month: 20, sd3neg: 43.7, sd2neg: 45.0, sd1neg: 46.4, median: 47.7, sd1pos: 49.0, sd2pos: 50.4, sd3pos: 51.7 },
  { month: 21, sd3neg: 43.8, sd2neg: 45.2, sd1neg: 46.5, median: 47.8, sd1pos: 49.2, sd2pos: 50.5, sd3pos: 51.9 },
  { month: 22, sd3neg: 43.9, sd2neg: 45.3, sd1neg: 46.6, median: 48.0, sd1pos: 49.3, sd2pos: 50.7, sd3pos: 52.0 },
  { month: 23, sd3neg: 44.1, sd2neg: 45.4, sd1neg: 46.8, median: 48.1, sd1pos: 49.5, sd2pos: 50.8, sd3pos: 52.2 },
  { month: 24, sd3neg: 44.2, sd2neg: 45.5, sd1neg: 46.9, median: 48.3, sd1pos: 49.6, sd2pos: 51.0, sd3pos: 52.3 },
  { month: 25, sd3neg: 44.3, sd2neg: 45.6, sd1neg: 47.0, median: 48.4, sd1pos: 49.7, sd2pos: 51.1, sd3pos: 52.5 },
  { month: 26, sd3neg: 44.4, sd2neg: 45.8, sd1neg: 47.1, median: 48.5, sd1pos: 49.9, sd2pos: 51.2, sd3pos: 52.6 },
  { month: 27, sd3neg: 44.5, sd2neg: 45.9, sd1neg: 47.2, median: 48.6, sd1pos: 50.0, sd2pos: 51.4, sd3pos: 52.7 },
  { month: 28, sd3neg: 44.6, sd2neg: 46.0, sd1neg: 47.3, median: 48.7, sd1pos: 50.1, sd2pos: 51.5, sd3pos: 52.9 },
  { month: 29, sd3neg: 44.7, sd2neg: 46.1, sd1neg: 47.4, median: 48.8, sd1pos: 50.2, sd2pos: 51.6, sd3pos: 53.0 },
  { month: 30, sd3neg: 44.8, sd2neg: 46.1, sd1neg: 47.5, median: 48.9, sd1pos: 50.3, sd2pos: 51.7, sd3pos: 53.1 },
  { month: 31, sd3neg: 44.8, sd2neg: 46.2, sd1neg: 47.6, median: 49.0, sd1pos: 50.4, sd2pos: 51.8, sd3pos: 53.2 },
  { month: 32, sd3neg: 44.9, sd2neg: 46.3, sd1neg: 47.7, median: 49.1, sd1pos: 50.5, sd2pos: 51.9, sd3pos: 53.3 },
  { month: 33, sd3neg: 45.0, sd2neg: 46.4, sd1neg: 47.8, median: 49.2, sd1pos: 50.6, sd2pos: 52.0, sd3pos: 53.4 },
  { month: 34, sd3neg: 45.1, sd2neg: 46.5, sd1neg: 47.9, median: 49.3, sd1pos: 50.7, sd2pos: 52.1, sd3pos: 53.5 },
  { month: 35, sd3neg: 45.1, sd2neg: 46.6, sd1neg: 48.0, median: 49.4, sd1pos: 50.8, sd2pos: 52.2, sd3pos: 53.6 },
  { month: 36, sd3neg: 45.2, sd2neg: 46.6, sd1neg: 48.0, median: 49.5, sd1pos: 50.9, sd2pos: 52.3, sd3pos: 53.7 },
  { month: 37, sd3neg: 45.3, sd2neg: 46.7, sd1neg: 48.1, median: 49.5, sd1pos: 51.0, sd2pos: 52.4, sd3pos: 53.8 },
  { month: 38, sd3neg: 45.3, sd2neg: 46.8, sd1neg: 48.2, median: 49.6, sd1pos: 51.0, sd2pos: 52.5, sd3pos: 53.9 },
  { month: 39, sd3neg: 45.4, sd2neg: 46.8, sd1neg: 48.2, median: 49.7, sd1pos: 51.1, sd2pos: 52.5, sd3pos: 54.0 },
  { month: 40, sd3neg: 45.4, sd2neg: 46.9, sd1neg: 48.3, median: 49.7, sd1pos: 51.2, sd2pos: 52.6, sd3pos: 54.1 },
  { month: 41, sd3neg: 45.5, sd2neg: 46.9, sd1neg: 48.4, median: 49.8, sd1pos: 51.3, sd2pos: 52.7, sd3pos: 54.1 },
  { month: 42, sd3neg: 45.5, sd2neg: 47.0, sd1neg: 48.4, median: 49.9, sd1pos: 51.3, sd2pos: 52.8, sd3pos: 54.2 },
  { month: 43, sd3neg: 45.6, sd2neg: 47.0, sd1neg: 48.5, median: 49.9, sd1pos: 51.4, sd2pos: 52.8, sd3pos: 54.3 },
  { month: 44, sd3neg: 45.6, sd2neg: 47.1, sd1neg: 48.5, median: 50.0, sd1pos: 51.4, sd2pos: 52.9, sd3pos: 54.3 },
  { month: 45, sd3neg: 45.7, sd2neg: 47.1, sd1neg: 48.6, median: 50.1, sd1pos: 51.5, sd2pos: 53.0, sd3pos: 54.4 },
  { month: 46, sd3neg: 45.7, sd2neg: 47.2, sd1neg: 48.7, median: 50.1, sd1pos: 51.6, sd2pos: 53.0, sd3pos: 54.5 },
  { month: 47, sd3neg: 45.8, sd2neg: 47.2, sd1neg: 48.7, median: 50.2, sd1pos: 51.6, sd2pos: 53.1, sd3pos: 54.5 },
  { month: 48, sd3neg: 45.8, sd2neg: 47.3, sd1neg: 48.7, median: 50.2, sd1pos: 51.7, sd2pos: 53.1, sd3pos: 54.6 },
  { month: 49, sd3neg: 45.9, sd2neg: 47.3, sd1neg: 48.8, median: 50.3, sd1pos: 51.7, sd2pos: 53.2, sd3pos: 54.7 },
  { month: 50, sd3neg: 45.9, sd2neg: 47.4, sd1neg: 48.8, median: 50.3, sd1pos: 51.8, sd2pos: 53.2, sd3pos: 54.7 },
  { month: 51, sd3neg: 45.9, sd2neg: 47.4, sd1neg: 48.9, median: 50.4, sd1pos: 51.8, sd2pos: 53.3, sd3pos: 54.8 },
  { month: 52, sd3neg: 46.0, sd2neg: 47.5, sd1neg: 48.9, median: 50.4, sd1pos: 51.9, sd2pos: 53.4, sd3pos: 54.8 },
  { month: 53, sd3neg: 46.0, sd2neg: 47.5, sd1neg: 49.0, median: 50.4, sd1pos: 51.9, sd2pos: 53.4, sd3pos: 54.9 },
  { month: 54, sd3neg: 46.1, sd2neg: 47.5, sd1neg: 49.0, median: 50.5, sd1pos: 52.0, sd2pos: 53.5, sd3pos: 54.9 },
  { month: 55, sd3neg: 46.1, sd2neg: 47.6, sd1neg: 49.1, median: 50.5, sd1pos: 52.0, sd2pos: 53.5, sd3pos: 55.0 },
  { month: 56, sd3neg: 46.1, sd2neg: 47.6, sd1neg: 49.1, median: 50.6, sd1pos: 52.1, sd2pos: 53.5, sd3pos: 55.0 },
  { month: 57, sd3neg: 46.2, sd2neg: 47.6, sd1neg: 49.1, median: 50.6, sd1pos: 52.1, sd2pos: 53.6, sd3pos: 55.1 },
  { month: 58, sd3neg: 46.2, sd2neg: 47.7, sd1neg: 49.2, median: 50.7, sd1pos: 52.1, sd2pos: 53.6, sd3pos: 55.1 },
  { month: 59, sd3neg: 46.2, sd2neg: 47.7, sd1neg: 49.2, median: 50.7, sd1pos: 52.2, sd2pos: 53.7, sd3pos: 55.2 },
  { month: 60, sd3neg: 46.3, sd2neg: 47.7, sd1neg: 49.2, median: 50.7, sd1pos: 52.2, sd2pos: 53.7, sd3pos: 55.2 }
];

const HCFA_GIRLS_MILESTONES: WHORecord[] = [
  { month: 0, sd3neg: 30.3, sd2neg: 31.5, sd1neg: 32.7, median: 33.9, sd1pos: 35.1, sd2pos: 36.2, sd3pos: 37.4 },
  { month: 1, sd3neg: 33.0, sd2neg: 34.2, sd1neg: 35.4, median: 36.5, sd1pos: 37.7, sd2pos: 38.9, sd3pos: 40.1 },
  { month: 2, sd3neg: 34.6, sd2neg: 35.8, sd1neg: 37.0, median: 38.3, sd1pos: 39.5, sd2pos: 40.7, sd3pos: 41.9 },
  { month: 3, sd3neg: 35.8, sd2neg: 37.1, sd1neg: 38.3, median: 39.5, sd1pos: 40.8, sd2pos: 42.0, sd3pos: 43.3 },
  { month: 4, sd3neg: 36.8, sd2neg: 38.1, sd1neg: 39.3, median: 40.6, sd1pos: 41.8, sd2pos: 43.1, sd3pos: 44.4 },
  { month: 5, sd3neg: 37.6, sd2neg: 38.9, sd1neg: 40.2, median: 41.5, sd1pos: 42.7, sd2pos: 44.0, sd3pos: 45.3 },
  { month: 6, sd3neg: 38.3, sd2neg: 39.6, sd1neg: 40.9, median: 42.2, sd1pos: 43.5, sd2pos: 44.8, sd3pos: 46.1 },
  { month: 7, sd3neg: 38.9, sd2neg: 40.2, sd1neg: 41.5, median: 42.8, sd1pos: 44.1, sd2pos: 45.5, sd3pos: 46.8 },
  { month: 8, sd3neg: 39.4, sd2neg: 40.7, sd1neg: 42.0, median: 43.4, sd1pos: 44.7, sd2pos: 46.0, sd3pos: 47.4 },
  { month: 9, sd3neg: 39.8, sd2neg: 41.2, sd1neg: 42.5, median: 43.8, sd1pos: 45.2, sd2pos: 46.5, sd3pos: 47.8 },
  { month: 10, sd3neg: 40.2, sd2neg: 41.5, sd1neg: 42.9, median: 44.2, sd1pos: 45.6, sd2pos: 46.9, sd3pos: 48.3 },
  { month: 11, sd3neg: 40.5, sd2neg: 41.9, sd1neg: 43.2, median: 44.6, sd1pos: 45.9, sd2pos: 47.3, sd3pos: 48.6 },
  { month: 12, sd3neg: 40.8, sd2neg: 42.2, sd1neg: 43.5, median: 44.9, sd1pos: 46.3, sd2pos: 47.6, sd3pos: 49.0 },
  { month: 13, sd3neg: 41.1, sd2neg: 42.4, sd1neg: 43.8, median: 45.2, sd1pos: 46.5, sd2pos: 47.9, sd3pos: 49.3 },
  { month: 14, sd3neg: 41.3, sd2neg: 42.7, sd1neg: 44.1, median: 45.4, sd1pos: 46.8, sd2pos: 48.2, sd3pos: 49.5 },
  { month: 15, sd3neg: 41.5, sd2neg: 42.9, sd1neg: 44.3, median: 45.7, sd1pos: 47.0, sd2pos: 48.4, sd3pos: 49.8 },
  { month: 16, sd3neg: 41.7, sd2neg: 43.1, sd1neg: 44.5, median: 45.9, sd1pos: 47.2, sd2pos: 48.6, sd3pos: 50.0 },
  { month: 17, sd3neg: 41.9, sd2neg: 43.3, sd1neg: 44.7, median: 46.1, sd1pos: 47.4, sd2pos: 48.8, sd3pos: 50.2 },
  { month: 18, sd3neg: 42.1, sd2neg: 43.5, sd1neg: 44.9, median: 46.2, sd1pos: 47.6, sd2pos: 49.0, sd3pos: 50.4 },
  { month: 19, sd3neg: 42.3, sd2neg: 43.6, sd1neg: 45.0, median: 46.4, sd1pos: 47.8, sd2pos: 49.2, sd3pos: 50.6 },
  { month: 20, sd3neg: 42.4, sd2neg: 43.8, sd1neg: 45.2, median: 46.6, sd1pos: 48.0, sd2pos: 49.4, sd3pos: 50.7 },
  { month: 21, sd3neg: 42.6, sd2neg: 44.0, sd1neg: 45.3, median: 46.7, sd1pos: 48.1, sd2pos: 49.5, sd3pos: 50.9 },
  { month: 22, sd3neg: 42.7, sd2neg: 44.1, sd1neg: 45.5, median: 46.9, sd1pos: 48.3, sd2pos: 49.7, sd3pos: 51.1 },
  { month: 23, sd3neg: 42.9, sd2neg: 44.3, sd1neg: 45.6, median: 47.0, sd1pos: 48.4, sd2pos: 49.8, sd3pos: 51.2 },
  { month: 24, sd3neg: 43.0, sd2neg: 44.4, sd1neg: 45.8, median: 47.2, sd1pos: 48.6, sd2pos: 50.0, sd3pos: 51.4 },
  { month: 25, sd3neg: 43.1, sd2neg: 44.5, sd1neg: 45.9, median: 47.3, sd1pos: 48.7, sd2pos: 50.1, sd3pos: 51.5 },
  { month: 26, sd3neg: 43.3, sd2neg: 44.7, sd1neg: 46.1, median: 47.5, sd1pos: 48.9, sd2pos: 50.3, sd3pos: 51.7 },
  { month: 27, sd3neg: 43.4, sd2neg: 44.8, sd1neg: 46.2, median: 47.6, sd1pos: 49.0, sd2pos: 50.4, sd3pos: 51.8 },
  { month: 28, sd3neg: 43.5, sd2neg: 44.9, sd1neg: 46.3, median: 47.7, sd1pos: 49.1, sd2pos: 50.5, sd3pos: 51.9 },
  { month: 29, sd3neg: 43.6, sd2neg: 45.0, sd1neg: 46.4, median: 47.8, sd1pos: 49.2, sd2pos: 50.6, sd3pos: 52.0 },
  { month: 30, sd3neg: 43.7, sd2neg: 45.1, sd1neg: 46.5, median: 47.9, sd1pos: 49.3, sd2pos: 50.7, sd3pos: 52.2 },
  { month: 31, sd3neg: 43.8, sd2neg: 45.2, sd1neg: 46.6, median: 48.0, sd1pos: 49.4, sd2pos: 50.9, sd3pos: 52.3 },
  { month: 32, sd3neg: 43.9, sd2neg: 45.3, sd1neg: 46.7, median: 48.1, sd1pos: 49.6, sd2pos: 51.0, sd3pos: 52.4 },
  { month: 33, sd3neg: 44.0, sd2neg: 45.4, sd1neg: 46.8, median: 48.2, sd1pos: 49.7, sd2pos: 51.1, sd3pos: 52.5 },
  { month: 34, sd3neg: 44.1, sd2neg: 45.5, sd1neg: 46.9, median: 48.3, sd1pos: 49.7, sd2pos: 51.2, sd3pos: 52.6 },
  { month: 35, sd3neg: 44.2, sd2neg: 45.6, sd1neg: 47.0, median: 48.4, sd1pos: 49.8, sd2pos: 51.2, sd3pos: 52.7 },
  { month: 36, sd3neg: 44.3, sd2neg: 45.7, sd1neg: 47.1, median: 48.5, sd1pos: 49.9, sd2pos: 51.3, sd3pos: 52.7 },
  { month: 37, sd3neg: 44.4, sd2neg: 45.8, sd1neg: 47.2, median: 48.6, sd1pos: 50.0, sd2pos: 51.4, sd3pos: 52.8 },
  { month: 38, sd3neg: 44.4, sd2neg: 45.8, sd1neg: 47.3, median: 48.7, sd1pos: 50.1, sd2pos: 51.5, sd3pos: 52.9 },
  { month: 39, sd3neg: 44.5, sd2neg: 45.9, sd1neg: 47.3, median: 48.7, sd1pos: 50.2, sd2pos: 51.6, sd3pos: 53.0 },
  { month: 40, sd3neg: 44.6, sd2neg: 46.0, sd1neg: 47.4, median: 48.8, sd1pos: 50.2, sd2pos: 51.7, sd3pos: 53.1 },
  { month: 41, sd3neg: 44.6, sd2neg: 46.1, sd1neg: 47.5, median: 48.9, sd1pos: 50.3, sd2pos: 51.7, sd3pos: 53.1 },
  { month: 42, sd3neg: 44.7, sd2neg: 46.1, sd1neg: 47.5, median: 49.0, sd1pos: 50.4, sd2pos: 51.8, sd3pos: 53.2 },
  { month: 43, sd3neg: 44.8, sd2neg: 46.2, sd1neg: 47.6, median: 49.0, sd1pos: 50.4, sd2pos: 51.9, sd3pos: 53.3 },
  { month: 44, sd3neg: 44.8, sd2neg: 46.3, sd1neg: 47.7, median: 49.1, sd1pos: 50.5, sd2pos: 51.9, sd3pos: 53.3 },
  { month: 45, sd3neg: 44.9, sd2neg: 46.3, sd1neg: 47.7, median: 49.2, sd1pos: 50.6, sd2pos: 52.0, sd3pos: 53.4 },
  { month: 46, sd3neg: 45.0, sd2neg: 46.4, sd1neg: 47.8, median: 49.2, sd1pos: 50.6, sd2pos: 52.1, sd3pos: 53.5 },
  { month: 47, sd3neg: 45.0, sd2neg: 46.4, sd1neg: 47.9, median: 49.3, sd1pos: 50.7, sd2pos: 52.1, sd3pos: 53.5 },
  { month: 48, sd3neg: 45.1, sd2neg: 46.5, sd1neg: 47.9, median: 49.3, sd1pos: 50.8, sd2pos: 52.2, sd3pos: 53.6 },
  { month: 49, sd3neg: 45.1, sd2neg: 46.5, sd1neg: 48.0, median: 49.4, sd1pos: 50.8, sd2pos: 52.2, sd3pos: 53.6 },
  { month: 50, sd3neg: 45.2, sd2neg: 46.6, sd1neg: 48.0, median: 49.4, sd1pos: 50.9, sd2pos: 52.3, sd3pos: 53.7 },
  { month: 51, sd3neg: 45.2, sd2neg: 46.7, sd1neg: 48.1, median: 49.5, sd1pos: 50.9, sd2pos: 52.3, sd3pos: 53.8 },
  { month: 52, sd3neg: 45.3, sd2neg: 46.7, sd1neg: 48.1, median: 49.5, sd1pos: 51.0, sd2pos: 52.4, sd3pos: 53.8 },
  { month: 53, sd3neg: 45.3, sd2neg: 46.8, sd1neg: 48.2, median: 49.6, sd1pos: 51.0, sd2pos: 52.4, sd3pos: 53.9 },
  { month: 54, sd3neg: 45.4, sd2neg: 46.8, sd1neg: 48.2, median: 49.6, sd1pos: 51.1, sd2pos: 52.5, sd3pos: 53.9 },
  { month: 55, sd3neg: 45.4, sd2neg: 46.9, sd1neg: 48.3, median: 49.7, sd1pos: 51.1, sd2pos: 52.5, sd3pos: 54.0 },
  { month: 56, sd3neg: 45.5, sd2neg: 46.9, sd1neg: 48.3, median: 49.7, sd1pos: 51.2, sd2pos: 52.6, sd3pos: 54.0 },
  { month: 57, sd3neg: 45.5, sd2neg: 46.9, sd1neg: 48.4, median: 49.8, sd1pos: 51.2, sd2pos: 52.6, sd3pos: 54.1 },
  { month: 58, sd3neg: 45.6, sd2neg: 47.0, sd1neg: 48.4, median: 49.8, sd1pos: 51.3, sd2pos: 52.7, sd3pos: 54.1 },
  { month: 59, sd3neg: 45.6, sd2neg: 47.0, sd1neg: 48.5, median: 49.9, sd1pos: 51.3, sd2pos: 52.7, sd3pos: 54.1 },
  { month: 60, sd3neg: 45.7, sd2neg: 47.1, sd1neg: 48.5, median: 49.9, sd1pos: 51.3, sd2pos: 52.8, sd3pos: 54.2 }
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
    if (targetMonth >= milestones[i].month && targetMonth <= milestones[i + 1].month) {
      m1 = milestones[i];
      m2 = milestones[i + 1];
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
export function generateWHOChartData(gender: Gender, timeRange: string = '0-24m', type: 'height' | 'weight' | 'head'): WHORecord[] {
  const data: WHORecord[] = [];

  if (timeRange === '0-6m') {
    // Generate weekly points (Weeks 0 to 13)
    for (let w = 0; w <= 13; w++) {
      const monthEquivalent = (w * 7) / 30.4375;
      data.push(getInterpolatedRecord(monthEquivalent, gender, type));
    }
    // Then add standard months 4, 5, 6
    for (let m = 4; m <= 6; m++) {
      data.push(getInterpolatedRecord(m, gender, type));
    }
  } else {
    let startMonth = 0;
    let endMonth = 24;
    
    if (timeRange === '6-24m') { startMonth = 6; endMonth = 24; }
    else if (timeRange === '24-60m') { startMonth = 24; endMonth = 60; }
    else if (timeRange === '0-60m') { startMonth = 0; endMonth = 60; }
    else if (timeRange === '0-24m') { startMonth = 0; endMonth = 24; }

    for (let m = startMonth; m <= endMonth; m++) {
      data.push(getInterpolatedRecord(m, gender, type));
    }
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
