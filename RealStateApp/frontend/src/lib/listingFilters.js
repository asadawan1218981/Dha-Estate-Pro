export const LISTING_STATUSES = {
  BUY: 'BUY',
  RENT: 'RENT',
};

export const DEFAULT_LISTING_STATUS = LISTING_STATUSES.BUY;

export const PROPERTY_TYPE_OPTIONS = {
  HOUSE: { value: 'HOUSE', label: 'Houses' },
  APARTMENT: { value: 'APARTMENT', label: 'Apartments' },
  PORTION: { value: 'PORTION', label: 'Portions' },
  PLOT: { value: 'PLOT', label: 'Residential Plots' },
  OFFICE: { value: 'OFFICE', label: 'Offices' },
  SHOP: { value: 'SHOP', label: 'Shops' },
  COMMERCIAL: { value: 'COMMERCIAL', label: 'Commercial Lands' },
};

export const PROPERTY_TYPES_BY_STATUS = {
  [LISTING_STATUSES.BUY]: ['HOUSE', 'APARTMENT', 'PORTION', 'PLOT', 'COMMERCIAL'],
  [LISTING_STATUSES.RENT]: ['HOUSE', 'APARTMENT', 'PORTION', 'OFFICE', 'SHOP'],
};

const PROPERTY_TYPE_ALIASES = {
  HOUSES: 'HOUSE',
  APARTMENTS: 'APARTMENT',
  PORTIONS: 'PORTION',
  PLOTS: 'PLOT',
  OFFICES: 'OFFICE',
  SHOPS: 'SHOP',
  COMMERCIALS: 'COMMERCIAL',
};

const OPTIONAL_FILTER_KEYS = [
  'phase',
  'priceMin',
  'priceMax',
  'beds',
  'baths',
  'possessionStatus',
  'furnished',
  'query',
];

export function normalizeListingStatus(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return Object.values(LISTING_STATUSES).includes(normalized) ? normalized : '';
}

export function normalizePropertyType(value) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const canonical = PROPERTY_TYPE_ALIASES[normalized] || normalized;

  return PROPERTY_TYPE_OPTIONS[canonical] ? canonical : '';
}

export function isPropertyTypeAvailableForStatus(type, status) {
  const normalizedStatus = normalizeListingStatus(status);
  const normalizedType = normalizePropertyType(type);

  return Boolean(
    normalizedStatus &&
      normalizedType &&
      PROPERTY_TYPES_BY_STATUS[normalizedStatus].includes(normalizedType)
  );
}

export function getPropertyTypeOptions(status) {
  const normalizedStatus = normalizeListingStatus(status) || DEFAULT_LISTING_STATUS;

  return PROPERTY_TYPES_BY_STATUS[normalizedStatus].map(
    (type) => PROPERTY_TYPE_OPTIONS[type]
  );
}

export function getListingFilters(searchParams) {
  const status = normalizeListingStatus(searchParams.get('status')) || DEFAULT_LISTING_STATUS;
  const requestedType = normalizePropertyType(searchParams.get('type'));
  const type = isPropertyTypeAvailableForStatus(requestedType, status)
    ? requestedType
    : '';

  return OPTIONAL_FILTER_KEYS.reduce(
    (filters, key) => ({
      ...filters,
      [key]: searchParams.get(key) || '',
    }),
    { status, type }
  );
}

export function getListingPage(searchParams) {
  const page = Number.parseInt(searchParams.get('page'), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function buildListingsUrl(filters = {}, page = 1) {
  const params = new URLSearchParams();
  const status = normalizeListingStatus(filters.status) || DEFAULT_LISTING_STATUS;
  const requestedType = normalizePropertyType(filters.type);
  const type = isPropertyTypeAvailableForStatus(requestedType, status)
    ? requestedType
    : '';

  params.set('status', status);
  if (type) params.set('type', type);

  OPTIONAL_FILTER_KEYS.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(key, String(value).trim());
    }
  });

  const normalizedPage = Number.parseInt(page, 10);
  if (Number.isInteger(normalizedPage) && normalizedPage > 1) {
    params.set('page', String(normalizedPage));
  }

  return `/listings?${params.toString()}`;
}
