package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.dto.admin.UserUpdateRequest;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.support.TestAuth;
import com.kolaysoft.weeklyprojectstatus.support.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Admin yonetiminde kilitlenme korumalari (denetim maddesi 18).
 *
 * Yetki kontrolu endpoint seviyesinde dogru calisiyordu; bu testler
 * yetkili bir admin'in sistemi yanlislikla yonetilemez hale
 * getirmesini engelleyen IS KURALLARINI dogrular.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminSafeguardTest {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private TestDataFactory data;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = data.user("admin@test.local", RoleCode.ADMIN,
                PermissionCode.USER_MANAGE);
        TestAuth.loginAs(admin);
    }

    @AfterEach
    void tearDown() {
        TestAuth.logout();
    }

    private UserUpdateRequest request(RoleCode role, boolean active) {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("Test");
        request.setLastName("Kullanıcı");
        request.setRole(role);
        request.setActive(active);

        return request;
    }

    @Test
    @DisplayName("Admin kendi hesabini pasife alamaz")
    void adminCannotDeactivateSelf() {
        assertThatThrownBy(() -> adminUserService.updateUser(
                admin.getId(), request(RoleCode.ADMIN, false)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Kendi hesabınızı");
    }

    @Test
    @DisplayName("Admin kendi rolunu degistiremez")
    void adminCannotChangeOwnRole() {
        assertThatThrownBy(() -> adminUserService.updateUser(
                admin.getId(), request(RoleCode.PROJE_YONETICISI, true)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Kendi rolünüzü");
    }

    @Test
    @DisplayName("Baska bir admin varken pasife alma serbest")
    void anotherAdminCanBeDeactivatedWhenMoreThanOneExists() {
        User otherAdmin = data.user("admin2@test.local", RoleCode.ADMIN,
                PermissionCode.USER_MANAGE);

        assertThatCode(() -> adminUserService.updateUser(
                otherAdmin.getId(), request(RoleCode.ADMIN, false)))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Son admin degismezi: kendini kilitleme kurali tek basina korur")
    void lastAdminInvariantHolds() {
        // Iki admin: birini pasife almak serbest.
        User otherAdmin = data.user("admin2@test.local", RoleCode.ADMIN,
                PermissionCode.USER_MANAGE);

        adminUserService.updateUser(
                otherAdmin.getId(), request(RoleCode.ADMIN, false));

        // Geriye tek aktif admin kaldi: kendisi. Ne pasife alabilir
        // ne rolunu dusurebilir; boylece sistem her zaman en az bir
        // aktif admin ile kalir.
        assertThatThrownBy(() -> adminUserService.updateUser(
                admin.getId(), request(RoleCode.ADMIN, false)))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> adminUserService.updateUser(
                admin.getId(), request(RoleCode.EKIP_LIDERI, true)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Admin olmayan kullanici pasife alinabilir")
    void nonAdminCanBeDeactivated() {
        User pm = data.user("pm@test.local", RoleCode.PROJE_YONETICISI,
                PermissionCode.REPORT_VIEW);

        assertThatCode(() -> adminUserService.updateUser(
                pm.getId(), request(RoleCode.PROJE_YONETICISI, false)))
                .doesNotThrowAnyException();
    }
}
