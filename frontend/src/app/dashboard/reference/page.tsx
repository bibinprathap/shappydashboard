'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Trash2, Edit, Globe, DollarSign } from 'lucide-react';
import { useState } from 'react';

// Placeholder data
const countries = [
  { id: '1', code: 'AE', name: 'United Arab Emirates', currencyCode: 'AED', isActive: true },
  { id: '2', code: 'SA', name: 'Saudi Arabia', currencyCode: 'SAR', isActive: true },
  { id: '3', code: 'KW', name: 'Kuwait', currencyCode: 'KWD', isActive: true },
  { id: '4', code: 'BH', name: 'Bahrain', currencyCode: 'BHD', isActive: true },
  { id: '5', code: 'OM', name: 'Oman', currencyCode: 'OMR', isActive: true },
  { id: '6', code: 'QA', name: 'Qatar', currencyCode: 'QAR', isActive: true },
  { id: '7', code: 'EG', name: 'Egypt', currencyCode: 'EGP', isActive: false },
  { id: '8', code: 'JO', name: 'Jordan', currencyCode: 'JOD', isActive: false },
];

const currencies = [
  { id: '1', code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 1.0, isActive: true },
  { id: '2', code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 0.98, isActive: true },
  { id: '3', code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', exchangeRate: 0.083, isActive: true },
  { id: '4', code: 'BHD', name: 'Bahraini Dinar', symbol: 'ب.د', exchangeRate: 0.1, isActive: true },
  { id: '5', code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', exchangeRate: 0.1, isActive: true },
  { id: '6', code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', exchangeRate: 0.99, isActive: true },
  { id: '7', code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', exchangeRate: 8.4, isActive: false },
  { id: '8', code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', exchangeRate: 0.19, isActive: false },
  { id: '9', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.27, isActive: true },
];

export default function ReferencePage() {
  const [countrySearch, setCountrySearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reference Data</h1>
        <p className="text-muted-foreground">Manage countries and currencies</p>
      </div>

      <Tabs defaultValue="countries">
        <TabsList>
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="currencies" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currencies
          </TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                className="pl-10"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
            </div>
            <Dialog open={isCountryDialogOpen} onOpenChange={setIsCountryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Country</DialogTitle>
                  <DialogDescription>
                    Add a new country to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Input id="countryCode" placeholder="AE" maxLength={2} />
                  </div>
                  <div>
                    <Label htmlFor="countryName">Country Name</Label>
                    <Input id="countryName" placeholder="United Arab Emirates" />
                  </div>
                  <div>
                    <Label htmlFor="countryCurrency">Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="countryActive">Active</Label>
                    <Switch id="countryActive" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCountryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCountryDialogOpen(false)}>Add Country</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Currency</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => (
                      <tr key={country.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Badge variant="outline">{country.code}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{country.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{country.currencyCode}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={country.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {country.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search currencies..."
                className="pl-10"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
              />
            </div>
            <Dialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Currency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Currency</DialogTitle>
                  <DialogDescription>
                    Add a new currency to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="currencyCode">Currency Code</Label>
                    <Input id="currencyCode" placeholder="AED" maxLength={3} />
                  </div>
                  <div>
                    <Label htmlFor="currencyName">Currency Name</Label>
                    <Input id="currencyName" placeholder="UAE Dirham" />
                  </div>
                  <div>
                    <Label htmlFor="currencySymbol">Symbol</Label>
                    <Input id="currencySymbol" placeholder="د.إ" />
                  </div>
                  <div>
                    <Label htmlFor="exchangeRate">Exchange Rate (to AED)</Label>
                    <Input id="exchangeRate" type="number" step="0.01" placeholder="1.00" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currencyActive">Active</Label>
                    <Switch id="currencyActive" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCurrencyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCurrencyDialogOpen(false)}>Add Currency</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Exchange Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map((currency) => (
                      <tr key={currency.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Badge variant="outline">{currency.code}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{currency.name}</td>
                        <td className="py-3 px-4">{currency.symbol}</td>
                        <td className="py-3 px-4 text-right">{currency.exchangeRate.toFixed(4)}</td>
                        <td className="py-3 px-4">
                          <Badge className={currency.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {currency.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
