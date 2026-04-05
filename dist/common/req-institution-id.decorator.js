"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReqInstitutionId = void 0;
const common_1 = require("@nestjs/common");
exports.ReqInstitutionId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const raw = req.headers['x-institution-id'];
    const str = Array.isArray(raw) ? raw[0] : raw;
    const id = parseInt(String(str), 10);
    if (str === undefined || str === '' || Number.isNaN(id) || id < 1) {
        throw new common_1.BadRequestException('Header X-Institution-Id wajib ada dan harus berupa angka positif');
    }
    return id;
});
//# sourceMappingURL=req-institution-id.decorator.js.map