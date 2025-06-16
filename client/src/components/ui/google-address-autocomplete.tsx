import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";

interface AustralianAddressAutocompleteProps {
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
}: AustralianAddressAutocompleteProps) {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Free Australian address lookup using OpenStreetMap Nominatim
  const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
    if (query.length < 3) return [];

    try {
      // Using Nominatim (free) with Australian country restriction
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `country=Australia&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `bounded=1&` +
        `viewbox=113.338953078,-43.6345972634,153.569469029,-10.6681857235` // Australia bounding box
      );

      if (!response.ok) throw new Error('Address search failed');

      const data = await response.json();
      
      return data
        .filter((item: any) => 
          item.display_name && 
          item.display_name.includes('Australia') &&
          (item.class === 'building' || item.class === 'place' || item.type === 'house')
        )
        .map((item: any) => ({
          text: item.display_name.replace(', Australia', ''),
          placeId: item.place_id.toString()
        }))
        .slice(0, 5);
    } catch (error) {
      console.warn('Address search error:', error);
      return [];
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValidated(false);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce address search
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Reset validation when user types manually
    if (isValidated && newValue !== value) {
      setIsValidated(false);
    }
  };

  const validateAddressManually = async () => {
    if (!value.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Use Google Geocoding API to validate manually entered address
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: value,
          componentRestrictions: { country: 'AU' }
        },
        (results: any[], status: string) => {
          setIsLoading(false);
          
          if (status === 'OK' && results && results.length > 0) {
            const formattedAddress = results[0].formatted_address;
            onChange(formattedAddress);
            setIsValidated(true);
          } else {
            setIsValidated(false);
          }
        }
      );
    } catch (error) {
      setIsLoading(false);
      setIsValidated(false);
    }
  };

  // For demo purposes when Google API is not available
  const isGoogleAPIAvailable = !!import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!isGoogleAPIAvailable) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder="Enter Australian address (Google API integration pending)"
          required={required}
          className={`pr-10 ${className}`}
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <p className="text-xs text-amber-600 mt-1">
          Demo mode: Enter any Australian address. Google Places autocomplete will be enabled in production.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={validateAddressManually}
        placeholder={placeholder}
        required={required}
        className={`pr-10 ${className} ${isValidated ? 'border-green-500' : ''}`}
      />
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        ) : isValidated ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <MapPin className="h-4 w-4 text-gray-400" />
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        {isValidated 
          ? "✓ Valid Australian address confirmed" 
          : "Start typing to see address suggestions or enter complete address"
        }
      </p>
    </div>
  );
}