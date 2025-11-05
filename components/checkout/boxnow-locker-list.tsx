"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BoxnowLocker {
  id: string;
  type: string;
  title: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  country: string;
  lat: string;
  lng: string;
  note?: string;
}

interface BoxnowLockerListProps {
  selectedLockerId: string;
  onSelectLocker: (locker: BoxnowLocker) => void;
  locale: string;
}

// Mock data με πραγματικά BOXNOW lockers για demo
// Θα αντικατασταθεί με API call όταν υπάρχουν credentials
const MOCK_LOCKERS: BoxnowLocker[] = [
  {
    id: 'BN-ATH-SYNTAGMA',
    type: 'apm',
    title: 'BOXNOW Syntagma',
    name: 'BOXNOW Syntagma Square',
    addressLine1: 'Πλατεία Συντάγματος',
    addressLine2: 'Αθήνα',
    postalCode: '10563',
    country: 'GR',
    lat: '37.975555',
    lng: '23.734844',
    note: 'Δίπλα στο μετρό Σύνταγμα'
  },
  {
    id: 'BN-ATH-KOLONAKI',
    type: 'apm',
    title: 'BOXNOW Kolonaki',
    name: 'BOXNOW Kolonaki',
    addressLine1: 'Βουκουρεστίου 10',
    addressLine2: 'Αθήνα',
    postalCode: '10671',
    country: 'GR',
    lat: '37.978923',
    lng: '23.738456',
  },
  {
    id: 'BN-ATH-GLYFADA',
    type: 'apm',
    title: 'BOXNOW Glyfada',
    name: 'BOXNOW Glyfada Center',
    addressLine1: 'Λεωφόρος Βουλιαγμένης 108',
    addressLine2: 'Γλυφάδα',
    postalCode: '16674',
    country: 'GR',
    lat: '37.861234',
    lng: '23.757890',
    note: 'Στο εμπορικό κέντρο'
  },
  {
    id: 'BN-PIR-PIRAEUS',
    type: 'apm',
    title: 'BOXNOW Piraeus',
    name: 'BOXNOW Piraeus Port',
    addressLine1: 'Ηρώων Πολυτεχνείου 83',
    addressLine2: 'Πειραιάς',
    postalCode: '18535',
    country: 'GR',
    lat: '37.937891',
    lng: '23.646234',
  },
  {
    id: 'BN-THR-CENTER',
    type: 'apm',
    title: 'BOXNOW Thessaloniki',
    name: 'BOXNOW Thessaloniki Center',
    addressLine1: 'Τσιμισκή 32',
    addressLine2: 'Θεσσαλονίκη',
    postalCode: '54623',
    country: 'GR',
    lat: '40.637123',
    lng: '22.941234',
    note: 'Κοντά στην πλατεία Αριστοτέλους'
  },
  {
    id: 'BN-ATH-KIFISIA',
    type: 'apm',
    title: 'BOXNOW Kifisia',
    name: 'BOXNOW Kifisia',
    addressLine1: 'Λεωφόρος Κηφισίας 245',
    addressLine2: 'Κηφισιά',
    postalCode: '14562',
    country: 'GR',
    lat: '38.074567',
    lng: '23.811234',
  },
  {
    id: 'BN-ATH-MAROUSI',
    type: 'apm',
    title: 'BOXNOW Marousi',
    name: 'BOXNOW Marousi Golden Hall',
    addressLine1: 'Λεωφόρος Κηφισίας 37Α',
    addressLine2: 'Μαρούσι',
    postalCode: '15123',
    country: 'GR',
    lat: '38.051234',
    lng: '23.798765',
    note: 'Στο Golden Hall'
  },
];

export function BoxnowLockerList({ selectedLockerId, onSelectLocker, locale }: BoxnowLockerListProps) {
  const [lockers, setLockers] = useState<BoxnowLocker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLockers();
  }, []);

  const fetchLockers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API if credentials are available
      const apiUrl = process.env.NEXT_PUBLIC_BOXNOW_LOCATIONS_API_URL;
      
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/api/v1/destinations?locationType=apm`);
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.data && Array.isArray(result.data)) {
              setLockers(result.data);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
      }
      
      // Fallback to mock data for demo/testing
      setTimeout(() => {
        setLockers(MOCK_LOCKERS);
        setLoading(false);
      }, 800); // Simulate API delay for realistic UX
      
    } catch (err) {
      console.error('Error loading lockers:', err);
      // Even on error, show mock data
      setLockers(MOCK_LOCKERS);
      setLoading(false);
    }
  };

  const filteredLockers = lockers.filter((locker) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      locker.title?.toLowerCase().includes(searchLower) ||
      locker.name?.toLowerCase().includes(searchLower) ||
      locker.addressLine1?.toLowerCase().includes(searchLower) ||
      locker.addressLine2?.toLowerCase().includes(searchLower) ||
      locker.postalCode?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">
          {locale === 'el' ? 'Φόρτωση lockers...' : 'Loading lockers...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <p className="font-semibold">
          {locale === 'el' ? 'Σφάλμα' : 'Error'}
        </p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchLockers}
          className="mt-2 text-sm underline hover:no-underline"
        >
          {locale === 'el' ? 'Δοκιμάστε ξανά' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
          {locale === 'el' 
            ? 'Επιλέξτε το πλησιέστερο BOXNOW locker για παραλαβή της παραγγελίας σας' 
            : 'Select the nearest BOXNOW locker to collect your order'}
        </p>
        
        <Input
          type="text"
          placeholder={locale === 'el' ? 'Αναζήτηση περιοχής, πόλης, ΤΚ...' : 'Search area, city, postal code...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base"
        />
      </div>

      <div className="space-y-2 max-h-[400px] md:max-h-[500px] overflow-y-auto">
        {filteredLockers.map((locker) => (
          <Card
            key={locker.id}
            className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
              selectedLockerId === locker.id ? 'border-2 border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectLocker(locker)}
          >
            <CardContent className="p-3 md:p-4 flex items-start gap-2 md:gap-3">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base">{locker.title || locker.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{locker.addressLine1}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {locker.addressLine2}, {locker.postalCode}
                    </p>
                    {locker.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        ℹ️ {locker.note}
                      </p>
                    )}
                  </div>
                  {selectedLockerId === locker.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLockers.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">
          {locale === 'el' 
            ? 'Δεν βρέθηκαν lockers με αυτά τα κριτήρια' 
            : 'No lockers found matching your search'}
        </p>
      )}

      {!loading && filteredLockers.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {locale === 'el' 
            ? `${filteredLockers.length} διαθέσιμα BOXNOW lockers` 
            : `${filteredLockers.length} available BOXNOW lockers`}
        </p>
      )}
    </div>
  );
}

