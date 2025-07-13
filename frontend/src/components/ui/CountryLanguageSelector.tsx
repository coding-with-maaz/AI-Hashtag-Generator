import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import countryByLanguages from "./country-by-languages.json";

// Build country and language lists from the JSON
const countries = countryByLanguages.map((entry) => ({ name: entry.country }));
const allLanguages = Array.from(
  new Set(countryByLanguages.flatMap((entry) => entry.languages))
).sort();

interface CountryLanguageSelectorProps {
  country: string;
  language: string;
  onCountryChange: (code: string) => void;
  onLanguageChange: (code: string) => void;
  disabled?: boolean;
}

export function CountryLanguageSelector({
  country,
  language,
  onCountryChange,
  onLanguageChange,
  disabled,
}: CountryLanguageSelectorProps) {
  // Search state for country and language
  const [countrySearch, setCountrySearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  // Optionally filter languages by selected country
  const filteredLanguages = useMemo(() => {
    let langs = allLanguages;
    if (country) {
      const found = countryByLanguages.find((c) => c.country === country);
      if (found) langs = found.languages;
    }
    if (languageSearch.trim()) {
      langs = langs.filter((l) => l.toLowerCase().includes(languageSearch.trim().toLowerCase()));
    }
    return langs;
  }, [country, languageSearch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(countrySearch.trim().toLowerCase()));
  }, [countrySearch]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={onLanguageChange}
          disabled={disabled}
        >
          <SelectTrigger id="language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1">
              <input
                type="text"
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Search language..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                autoFocus={false}
              />
            </div>
            {filteredLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country/Region</Label>
        <Select
          value={country}
          onValueChange={onCountryChange}
          disabled={disabled}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1">
              <input
                type="text"
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                autoFocus={false}
              />
            </div>
            {filteredCountries.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 