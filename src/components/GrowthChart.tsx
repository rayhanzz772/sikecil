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
  timeRange: string;
  chartType: 'height' | 'weight' | 'head';
  predictions?: PredictionPoint[];
}

export default function GrowthChart({ gender, measurements, timeRange, chartType, predictions }: GrowthChartProps) {

  const { startMonth, endMonth } = useMemo(() => {
    if (timeRange === '0-6m') return { startMonth: 0, endMonth: 6 };
    if (timeRange === '6-24m') return { startMonth: 6, endMonth: 24 };
    if (timeRange === '24-60m') return { startMonth: 24, endMonth: 60 };
    if (timeRange === '0-60m') return { startMonth: 0, endMonth: 60 };
    return { startMonth: 0, endMonth: 24 }; // default 0-24m
  }, [timeRange]);

  const chartData = useMemo(() => {
    // 1. Generate base monthly WHO data
    const whoBase = generateWHOChartData(gender, timeRange, chartType);

    // 2. Map child measurements to chart points
    // To make a continuous line, we can insert the child's exact decimal month measurements 
    // and compute the WHO reference values for those exact ages.
    const childPoints = measurements
      .filter((m) => m.ageMonths >= startMonth && m.ageMonths <= endMonth && (chartType !== 'head' || m.headCircumference !== undefined))
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

    const sortedChildPoints = [...childPoints].sort((a, b) => a.month - b.month);
    const lastMeasurementAge = sortedChildPoints.length > 0 ? sortedChildPoints[sortedChildPoints.length - 1].month : -1;

    // 3. Map predictions to chart points
    const predPoints = predictions
      ? predictions
        .filter((p) => p.age >= startMonth && p.age <= endMonth && p.age > lastMeasurementAge)
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
    if (sortedChildPoints.length > 0 && predPoints.length > 0) {
      const lastChildPoint = sortedChildPoints[sortedChildPoints.length - 1];
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
  }, [gender, measurements, timeRange, startMonth, endMonth, chartType, predictions]);

  const unit = chartType === 'height' ? 'cm' : chartType === 'weight' ? 'kg' : 'cm';
  const labelText = chartType === 'height' ? 'Tinggi Badan (cm)' : chartType === 'weight' ? 'Berat Badan (kg)' : 'Lingkar Kepala (cm)';

  const isGirl = gender === 'P' || gender === 'Perempuan';
  const childLineColor = isGirl ? '#ec4899' : '#0284c7';
  const childActiveDotColor = isGirl ? '#be185d' : '#0369a1';

  const xTicks = useMemo(() => {
    if (timeRange === '0-6m') {
      const t = [];
      for (let w = 0; w <= 13; w++) t.push((w * 7) / 30.4375);
      t.push(4, 5, 6);
      return t;
    }
    return undefined; // auto
  }, [timeRange]);

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
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#d8dde3ff" />
          <XAxis
            dataKey="month"
            type="number"
            domain={[startMonth, endMonth]}
            ticks={xTicks}
            tickCount={timeRange === '0-6m' ? undefined : (endMonth - startMonth <= 12 ? 13 : endMonth - startMonth === 24 ? 9 : 11)}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickFormatter={(val) => timeRange === '0-6m' && val <= 3.0 ? `W${Math.round((val * 30.4375) / 7)}` : Math.round(val).toString()}
            label={{ value: 'Usia', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
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
            stroke={childLineColor}
            strokeWidth={3.5}
            dot={{ r: 5, fill: childLineColor, stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: childActiveDotColor }}
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
