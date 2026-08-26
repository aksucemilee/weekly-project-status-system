package com.kolaysoft.weeklyprojectstatus.model.enums;

/**
 * T14 yetki kodlari. Yetkilendirme kontrolleri rol adi uzerinden degil,
 * bu kodlar uzerinden yapilir (bkz. docs/t14-authorization-matrix.md).
 */
public enum PermissionCode {

    PROJECT_VIEW,
    PROJECT_MANAGE,
    REPORT_VIEW,
    REPORT_CREATE,
    REPORT_UPDATE,
    WORKITEM_VIEW,
    WORKITEM_MANAGE,
    RISK_VIEW,
    RISK_MANAGE,
    DASHBOARD_VIEW,
    USER_MANAGE,
    ASSIGNMENT_MANAGE
}
