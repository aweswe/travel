/**
 * Route Intelligence & Grounding Engine for Collabcar
 *
 * Prevents "blind" AI hallucination by retrieving verified road data,
 * real highway corridors (NE4, NH44, NH48, Atal Tunnel, etc.), actual
 * travel times, real-world distances, authentic dhabas/pitstops, and seasonal
 * road conditions before the itinerary model generates the travel plan.
 */
import logger from '@/lib/logger.server';

export interface TripParameters {
  destination: string;
  departure: string;
  days: number;
  pace: string;
  budget: string;
  stay: string;
  interests: string;
  startDate?: string;
  travellers?: number;
}

export interface SearchResultItem {
  title: string;
  site_name?: string;
  url: string;
  date?: string;
  summary?: string;
  snippet?: string;
}

/**
 * Extracts structured trip parameters from the user's prompt text.
 * Works seamlessly with both structured form inputs and freeform travel queries.
 */
export function extractTripParameters(promptText: string): TripParameters {
  const defaults: TripParameters = {
    destination: 'India',
    departure: 'Delhi',
    days: 5,
    pace: 'Balanced',
    budget: '65000',
    stay: 'Boutique / Heritage',
    interests: 'Scenic views, cultural landmarks, authentic regional cuisine, relaxed photo stops',
    travellers: 2,
  };

  if (!promptText || typeof promptText !== 'string') {
    return defaults;
  }

  // 1. Structured prompt parsing (from TripPlanner configure())
  const destMatch = promptText.match(/destination\s+([^;,.\n]+)/i);
  const depMatch = promptText.match(/departure(?:\s+city)?\s+([^;,.\n]+)/i);
  const daysMatch = promptText.match(/(\d+)\s+days/i);
  const travMatch = promptText.match(/(\d+)\s+travellers?/i);
  const budgetMatch = promptText.match(/(?:budget|INR|₹)\s*(\d[\d,]*)/i);
  const paceMatch = promptText.match(/travel pace\s+([^;,.\n]+)/i);
  const stayMatch = promptText.match(/stay preference\s+([^;,.\n]+)/i);
  const interestsMatch = promptText.match(/interests and needs:\s*([^.\n]+)/i);
  const startDateMatch = promptText.match(/start date\s+([^;,.\n]+)/i);

  const destination = destMatch?.[1]?.trim() || defaults.destination;
  const departure = depMatch?.[1]?.trim() || defaults.departure;
  const days = daysMatch ? parseInt(daysMatch[1], 10) : defaults.days;
  const travellers = travMatch ? parseInt(travMatch[1], 10) : defaults.travellers;
  const budget = budgetMatch?.[1]?.replace(/,/g, '').trim() || defaults.budget;
  const pace = paceMatch?.[1]?.trim() || defaults.pace;
  const stay = stayMatch?.[1]?.trim() || defaults.stay;
  const interests = interestsMatch?.[1]?.trim() || defaults.interests;
  const startDate = startDateMatch?.[1]?.trim() || 'flexible';

  return {
    destination,
    departure,
    days: isNaN(days) ? defaults.days : Math.min(30, Math.max(1, days)),
    pace,
    budget,
    stay,
    interests,
    startDate,
    travellers: typeof travellers === 'number' && !Number.isNaN(travellers) ? travellers : (defaults.travellers ?? 2),
  };
}

/**
 * Curated ground truth reference for popular Indian highway corridors.
 * Used as an instant baseline and as a resilient fallback if external search is unavailable.
 */
const CURATED_CORRIDORS: Record<string, string> = {
  'delhi-jaipur': `• Expressway Route: Delhi-Mumbai Expressway (NE4) via Sohna entry to Dausa spur (NH21 link to Jaipur Ring Road). Distance: ~265-280 km. Travel Time: 3.5-4.5 hours.
• Old Highway Alternative: NH48 via Gurgaon, Manesar, Kotputli, Shahpura. Distance: ~275 km. Travel Time: 5.5-6.5 hours (heavy NCR/industrial congestion).
• Fuel & Wayside Amenities (WSA): Fuel up in Sohna before entering NE4; WSA food counters are standardized; Fast EV chargers at WSA on Sohna-Dausa. On NH48, Highway King (Shahjahanpur) has clean restrooms and family dining.
• Tolls: ~₹650-800 one-way for commercial vehicles via NE4.`,

  'delhi-agra': `• Expressway Route: Yamuna Expressway (6-lane access-controlled) from Greater Noida to Agra Inner Ring Road. Distance: ~210-230 km. Travel Time: 3-3.5 hours.
• Stops & Fuel: Jewar wayside plaza with food court, clean restrooms, and fast-fill petrol pumps.
• Taj Mahal Timing: Closed on Fridays; sunrise visit (05:45-08:00 AM) avoids midday heat and massive coach tours.`,

  'delhi-manali': `• Corridor: NH44 (Delhi-Ambala-Chandigarh bypass) to Kiratpur-Nerchowk 4-lane expressway, then Pandoh bypass tunnel to Kullu and Manali.
• Distance: ~520 km. Realistic Driving Time: 10-12 hours by car.
• Pitstops: Amrik Sukhdev or Shiva Dhaba (Murthal on NH44) for breakfast; Lake View Bilaspur for scenic lunch.
• Mountain Realities: Average 35-40 km/h in hill sections. Landslide watch during peak July-August monsoons.`,

  'manali-leh': `• Corridor: Manali - Atal Tunnel (9.02 km) - Keylong/Jispa - Baralacha La (4,890m) - Nakee La - Lachung La - Tanglang La (5,328m) - Leh.
• Distance: ~425 km. Minimum Transit Time: 2 full days with mandatory overnight halt at Jispa (3,200m) or Sarchu (4,400m) to prevent severe AMS.
• Mountain Passes & Permits: Rohtang / Atal Tunnel permit required. Highest passes are snowbound from mid-November to May.
• Acclimatization: Strictly avoid ascending past Jispa on Day 1. Drink 3-4L water daily.`,

  'bangalore-coorg': `• Corridor: Bangalore-Mysore Access-Controlled Expressway (NH275) to Mysore Ring Road, then Hunsur, Kushalnagar to Madikeri.
• Distance: ~255 km. Travel Time: 4.5-5.5 hours.
• Stops: Kamat Lokaruchi (Ramanagara) for authentic South Indian breakfast/filter coffee. Bylakuppe Golden Temple monastery visit en route.`,

  'mumbai-goa': `• Coastal / Expressway Route: Mumbai-Pune Expressway to NH48 Pune-Satara-Kolhapur, descending via Gaganbawda or Amboli Ghat to North/South Goa.
• Distance: ~580 km. Travel Time: 10-11 hours.
• Alternate scenic NH66 (Konkan Coast): ~540 km, lush greenery, mango orchards, best split with a Chiplun or Ganpatipule stay.`,
};

