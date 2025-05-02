import { AgentType } from '@/lib/types'; // Assuming this might be needed later

// Types likely needed by helper functions (adjust as needed based on source components)
interface ChartData {
  date: string;
  value: number;
}

interface SnapshotData {
  timestamp: string;
  balanceInUSD?: number;
  pnl?: number;
  pnl24h?: number;
  [key: string]: unknown;
}

interface ChartDataItem extends ChartData {
  isActualData?: boolean;
  tradeCount?: number;
}

interface OptimalDataItem extends DataItem {
  timestamp: string;
  source: string;
  isActualData: boolean;
}

interface DataItem {
  date: string;
  positive?: number;
  negative?: number;
  rawPnl?: number;
  [key: string]: unknown;
}

type TimeRange = '1W' | '1M' | '3M' | 'ALL';
type DayScale = '1D' | '1W' | '1M';


// === Functions from PortfolioChart ===

/**
 * Generates an array of dates between start and end (inclusive).
 */
export const generateDatesBetween = (start: Date, end: Date): Date[] => {
  const dates = [];
  const currentDate = new Date(start);
  currentDate.setUTCHours(0, 0, 0, 0); // Normalize start date

  const endDate = new Date(end);
  endDate.setUTCHours(0, 0, 0, 0); // Normalize end date

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Processes raw portfolio history snapshots into a format suitable for the chart,
 * handling different time ranges and filling gaps.
 */
export const processPortfolioHistorySnapshots = (
    snapshots: SnapshotData[],
    timeRange: TimeRange,
    startDate: Date,
    endDate: Date
): ChartDataItem[] => {
    if (!snapshots || snapshots.length === 0) {
        return [];
    }

    // Sort snapshots chronologically
    const sortedSnapshots = [...snapshots].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Map to initial chart data format
    const portfolioData = sortedSnapshots
        .map((snapshot) => ({
            date: snapshot.timestamp, // Keep full timestamp for processing
            value: typeof snapshot.balanceInUSD === 'number' ? snapshot.balanceInUSD : 0,
            isActualData: typeof snapshot.balanceInUSD === 'number',
        }))
        .filter(item => item.isActualData); // Filter out items without valid balance


    if (portfolioData.length === 0) return [];

    // Group by day/hour based on timeRange
    const snapshotsByPeriod = new Map<string, ChartDataItem[]>();
    const isHourly = timeRange === '1W';

    portfolioData.forEach((item) => {
        const date = new Date(item.date);
        const key = isHourly
            ? date.toISOString().split(':')[0] + ':00:00.000Z' // Group by hour
            : date.toISOString().split('T')[0]; // Group by day

        if (!snapshotsByPeriod.has(key)) {
            snapshotsByPeriod.set(key, []);
        }
        snapshotsByPeriod.get(key)?.push(item);
    });

    // Select representative points for each period
    const selectedPoints: ChartDataItem[] = [];
    snapshotsByPeriod.forEach((periodSnapshots) => {
      if (periodSnapshots.length === 0) return;
        // Sort within the period
      const sortedPeriod = periodSnapshots.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      // Use the last snapshot of the period (day or hour)
      selectedPoints.push(sortedPeriod[sortedPeriod.length -1]);

      // Optional: Could add first/middle point logic here if needed later
    });

     // Sort selected points
    selectedPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // Fill gaps for the specified date range
    const completeData: ChartDataItem[] = [];
    const dateMap = new Map(selectedPoints.map(item => [
        isHourly ? new Date(item.date).toISOString().split(':')[0] + ':00:00.000Z' : new Date(item.date).toISOString().split('T')[0],
        item
    ]));

    let lastKnownValue = selectedPoints[0]?.value ?? 0; // Start with the earliest known value or 0

    const iterDate = new Date(startDate);
    while (iterDate <= endDate) {
        const key = isHourly
            ? iterDate.toISOString().split(':')[0] + ':00:00.000Z'
            : iterDate.toISOString().split('T')[0];

        if (dateMap.has(key)) {
            const item = dateMap.get(key)!;
            completeData.push(item);
            lastKnownValue = item.value; // Update last known value
        } else {
            // Add placeholder with the last known value
            completeData.push({
                date: iterDate.toISOString(),
                value: lastKnownValue,
                isActualData: false,
            });
        }

        if (isHourly) {
            iterDate.setHours(iterDate.getHours() + 1);
        } else {
            iterDate.setDate(iterDate.getDate() + 1);
        }
    }

     // Ensure the very first point matches the earliest actual data if placeholders were added before it
    if (completeData.length > 0 && portfolioData.length > 0 && !completeData[0].isActualData) {
       const firstActualIndex = completeData.findIndex(d => d.isActualData);
       if(firstActualIndex > 0) {
            const firstActualValue = completeData[firstActualIndex].value;
            for(let i = 0; i < firstActualIndex; i++) {
                completeData[i].value = firstActualValue; // Backfill start with first actual value
            }
       }
    }


    // Final sort to be sure
    completeData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return completeData;

};


// === Functions from PortfolioPnL ===

/**
 * Aggregates PnL data by the specified scale (Day, Week, Month).
 */
export const aggregatePnlDataByScale = (
  data: DataItem[],
  scale: DayScale,
): DataItem[] => {
  if (!data || data.length === 0 || scale === '1D') return data; // No aggregation needed for daily

  const aggregatedMap = new Map<string, { date: string; positive: number; negative: number; rawPnl: number }>();

  data.forEach((item) => {
    const dateStr = item.timestamp || item.date;
    if (typeof dateStr !== 'string') return; // Skip if no valid date string

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return; // Skip if date is invalid

    let key: string;

    if (scale === '1W') {
      const day = date.getUTCDay(); // 0 = Sunday, 1 = Monday
      const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
      key = monday.toISOString().split('T')[0];
    } else { // '1M'
      key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
    }

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, { date: key, positive: 0, negative: 0, rawPnl: 0 });
    }

    const agg = aggregatedMap.get(key)!;
    const pnl = item.rawPnl ?? 0; // Use rawPnl for aggregation
    agg.rawPnl += pnl;
    if (pnl > 0) agg.positive += pnl;
    if (pnl < 0) agg.negative += pnl; // Keep negative value for chart rendering logic
  });

  // Convert map to array and update positive/negative based on final rawPnl sum for the period
  return Array.from(aggregatedMap.values())
    .map(agg => ({
        ...agg,
        positive: agg.rawPnl > 0 ? agg.rawPnl : 0,
        negative: agg.rawPnl < 0 ? agg.rawPnl : 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


/**
 * Processes raw performance history snapshots to calculate daily PnL,
 * handling different data sources within snapshots.
 */
export const processPnlHistorySnapshots = (
    snapshots: SnapshotData[],
    startDate: Date,
    endDate: Date
): OptimalDataItem[] => {
     if (!snapshots || snapshots.length === 0) {
        return [];
    }
    // 1. Sort snapshots chronologically
    const sortedSnapshots = [...snapshots].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 2. Calculate day-to-day or point-to-point PnL
    const pnlDataPoints: OptimalDataItem[] = [];
    for (let i = 0; i < sortedSnapshots.length; i++) {
        const current = sortedSnapshots[i];
        const previous = i > 0 ? sortedSnapshots[i - 1] : null;

        let pnlValue = 0;
        let source = 'unknown';
        let isActual = false;

        // Method 1: Use pnl24h directly if available and valid
        if (typeof current.pnl24h === 'number' && !isNaN(current.pnl24h)) {
            pnlValue = current.pnl24h;
            source = 'pnl24h';
            isActual = true;
        }
        // Method 2: Calculate from change in 'pnl' field if available and valid for both points
        else if (
            previous &&
            typeof current.pnl === 'number' && !isNaN(current.pnl) &&
            typeof previous.pnl === 'number' && !isNaN(previous.pnl)
        ) {
            pnlValue = current.pnl - previous.pnl;
            source = 'calculated_pnl';
             isActual = true; // Mark as actual data derived from pnl field
        }
        // Method 3: Calculate from change in 'balanceInUSD' if available and valid
         else if (
            previous &&
            typeof current.balanceInUSD === 'number' && !isNaN(current.balanceInUSD) &&
            typeof previous.balanceInUSD === 'number' && !isNaN(previous.balanceInUSD)
        ) {
            pnlValue = current.balanceInUSD - previous.balanceInUSD;
            source = 'calculated_balance';
             isActual = true; // Mark as actual data derived from balance
        }


         if (isActual) { // Only add if we could derive a value
             pnlDataPoints.push({
                 date: new Date(current.timestamp).toISOString().split('T')[0],
                 timestamp: current.timestamp,
                 positive: pnlValue > 0 ? pnlValue : 0,
                 negative: pnlValue < 0 ? pnlValue : 0,
                 rawPnl: pnlValue,
                 source: source,
                 isActualData: isActual,
             });
         }
    }

     // 3. Fill Gaps (optional but good for consistency)
     const completeData: OptimalDataItem[] = [];
     const dateMap = new Map(pnlDataPoints.map(item => [new Date(item.timestamp).toISOString().split('T')[0], item]));
     const iterDate = new Date(startDate);

     while(iterDate <= endDate) {
         const dateStr = iterDate.toISOString().split('T')[0];
         if (dateMap.has(dateStr)) {
             completeData.push(dateMap.get(dateStr)!);
         } else {
             // Add placeholder for missing daily PNL data
              completeData.push({
                 date: dateStr,
                 timestamp: iterDate.toISOString(), // Use noon of the day
                 positive: 0,
                 negative: 0,
                 rawPnl: 0,
                 source: 'placeholder',
                 isActualData: false,
             });
         }
         iterDate.setDate(iterDate.getDate() + 1);
     }


    // 4. Final Sort
    completeData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return completeData;
}; 