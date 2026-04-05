"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapInstitutionRow = mapInstitutionRow;
exports.patchMeToSnake = patchMeToSnake;
exports.patchAdminToSnake = patchAdminToSnake;
exports.createDtoToSnake = createDtoToSnake;
function mapInstitutionRow(row) {
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
function patchMeToSnake(patch) {
    const out = {};
    const map = [
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
        if (patch[camel] !== undefined)
            out[snake] = patch[camel];
    }
    return out;
}
function patchAdminToSnake(patch) {
    const base = patchMeToSnake(patch);
    if (patch.plan !== undefined)
        base.plan = patch.plan;
    if (patch.maxEmployees !== undefined)
        base.max_employees = patch.maxEmployees;
    if (patch.expiresAt !== undefined)
        base.expires_at = patch.expiresAt;
    return base;
}
function createDtoToSnake(dto) {
    const row = {
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
//# sourceMappingURL=institutions.mapper.js.map