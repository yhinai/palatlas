import React, { useState } from 'react';
import { Card } from './ui/card';

const SearchBar = ({ map, onCitySearch, onSearchStart }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    // Notify parent that search is starting
    if (onSearchStart) {
      onSearchStart();
    }

    try {
      // Use the actual Mapbox access token from environment or a working one
      const accessToken = 'pk.eyJ1IjoiZ203MTciLCJhIjoiY21kY3k1amNtMDJkdjJqc2M4cTdkZnJ3ZyJ9.aOfW29U47FH0vS9X8lfxLQ';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=1&types=place`;
      
      console.log('[SearchBar] Searching for:', query);
      console.log('[SearchBar] URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('[SearchBar] Response:', data);
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const { center, place_name, text } = feature;
        
        // Extract city and country code more robustly
        let cityName = text;
        let countryCode = 'US';
        
        // Try to get country code from context
        if (feature.context) {
          for (const ctx of feature.context) {
            if (ctx.id.startsWith('country')) {
              countryCode = ctx.short_code?.toUpperCase() || countryCode;
              break;
            }
          }
        }
        
        // For places without context, try to extract from place_name
        if (countryCode === 'US' && place_name) {
          const parts = place_name.split(', ');
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            // Common country codes
            const countryMap = {
              'United Kingdom': 'GB',
              'UK': 'GB',
              'England': 'GB',
              'Scotland': 'GB',
              'Wales': 'GB',
              'Northern Ireland': 'GB',
              'United States': 'US',
              'USA': 'US',
              'Canada': 'CA',
              'Australia': 'AU',
              'Germany': 'DE',
              'France': 'FR',
              'Spain': 'ES',
              'Italy': 'IT',
              'Japan': 'JP',
              'China': 'CN',
              'India': 'IN',
              'Brazil': 'BR',
              'Mexico': 'MX',
              'Argentina': 'AR',
              'South Africa': 'ZA',
              'Nigeria': 'NG',
              'Egypt': 'EG',
              'Morocco': 'MA',
              'Kenya': 'KE',
              'Ghana': 'GH',
              'Ethiopia': 'ET',
              'Tanzania': 'TZ',
              'Uganda': 'UG',
              'Rwanda': 'RW',
              'Burundi': 'BI',
              'Somalia': 'SO',
              'Djibouti': 'DJ',
              'Eritrea': 'ER',
              'Sudan': 'SD',
              'South Sudan': 'SS',
              'Central African Republic': 'CF',
              'Chad': 'TD',
              'Cameroon': 'CM',
              'Equatorial Guinea': 'GQ',
              'Gabon': 'GA',
              'Republic of the Congo': 'CG',
              'Democratic Republic of the Congo': 'CD',
              'Angola': 'AO',
              'Zambia': 'ZM',
              'Malawi': 'MW',
              'Mozambique': 'MZ',
              'Zimbabwe': 'ZW',
              'Botswana': 'BW',
              'Namibia': 'NA',
              'Lesotho': 'LS',
              'Eswatini': 'SZ',
              'Madagascar': 'MG',
              'Mauritius': 'MU',
              'Seychelles': 'SC',
              'Comoros': 'KM',
              'Mayotte': 'YT',
              'Réunion': 'RE',
              'Saint Helena': 'SH',
              'Ascension Island': 'AC',
              'Tristan da Cunha': 'TA',
              'Falkland Islands': 'FK',
              'South Georgia': 'GS',
              'French Southern Territories': 'TF',
              'British Indian Ocean Territory': 'IO',
              'Antarctica': 'AQ'
            };
            if (countryMap[lastPart]) {
              countryCode = countryMap[lastPart];
            }
          }
        }
        
        console.log('[SearchBar] Found location:', cityName, countryCode, center);
        
        // Call the onCitySearch callback
        if (onCitySearch) {
          onCitySearch(cityName, countryCode, center);
        }
      } else {
        console.log('[SearchBar] No results found for:', query);
        alert('No results found for this search. Please try a different city name.');
      }
    } catch (error) {
      console.error('[SearchBar] Geocoding error:', error);
      alert('Search failed. Please try again.');
    }
  };

  return (
    <Card className="w-[600px] max-w-[92vw] border border-border/80 bg-white/70 backdrop-blur-md">
      <div className="flex items-center gap-2 p-3">
        <input
          type="text"
          placeholder="Search for a city..."
          className="flex-1 bg-transparent placeholder-slate-500 text-slate-900 text-base focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          aria-label="search"
          onClick={handleSearch}
          className="inline-flex items-center justify-center rounded-full bg-cyan-400/90 hover:bg-cyan-400 text-cyan-950 h-10 w-10 shadow-sm transition-transform active:translate-y-px"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 4.243 11.93l3.788 3.789a.75.75 0 1 0 1.06-1.06l-3.788-3.79A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </Card>
  );
};

export default SearchBar; 