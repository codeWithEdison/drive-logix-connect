import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Phone, 
  User, 
  MapPin,
  Building,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'pickup' | 'delivery';
  company?: string;
  address?: string;
}

interface ContactDropdownProps {
  contacts: ContactPerson[];
  onCall: (contact: ContactPerson) => void;
  className?: string;
}

export function ContactDropdown({ contacts, onCall, className }: ContactDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pickupContacts = contacts.filter(c => c.type === 'pickup');
  const deliveryContacts = contacts.filter(c => c.type === 'delivery');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCall = (contact: ContactPerson) => {
    onCall(contact);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        onClick={toggleDropdown}
        variant="outline"
        className="w-full justify-between"
        size="lg"
      >
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Call Client
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
          <CardContent className="p-4 space-y-4">
            {/* Pickup Contacts */}
            {pickupContacts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Pickup Contacts</span>
                </div>
                {pickupContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => handleCall(contact)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{contact.name}</span>
                        <Badge variant="secondary" className="text-xs">Pickup</Badge>
                      </div>
                      {contact.company && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{contact.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{contact.phone}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Contacts */}
            {deliveryContacts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Delivery Contacts</span>
                </div>
                {deliveryContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                    onClick={() => handleCall(contact)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">{contact.name}</span>
                        <Badge variant="secondary" className="text-xs">Delivery</Badge>
                      </div>
                      {contact.company && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{contact.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{contact.phone}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
