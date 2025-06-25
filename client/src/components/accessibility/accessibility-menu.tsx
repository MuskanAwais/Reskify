import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { 
  Accessibility, 
  Eye, 
  Palette, 
  Type, 
  Volume2, 
  MousePointer,
  Focus,
  Contrast,
  ZoomIn,
  Settings
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high' | 'low';
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reduceMotion: boolean;
  screenReader: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
  highContrastMode: boolean;
  largeClickTargets: boolean;
  audioDescriptions: boolean;
}

export default function AccessibilityMenu() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : {
        fontSize: 16,
        contrast: 'normal',
        colorBlindness: 'none',
        reduceMotion: false,
        screenReader: false,
        focusIndicators: true,
        keyboardNavigation: true,
        highContrastMode: false,
        largeClickTargets: false,
        audioDescriptions: false,
      };
    }
    return {
      fontSize: 16,
      contrast: 'normal',
      colorBlindness: 'none',
      reduceMotion: false,
      screenReader: false,
      focusIndicators: true,
      keyboardNavigation: true,
      highContrastMode: false,
      largeClickTargets: false,
      audioDescriptions: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    
    // High contrast mode
    if (settings.highContrastMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Color blindness filters
    if (settings.colorBlindness !== 'none') {
      root.classList.add(`color-blind-${settings.colorBlindness}`);
    } else {
      root.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Large click targets
    if (settings.largeClickTargets) {
      root.classList.add('large-targets');
    } else {
      root.classList.remove('large-targets');
    }

    // Screen reader announcements
    if (settings.screenReader) {
      announceToScreenReader('Accessibility settings updated');
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      contrast: 'normal',
      colorBlindness: 'none',
      reduceMotion: false,
      screenReader: false,
      focusIndicators: true,
      keyboardNavigation: true,
      highContrastMode: false,
      largeClickTargets: false,
      audioDescriptions: false,
    };
    setSettings(defaultSettings);
    announceToScreenReader('Accessibility settings reset to defaults');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label="Accessibility options"
          title="Accessibility settings"
        >
          <Accessibility className="h-4 w-4" />
          <span className="sr-only">Accessibility Menu</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 max-h-96 overflow-y-auto"
        aria-label="Accessibility settings menu"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Accessibility Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Size */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size: {settings.fontSize}px
            </span>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            max={24}
            min={12}
            step={1}
            className="w-full"
            aria-label="Font size slider"
          />
        </div>

        <DropdownMenuSeparator />

        {/* Visual Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Settings
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={settings.highContrastMode}
              onCheckedChange={(checked) => updateSetting('highContrastMode', checked)}
            >
              <Contrast className="h-4 w-4 mr-2" />
              High Contrast Mode
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
            >
              Reduce Motion
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Color Blindness Support</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => updateSetting('colorBlindness', 'none')}
              className={settings.colorBlindness === 'none' ? 'bg-accent' : ''}
            >
              Normal Vision
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateSetting('colorBlindness', 'protanopia')}
              className={settings.colorBlindness === 'protanopia' ? 'bg-accent' : ''}
            >
              Protanopia (Red-blind)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateSetting('colorBlindness', 'deuteranopia')}
              className={settings.colorBlindness === 'deuteranopia' ? 'bg-accent' : ''}
            >
              Deuteranopia (Green-blind)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateSetting('colorBlindness', 'tritanopia')}
              className={settings.colorBlindness === 'tritanopia' ? 'bg-accent' : ''}
            >
              Tritanopia (Blue-blind)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Navigation Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Navigation
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
            >
              <Focus className="h-4 w-4 mr-2" />
              Enhanced Focus Indicators
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
            >
              Keyboard Navigation
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={settings.largeClickTargets}
              onCheckedChange={(checked) => updateSetting('largeClickTargets', checked)}
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Large Click Targets
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Screen Reader Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Screen Reader
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={settings.screenReader}
              onCheckedChange={(checked) => updateSetting('screenReader', checked)}
            >
              Enhanced Announcements
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={settings.audioDescriptions}
              onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
            >
              Audio Descriptions
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Reset Button */}
        <DropdownMenuItem onClick={resetToDefaults} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Reset to Defaults
        </DropdownMenuItem>

        {/* Keyboard Shortcuts Info */}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Keyboard Shortcuts:</div>
          <div>Tab: Navigate • Enter: Activate</div>
          <div>Esc: Close menus • ?: Help</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}