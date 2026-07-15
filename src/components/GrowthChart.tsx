import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Measurement, Gender, WHORecord, PredictionPoint } from '../types';
import { generateWHOChartData, getInterpolatedRecord } from '../utils/whoStandards';

interface GrowthChartProps {
  gender: Gender;
  measurements: Measurement[];
  maxMonths: number; // 12, 24, or 60
  chartType: 'height' | 'weight' | 'head';
  predictions?: PredictionPoint[];
}

export default function GrowthChart({ gender, measurements, maxMonths, chartType, predictions }: GrowthChartProps) {
  const chartData = useMemo(() => {
    // 1. Generate base monthly WHO data
    const whoBase = generateWHOChartData(gender, maxMonths, chartType);

    // 2. Map child measurements to chart points
    // To make a continuous line, we can insert the child's exact decimal month measurements 
    // and compute the WHO reference values for those exact ages.
    const childPoints = measurements
      .filter((m) => m.ageMonths <= maxMonths && (chartType !== 'head' || m.headCircumference !== undefined))
      .map((m) => {
        const whoRef = getInterpolatedRecord(m.ageMonths, gender, chartType);
        return {
          ...whoRef,
          childValue: chartType === 'height' ? m.height : chartType === 'weight' ? m.weight : m.headCircumference,
          predictionValue: undefined as number | undefined,
          isChildPoint: true,
          dateLabel: new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      });

    // 3. Map predictions to chart points
    const predPoints = predictions
      ? predictions
        .filter((p) => p.age <= maxMonths)
        .map((p) => {
          const whoRef = getInterpolatedRecord(p.age, gender, chartType);
          
          let pValue: number | undefined;
          if (chartType === 'height') pValue = p.height?.value;
          else if (chartType === 'weight') pValue = p.weight?.value;
          else if (chartType === 'head') pValue = p.head_circ?.value;
          
          if (pValue === undefined) return null;

          return {
            ...whoRef,
            predictionValue: pValue,
            isPredictionPoint: true,
            dateLabel: `Prediksi Usia ${p.age} Bln`
          };
        })
        .filter(item => item !== null)
      : [];

    // Connect actual line and prediction line so they start exactly from the last measurement
    if (childPoints.length > 0 && predPoints.length > 0) {
      const lastChildPoint = childPoints[childPoints.length - 1];
      // Set predictionValue so the purple line starts exactly where the blue line ends
      lastChildPoint.predictionValue = lastChildPoint.childValue as number;
    }

    // 4. Combine both and sort by month
    const combinedMap = new Map<number, any>();
    
    whoBase.forEach(wb => combinedMap.set(wb.month, { ...wb }));
    
    childPoints.forEach(cp => {
      if (combinedMap.has(cp.month)) {
        Object.assign(combinedMap.get(cp.month), cp);
      } else {
        combinedMap.set(cp.month, { ...cp });
      }
    });

    predPoints.forEach(pp => {
      if (combinedMap.has(pp.month)) {
        Object.assign(combinedMap.get(pp.month), pp);
      } else {
        combinedMap.set(pp.month, { ...pp });
      }
    });

    const combined = Array.from(combinedMap.values());
    combined.sort((a, b) => a.month - b.month);

    return combined;
  }, [gender, measurements, maxMonths, chartType, predictions]);

  const unit = chartType === 'height' ? 'cm' : chartType === 'weight' ? 'kg' : 'cm';
  const labelText = chartType === 'height' ? 'Tinggi Badan (cm)' : chartType === 'weight' ? 'Berat Badan (kg)' : 'Lingkar Kepala (cm)';

  // Find min/max for YAxis scaling to keep the chart tight and readable
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [40, 100];
    const vals = chartData.map(d => {
      const arr = [d.sd3neg, d.sd3pos];
      if ('childValue' in d && d.childValue !== undefined) {
        arr.push(d.childValue as number);
      }
      if ('predictionValue' in d && d.predictionValue !== undefined) {
        arr.push(d.predictionValue as number);
      }
      return arr;
    }).flat();

    const min = Math.floor(Math.min(...vals) - 2);
    const max = Math.ceil(Math.max(...vals) + 2);
    return [Math.max(0, min), max];
  }, [chartData]);

  // Custom Tooltip component in Indonesian
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // Find the child point if exists, or the hover index
      const data = payload[0].payload;
      const ageLabel = data.month === Math.floor(data.month)
        ? `${data.month} Bulan`
        : `${data.month} Bulan (${data.dateLabel || ''})`;

      return (
        <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-lg text-sm max-w-[280px]">
          <p className="font-semibold text-slate-800 mb-1.5">{ageLabel}</p>
          <div className="space-y-1">
            {data.childValue !== undefined && (
              <p className="text-blue-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Si Kecil: {data.childValue} {unit}
              </p>
            )}
            {data.predictionValue !== undefined && (
              <p className="text-purple-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Prediksi AI: {Number(data.predictionValue).toFixed(1)} {unit}
              </p>
            )}
            <p className="text-slate-500 text-xs border-t border-slate-50 pt-1 mt-1">
              Referensi WHO:
            </p>
            <p className="text-emerald-600 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Median (Ideal): {data.median} {unit}
            </p>
            <p className="text-amber-600 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {chartType === 'height' ? 'Batas Normal (-2 SD):' : chartType === 'weight' ? 'Batas Kurang (-2 SD):' : 'Batas Kecil (-2 SD):'} {data.sd2neg} {unit}
            </p>
            <p className="text-red-500 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {chartType === 'height' ? 'Stunting (-3 SD):' : chartType === 'weight' ? 'Sangat Kurang (-3 SD):' : 'Sangat Kecil (-3 SD):'} {data.sd3neg} {unit}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[320px] md:h-[400px]" id="growth-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            type="number"
            domain={[0, maxMonths]}
            tickCount={maxMonths <= 12 ? 13 : maxMonths === 24 ? 9 : 11}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: 'Usia (bulan)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: labelText, angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* WHO Shaded Zones */}
          {/* Zone 3: Sangat Pendek / Kurang (< -3 SD) */}
          <Area
            type="linear"
            dataKey="sd3neg"
            fill="#fecaca"
            stroke="none"
            fillOpacity={0.4}
            legendType="none"
          />

          {/* Zone 2: Pendek / Kurang (-3 SD to -2 SD) */}
          <Area
            type="linear"
            dataKey="sd2neg"
            fill="#fef08a"
            stroke="none"
            fillOpacity={0.4}
            legendType="none"
          />

          {/* Zone 1: Normal (-2 SD to +2 SD) */}
          <Area
            type="linear"
            dataKey="sd2pos"
            fill="#bbf7d0"
            stroke="none"
            fillOpacity={0.4}
            legendType="none"
          />

          {/* Lines representing standard boundaries */}
          <Line
            type="linear"
            dataKey="sd3pos"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            name="+3 SD (Batas Atas)"
          />
          <Line
            type="linear"
            dataKey="sd2pos"
            stroke="#eab308"
            strokeWidth={1.5}
            dot={false}
            name="+2 SD"
          />
          <Line
            type="linear"
            dataKey="median"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name="Median WHO (Ideal)"
          />
          <Line
            type="linear"
            dataKey="sd2neg"
            stroke="#eab308"
            strokeWidth={1.5}
            dot={false}
            name={
              chartType === 'height'
                ? '-2 SD (Batas Stunting)'
                : chartType === 'weight'
                  ? '-2 SD (Batas Kurang)'
                  : '-2 SD (Batas Kecil)'
            }
          />
          <Line
            type="linear"
            dataKey="sd3neg"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            name={
              chartType === 'height'
                ? '-3 SD (Sangat Pendek)'
                : chartType === 'weight'
                  ? '-3 SD (Sangat Kurang)'
                  : '-3 SD (Sangat Kecil)'
            }
          />

          {/* Child's actual measurements curve */}
          <Line
            type="linear"
            dataKey="childValue"
            stroke="#0284c7"
            strokeWidth={3.5}
            dot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#0369a1' }}
            name="Pertumbuhan Si Kecil"
            connectNulls={true}
          />

          {/* AI Prediction Line */}
          {predictions && predictions.length > 0 && (
            <Line
              type="linear"
              dataKey="predictionValue"
              stroke="#a855f7"
              strokeWidth={3.5}
              dot={{ r: 5, fill: '#a855f7', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#7e22ce' }}
              name={`Prediksi AI (${chartType === 'height' ? 'Tinggi' : chartType === 'weight' ? 'Berat' : 'L. Kepala'})`}
              connectNulls={true}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
