import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

interface AddressSuggestion {
  text: string;
  placeId: string;
}

export default function AustralianAddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing Australian address...",
  required = false,
  className = "",
  id = "address-input"
}: AddressAutocompleteProps) {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Free Australian address lookup using OpenStreetMap Nominatim (no API keys required)
  const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
    if (query.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + ' Australia')}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=8&` +
        `countrycodes=au&` +
        `bounded=1`
      );

      if (response.ok) {
        const data = await response.json();
        
        return data
          .filter((item: any) => 
            item.display_name && 
            item.display_name.includes('Australia') &&
            (item.type === 'house' || 
             item.type === 'building' || 
             item.type === 'residential' ||
             item.class === 'place' ||
             (item.address && (item.address.house_number || item.address.road)))
          )
          .map((item: any, index: number) => ({
            text: item.display_name.replace(', Australia', '').trim(),
            placeId: `osm-${item.place_id || index}`
          }))
          .slice(0, 5);
      }

      return [];
    } catch (error) {
      console.warn('Address search error:', error);
      return [];
    }
  };

  // Manual address validation for Australian addresses
  const validateManualAddress = (address: string): boolean => {
    const addressPattern = /^\d+\s+[A-Za-z\s]+(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Crescent|Cres|Circuit|Cct|Way|Highway|Hwy|Terrace|Tce|Close|Cl|Boulevard|Blvd|Parade|Pde)\s*,?\s*[A-Za-z\s]+\s*,?\s*(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s*\d{4}$/i;
    return addressPattern.test(address.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Check manual entry validation
    if (newValue.length > 15 && validateManualAddress(newValue)) {
      setIsValidated(true);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }
    
    setIsValidated(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (newValue.length >= 3) {
        setIsLoading(true);
        const results = await searchAddresses(newValue);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.text);
    setIsValidated(true);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        className={`pr-10 ${className} ${isValidated ? 'border-green-500' : ''}`}
      />
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : isValidated ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <MapPin className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Address Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.placeId}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{suggestion.text}</span>
              </div>
            </div>
          ))}
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
            Powered by OpenStreetMap (Free Service)
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-1">
        {isValidated 
          ? "✓ Australian address confirmed" 
          : "Type 3+ characters to see address suggestions"
        }
      </p>
    </div>
  );
}