'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, Search, Loader2 } from 'lucide-react';

interface Vacancy {
  id: string;
  title: string;
  job_reference_number: string;
  department: string;
  location: string;
  country: string;
  duty_station: string;
  contract_type: string;
  closing_date: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_active: boolean;
}

export default function JobBoardPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    country: '',
    department: '',
    contractType: '',
  });

  useEffect(() => {
    fetchVacancies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vacancies, filters]);

  async function fetchVacancies() {
    try {
      const response = await fetch('/api/vacancies?active=true');
      const data = await response.json();
      setVacancies(data.vacancies || []);
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = vacancies;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.job_reference_number.toLowerCase().includes(term) ||
          v.department?.toLowerCase().includes(term)
      );
    }

    if (filters.country) {
      filtered = filtered.filter((v) => v.country === filters.country);
    }

    if (filters.department) {
      filtered = filtered.filter((v) => v.department === filters.department);
    }

    if (filters.contractType) {
      filtered = filtered.filter((v) => v.contract_type === filters.contractType);
    }

    setFilteredVacancies(filtered);
  }

  const countries = [...new Set(vacancies.map((v) => v.country).filter(Boolean))];
  const departments = [...new Set(vacancies.map((v) => v.department).filter(Boolean))];
  const contractTypes = [...new Set(vacancies.map((v) => v.contract_type).filter(Boolean))];

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return null;
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `${currency} ${max?.toLocaleString()}`;
  };

  const isClosingDateSoon = (closingDate: string) => {
    const closing = new Date(closingDate);
    const today = new Date();
    const daysUntilClosing = Math.floor((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilClosing <= 7 && daysUntilClosing >= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vacancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities at WHO</h1>
          <p className="text-lg text-gray-600">
            Explore open positions and find your next opportunity to make a global impact on health.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Vacancies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Positions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Job title, reference..."
                      value={filters.searchTerm}
                      onChange={(e) =>
                        setFilters({ ...filters, searchTerm: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Country */}
                {countries.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) =>
                        setFilters({ ...filters, country: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Department */}
                {departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters({ ...filters, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contract Type */}
                {contractTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type
                    </label>
                    <select
                      value={filters.contractType}
                      onChange={(e) =>
                        setFilters({ ...filters, contractType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Types</option>
                      {contractTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      searchTerm: '',
                      country: '',
                      department: '',
                      contractType: '',
                    })
                  }
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vacancies List */}
          <div className="lg:col-span-3">
            {filteredVacancies.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <p className="text-gray-600 mb-4">No vacancies found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        searchTerm: '',
                        country: '',
                        department: '',
                        contractType: '',
                      })
                    }
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Showing {filteredVacancies.length} of {vacancies.length} vacancies
                </p>
                {filteredVacancies.map((vacancy) => (
                  <Card key={vacancy.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <CardTitle className="text-xl text-gray-900">
                            {vacancy.title}
                          </CardTitle>
                          <CardDescription className="text-blue-600 font-semibold">
                            {vacancy.job_reference_number}
                          </CardDescription>
                        </div>
                        {isClosingDateSoon(vacancy.closing_date) && (
                          <Badge variant="destructive">Closing Soon</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">
                            {vacancy.duty_station || vacancy.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{vacancy.contract_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">
                            {new Date(vacancy.closing_date).toLocaleDateString()}
                          </span>
                        </div>
                        {vacancy.salary_min && (
                          <div className="text-sm">
                            <span className="text-gray-700">
                              {formatSalary(
                                vacancy.salary_min,
                                vacancy.salary_max,
                                vacancy.salary_currency
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {vacancy.department && (
                          <Badge variant="secondary">{vacancy.department}</Badge>
                        )}
                        {vacancy.country && <Badge variant="secondary">{vacancy.country}</Badge>}
                      </div>

                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href={`/careers/browse/${vacancy.id}`}>
                          View Details & Apply
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
