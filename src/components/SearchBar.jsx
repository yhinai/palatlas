import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { InputBase, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 999,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 100%)',
  padding: '12px 18px',
  display: 'flex',
  alignItems: 'center',
  width: 600,
  maxWidth: '92vw',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  border: '1px solid rgba(255,255,255,0.55)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '1.05rem',
  color: '#111827',
  '::placeholder': { color: 'rgba(17,24,39,0.55)' },
  input: {
    padding: '8px 0',
  }
}));

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
    <SearchContainer elevation={0}>
      <StyledInputBase
        placeholder="Search for a city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <IconButton
        aria-label="search"
        size="large"
        sx={{
          backgroundColor: 'rgba(78, 205, 196, 0.85)',
          color: '#083344',
          boxShadow: '0 6px 16px rgba(78,205,196,0.35)',
          '&:hover': { backgroundColor: 'rgba(78, 205, 196, 1)', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' }
        }}
        onClick={handleSearch}
      >
        <SearchIcon />
      </IconButton>
    </SearchContainer>
  );
};

export default SearchBar; 