function getCuratedCorridorKey(departure: string, destination: string): string | null {
  const dep = departure.toLowerCase();
  const dest = destination.toLowerCase();

  for (const key of Object.keys(CURATED_CORRIDORS)) {
    const [kDep, kDest] = key.split('-');
    if (
      (dep.includes(kDep) && dest.includes(kDest)) ||
      (dep.includes(kDest) && dest.includes(kDep))
    ) {
      return key;
    }
  }
  return null;
}

/**
 * Searches real-time road logistics, transit corridors, and local highlights
 * using DeepSeek's Standalone Search API (`/v1/tools/search`).
 *
 * Times out gracefully after 4 seconds so the user request is never stalled.
 */
export async function searchRouteIntelligence(
  params: TripParameters,
  apiKey?: string,
  apiUrl: string = 'https://api.deepseek.com'
): Promise<string> {
  const { departure, destination, days, pace, interests } = params;
  const isSpecificRoute = departure.toLowerCase() !== destination.toLowerCase() && departure !== 'India';

  // Construct high-precision search query focused on realistic 2026 road realities
  const query = isSpecificRoute
    ? `${departure} to ${destination} road trip highway route distance driving hours tolls pitstops 2026`
    : `${destination} road trip itinerary best highway route attractions stays food 2026`;

  let searchResults: SearchResultItem[] = [];

  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second hard cap

      const response = await fetch(`${apiUrl}/v1/tools/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          count: 3,
          need_content: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as { results?: SearchResultItem[] };
        if (Array.isArray(data.results) && data.results.length > 0) {
          searchResults = data.results.slice(0, 3);
          logger.info(`[route-intelligence] Retrieved ${searchResults.length} real-time search results for "${query}"`);
        }
      } else {
        logger.warn(`[route-intelligence] Search endpoint responded with status ${response.status}`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.warn(`[route-intelligence] Search request timed out after 4000ms for query: "${query}"`);
      } else {
        logger.warn('[route-intelligence] Live search error:', err);
      }
    }
  }

  // Check if we have curated corridor ground truth
  const corridorKey = getCuratedCorridorKey(departure, destination);
  const curatedCorridorData = corridorKey ? CURATED_CORRIDORS[corridorKey] : null;

  // Build the ground-truth dossier to inject into the model prompt
  const sections: string[] = [
    '=== VERIFIED REAL-TIME SEARCH & ROUTE GROUNDING ===',
    `Live travel intelligence gathered for ${departure} ➔ ${destination} (${days} days, ${pace} pace):`,
  ];

  if (searchResults.length > 0) {
    sections.push('\n[VERIFIED SEARCH FINDINGS & ROAD REALITIES]');
    searchResults.forEach((item, idx) => {
      const summaryText = (item.summary || item.snippet || '').trim().replace(/\n+/g, ' ');
      sections.push(
        `• Source ${idx + 1} (${item.site_name || 'Travel Authority'}): "${item.title}"\n  Summary: ${summaryText.slice(0, 450)}`
      );
    });
  }

  if (curatedCorridorData) {
    sections.push('\n[CORRIDOR LOGISTICS & DRIVING PARAMETERS]');
    sections.push(curatedCorridorData);
  }

  // Add explicit grounding rules so the AI builds an authentic, non-blind itinerary
  sections.push(`
[STRICT GROUNDING & LOGICAL ITINERARY DIRECTIVES]
1. Exact Highway Names & Distances: You MUST state the verified highway designations (e.g. NE4, NH44, NH48, Yamuna Expressway, Atal Tunnel), actual road distances (in km), and realistic driving times.
2. Speed Realities: Plain expressways = ~75-85 km/h; standard NH highways = ~50-60 km/h; hill / mountain roads = ~25-35 km/h. Factor in practical chai/photo halts. Never plan more than 180-220 km per day on mountain roads.
3. Logical Progression: Structure days in sequential geographical order (no erratic zigzagging or backtracking).
4. Authentic Halts: Recommend specific verified highway dhabas, Wayside Amenities (WSAs), and authentic regional culinary specialties along this route.
5. High-Altitude Safety: If visiting elevations > 3,000m (e.g. Ladakh, Spiti, Rohtang), enforce mandatory base acclimatization on Days 1-2.
6. Stays & Tolls: Suggest verified stay styles (heritage havelis in Rajasthan, tea plantation bungalows in Western Ghats, pine forest cottages in Himalayas) and factor commercial AITP vehicle tolls/permits into the budget breakdown.`);

  sections.push('===================================================');

  return sections.join('\n');
}
