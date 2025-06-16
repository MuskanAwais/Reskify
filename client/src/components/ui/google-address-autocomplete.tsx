import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle } from "lucide-react";

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing address...",
  required = false,
  className = "",
  id = "address-input"
}: GoogleAddressAutocompleteProps) {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initializeAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'AU' }, // Restrict to Australia
            fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (place && place.formatted_address) {
            onChange(place.formatted_address);
            setIsValidated(true);
          } else {
            setIsValidated(false);
          }
        });
      }
    };

    // Load Google Places API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

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