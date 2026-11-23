export interface DayPlan {
  dayNumber: number;
  title: string;
  transit?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  stay?: string;
  otherBullets: string[];
}

export interface BudgetCategory {
  category: string;
  cost: string;
  details: string;
}

export interface ParsedItinerary {
  raw: string;
  title: string;
  overview: {
    destination?: string;
    route?: string;
    season?: string;
    pace?: string;
    vehicle?: string;
    rawLines: string[];
  };
  days: DayPlan[];
  budget: BudgetCategory[];
  tips: string[];
  closingNote?: string;
  destinationTheme: 'mountains' | 'heritage' | 'coastal' | 'wildlife' | 'default';
}

export function detectDestinationTheme(destination: string, content: string): 'mountains' | 'heritage' | 'coastal' | 'wildlife' | 'default' {
  const text = (destination + ' ' + content).toLowerCase();
  
  if (
    text.includes('ladakh') ||
    text.includes('spiti') ||
    text.includes('kashmir') ||
    text.includes('leh') ||
    text.includes('manali') ||
    text.includes('shimla') ||
    text.includes('dharamshala') ||
    text.includes('rishikesh') ||
    text.includes('himachal') ||
    text.includes('uttarakhand') ||
    text.includes('sikkim') ||
    text.includes('himalaya')
  ) {
    return 'mountains';
  }

  if (
    text.includes('rajasthan') ||
    text.includes('jaipur') ||
    text.includes('jodhpur') ||
    text.includes('udaipur') ||
    text.includes('jaisalmer') ||
    text.includes('agra') ||
    text.includes('varanasi') ||
    text.includes('delhi') ||
    text.includes('golden triangle') ||
    text.includes('palace') ||
    text.includes('fort')
  ) {
    return 'heritage';
  }

  if (
    text.includes('kerala') ||
    text.includes('munnar') ||
    text.includes('alleppey') ||
    text.includes('kochi') ||
    text.includes('goa') ||
    text.includes('gokarna') ||
    text.includes('pondicherry') ||
    text.includes('andaman') ||
    text.includes('beach') ||
    text.includes('backwater')
  ) {
    return 'coastal';
  }

  if (
    text.includes('kaziranga') ||
    text.includes('jim corbett') ||
    text.includes('ranthambore') ||
    text.includes('bandhavgarh') ||
    text.includes('kabini') ||
    text.includes('wildlife') ||
    text.includes('safari') ||
    text.includes('national park')
  ) {
    return 'wildlife';
  }

  return 'default';
}

