/** Baris dari tabel `institutions` (snake_case dari PostgREST). */
export type InstitutionRow = {
  id: number;
  name: string;
  category: string;
  address: string | null;
  timezone: string | null;
  contact_email: string | null;
  phone: string | null;
  initials: string | null;
  attendance_mode: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  late_tolerance_minutes: number | null;
  active_weekdays: string[] | null;
  kiosk_pin: string | null;
  plan: string | null;
  max_employees: number | null;
  expires_at: string | null;
  created_at: string | null;
};

export type InstitutionResponse = {
  id: number;
  name: string;
  category: string;
  address: string | null;
  timezone: string | null;
  contactEmail: string | null;
  phone: string | null;
  initials: string | null;
  attendanceMode: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  lateToleranceMinutes: number | null;
  activeWeekdays: string[] | null;
  kioskPin: string | null;
  plan: string | null;
  maxEmployees: number | null;
  expiresAt: string | null;
  createdAt: string | null;
};

export function mapInstitutionRow(row: InstitutionRow): InstitutionResponse {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    timezone: row.timezone,
    contactEmail: row.contact_email,
    phone: row.phone,
    initials: row.initials,
    attendanceMode: row.attendance_mode,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    lateToleranceMinutes: row.late_tolerance_minutes,
    activeWeekdays: row.active_weekdays,
    kioskPin: row.kiosk_pin,
    plan: row.plan,
    maxEmployees: row.max_employees,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

/** Patch tenant (tanpa plan / kuota / expires). */
export function patchMeToSnake(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const map: [string, string][] = [
    ['name', 'name'],
    ['category', 'category'],
    ['address', 'address'],
    ['timezone', 'timezone'],
    ['contactEmail', 'contact_email'],
    ['phone', 'phone'],
    ['initials', 'initials'],
    ['attendanceMode', 'attendance_mode'],
    ['checkInTime', 'check_in_time'],
    ['checkOutTime', 'check_out_time'],
    ['lateToleranceMinutes', 'late_tolerance_minutes'],
    ['activeWeekdays', 'active_weekdays'],
    ['kioskPin', 'kiosk_pin'],
  ];
  for (const [camel, snake] of map) {
    if (patch[camel] !== undefined) out[snake] = patch[camel];
  }
  return out;
}

/** Patch superadmin (termasuk plan, max_employees, expires_at). */
export function patchAdminToSnake(patch: Record<string, unknown>): Record<string, unknown> {
  const base = patchMeToSnake(patch);
  if (patch.plan !== undefined) base.plan = patch.plan;
  if (patch.maxEmployees !== undefined) base.max_employees = patch.maxEmployees;
  if (patch.expiresAt !== undefined) base.expires_at = patch.expiresAt;
  return base;
}

export function createDtoToSnake(dto: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {
    name: dto.name,
    category: dto.category,
    address: dto.address ?? null,
    timezone: dto.timezone ?? 'WIB',
    contact_email: dto.contactEmail ?? null,
    phone: dto.phone ?? null,
    initials: dto.initials ?? null,
    attendance_mode: dto.attendanceMode ?? 'both',
    check_in_time: dto.checkInTime,
    check_out_time: dto.checkOutTime ?? null,
    late_tolerance_minutes: dto.lateToleranceMinutes ?? 15,
    active_weekdays: dto.activeWeekdays ?? ['sen', 'sel', 'rab', 'kam', 'jum'],
    kiosk_pin: dto.kioskPin ?? '123456',
    plan: dto.plan ?? 'free',
    max_employees: dto.maxEmployees ?? 15,
    expires_at: dto.expiresAt,
  };
  return row;
}