export function parseItinerary(markdown: string, userDestination: string = ''): ParsedItinerary {
  const result: ParsedItinerary = {
    raw: markdown,
    title: '',
    overview: { rawLines: [] },
    days: [],
    budget: [],
    tips: [],
    destinationTheme: detectDestinationTheme(userDestination, markdown),
  };

  if (!markdown || !markdown.trim()) {
    return result;
  }

  const lines = markdown.split('\n');
  let currentSection: 'header' | 'overview' | 'days' | 'budget' | 'tips' | 'other' = 'header';
  let currentDay: DayPlan | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Title match: # Title
    if (line.startsWith('# ') && !result.title) {
      result.title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    // Section headers
    if (/^###\s+(.*(?:overview|highlights))/i.test(line)) {
      currentSection = 'overview';
      continue;
    }
    if (/^###\s+(.*(?:day-by-day|itinerary|schedule))/i.test(line)) {
      currentSection = 'days';
      continue;
    }
    if (/^###\s+(.*(?:budget|cost|breakdown|pricing))/i.test(line)) {
      if (currentDay) {
        result.days.push(currentDay);
        currentDay = null;
      }
      currentSection = 'budget';
      continue;
    }
    if (/^###\s+(.*(?:tips|advice|chauffeur|recommendation))/i.test(line)) {
      if (currentDay) {
        result.days.push(currentDay);
        currentDay = null;
      }
      currentSection = 'tips';
      continue;
    }

    // Parsing Overview
    if (currentSection === 'overview') {
      if (line.startsWith('###')) {
        // Next section
      } else if (line.startsWith('-') || line.startsWith('*')) {
        const item = line.replace(/^[-*]\s+/, '').trim();
        result.overview.rawLines.push(item);

        if (/destination/i.test(item)) {
          result.overview.destination = item.replace(/.*\*{0,2}destination\*{0,2}:?\s*/i, '');
        } else if (/route/i.test(item)) {
          result.overview.route = item.replace(/.*\*{0,2}route.*:?\s*/i, '');
        } else if (/season|weather/i.test(item)) {
          result.overview.season = item.replace(/.*\*{0,2}(?:season|weather).*:?\s*/i, '');
        } else if (/pace/i.test(item)) {
          result.overview.pace = item.replace(/.*\*{0,2}pace.*:?\s*/i, '');
        } else if (/vehicle|fleet/i.test(item)) {
          result.overview.vehicle = item.replace(/.*\*{0,2}(?:vehicle|fleet).*:?\s*/i, '');
        }
      }
      continue;
    }

    // Parsing Days
    if (currentSection === 'days') {
      const dayHeaderMatch = line.match(/^####?\s+Day\s+(\d+)[:\s–—]*(.*)/i);
      if (dayHeaderMatch) {
        if (currentDay) {
          result.days.push(currentDay);
        }
        currentDay = {
          dayNumber: parseInt(dayHeaderMatch[1], 10),
          title: dayHeaderMatch[2]?.trim() || `Day ${dayHeaderMatch[1]}`,
          otherBullets: [],
        };
        continue;
      }

      if (currentDay && (line.startsWith('-') || line.startsWith('*'))) {
        const text = line.replace(/^[-*]\s+/, '').trim();
        if (/transit|distance|drive|route/i.test(text) && !currentDay.transit) {
          currentDay.transit = text.replace(/.*\*{0,2}(?:transit|distance|route).*:?\s*/i, '');
        } else if (/morning/i.test(text) && !currentDay.morning) {
          currentDay.morning = text.replace(/.*\*{0,2}morning.*:?\s*/i, '');
        } else if (/afternoon|lunch/i.test(text) && !currentDay.afternoon) {
          currentDay.afternoon = text.replace(/.*\*{0,2}(?:afternoon|lunch).*:?\s*/i, '');
        } else if (/evening|sunset/i.test(text) && !currentDay.evening) {
          currentDay.evening = text.replace(/.*\*{0,2}(?:evening|sunset).*:?\s*/i, '');
        } else if (/stay|hotel|night/i.test(text) && !currentDay.stay) {
          currentDay.stay = text.replace(/.*\*{0,2}(?:stay|hotel|night).*:?\s*/i, '');
        } else {
          currentDay.otherBullets.push(text);
        }
        continue;
      }
    }

    // Parsing Budget Table or items
    if (currentSection === 'budget') {
      if (line.startsWith('|') && !line.includes('---')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2 && !/expense category/i.test(parts[0])) {
          result.budget.push({
            category: parts[0],
            cost: parts[1] || 'Included',
            details: parts[2] || '',
          });
        }
      } else if (line.startsWith('-') || line.startsWith('*')) {
        const text = line.replace(/^[-*]\s+/, '').trim();
        const [cat, ...rest] = text.split(':');
        result.budget.push({
          category: cat.replace(/\*\*/g, '').trim(),
          cost: rest.join(':').replace(/\*\*/g, '').trim(),
          details: '',
        });
      }
      continue;
    }

    // Parsing Tips
    if (currentSection === 'tips') {
      if (line.startsWith('-') || line.startsWith('*')) {
        const tip = line.replace(/^[-*]\s+/, '').trim();
        if (tip.length > 5) {
          result.tips.push(tip);
        }
      } else if (line.startsWith('*Note:')) {
        result.closingNote = line.replace(/^\*Note:\s*/, '').replace(/\*$/, '').trim();
      }
      continue;
    }
  }

  if (currentDay) {
    result.days.push(currentDay);
  }

  if (!result.title) {
    result.title = userDestination ? `${userDestination} Itinerary` : 'Custom India Road Journey';
  }

  return result;
}
