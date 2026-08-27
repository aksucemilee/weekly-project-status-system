package com.kolaysoft.weeklyprojectstatus.config;

import com.kolaysoft.weeklyprojectstatus.model.entity.Permission;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import com.kolaysoft.weeklyprojectstatus.model.entity.Role;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.repository.PermissionRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectAssignmentRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.repository.RoleRepository;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Rol ve yetki tanimlarini docs/t14-authorization-matrix.md ile ayni
 * tutar. Yetki demetleri her aciliste senkronlanir; matris degistiginde
 * kod degil bu tablo guncellenir.
 *
 * Demo kullanicilari yalnizca SEED_USER_PASSWORD ortam degiskeni
 * tanimliysa olusturulur. Parola kaynak kodda tutulmaz.
 */
@Component
@Order(1)
public class AuthorizationDataInitializer implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(AuthorizationDataInitializer.class);

    private static final Map<RoleCode, Set<PermissionCode>> ROLE_PERMISSIONS = Map.of(
            RoleCode.PROJE_YONETICISI, Set.of(
                    PermissionCode.PROJECT_VIEW,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.REPORT_CREATE,
                    PermissionCode.REPORT_UPDATE,
                    PermissionCode.WORKITEM_VIEW,
                    PermissionCode.WORKITEM_MANAGE,
                    PermissionCode.RISK_VIEW,
                    PermissionCode.RISK_MANAGE),

            RoleCode.CTO, Set.of(
                    PermissionCode.PROJECT_VIEW,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.WORKITEM_VIEW,
                    PermissionCode.RISK_VIEW,
                    PermissionCode.DASHBOARD_VIEW),

            RoleCode.ADMIN, Set.of(
                    PermissionCode.PROJECT_VIEW,
                    PermissionCode.PROJECT_MANAGE,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.USER_MANAGE,
                    PermissionCode.ASSIGNMENT_MANAGE),

            RoleCode.EKIP_LIDERI, Set.of(
                    PermissionCode.PROJECT_VIEW,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.WORKITEM_VIEW,
                    PermissionCode.RISK_VIEW));

    private static final Map<RoleCode, String> DEMO_USER_EMAILS = Map.of(
            RoleCode.PROJE_YONETICISI, "pm@demo.local",
            RoleCode.CTO, "cto@demo.local",
            RoleCode.ADMIN, "admin@demo.local",
            RoleCode.EKIP_LIDERI, "lider@demo.local");

    /**
     * Demo kullanicilarinin ad/soyadi. Onceki surumde soyad alanina rol
     * kodu ("EKIP_LIDERI") yaziliyordu; bu deger admin ekraninda ve
     * dashboard'un "Sorumlu" sutununda kullaniciya gorunuyordu. Isimler
     * gercek kisi degil, demo verisidir (bkz. README).
     */
    private static final Map<RoleCode, String[]> DEMO_USER_NAMES = Map.of(
            RoleCode.PROJE_YONETICISI, new String[] { "Elif", "Demir" },
            RoleCode.CTO, new String[] { "Murat", "Yılmaz" },
            RoleCode.ADMIN, new String[] { "Sistem", "Yöneticisi" },
            RoleCode.EKIP_LIDERI, new String[] { "Burak", "Kaya" });

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SEED_USER_PASSWORD:}")
    private String seedUserPassword;

    public AuthorizationDataInitializer(
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository projectAssignmentRepository,
            PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        syncPermissions();
        syncRoles();
        seedDemoUsers();
    }

    private void syncPermissions() {
        for (PermissionCode code : PermissionCode.values()) {
            permissionRepository.findByCode(code)
                    .orElseGet(() -> permissionRepository
                            .save(new Permission(code)));
        }
    }

    private void syncRoles() {
        for (Map.Entry<RoleCode, Set<PermissionCode>> entry : ROLE_PERMISSIONS
                .entrySet()) {
            Role role = roleRepository.findByCode(entry.getKey())
                    .orElseGet(() -> roleRepository
                            .save(new Role(entry.getKey())));

            Set<Permission> permissions = new LinkedHashSet<>();

            for (PermissionCode code : entry.getValue()) {
                permissionRepository.findByCode(code).ifPresent(permissions::add);
            }

            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void seedDemoUsers() {
        if (seedUserPassword == null || seedUserPassword.isBlank()) {
            log.warn("SEED_USER_PASSWORD tanımlı değil; demo kullanıcıları "
                    + "oluşturulmadı. Giriş yapabilmek için bu ortam "
                    + "değişkenini tanımlayıp uygulamayı yeniden başlatın.");
            return;
        }

        for (Map.Entry<RoleCode, String> entry : DEMO_USER_EMAILS.entrySet()) {
            String email = entry.getValue();

            if (userRepository.existsByEmailIgnoreCase(email)) {
                continue;
            }

            Role role = roleRepository.findByCode(entry.getKey())
                    .orElseThrow();

            String[] name = DEMO_USER_NAMES.get(entry.getKey());

            User user = new User();
            user.setFirstName(name[0]);
            user.setLastName(name[1]);
            user.setEmail(email);
            user.setPasswordHash(
                    passwordEncoder.encode(demoPasswordFor(email)));
            user.setRole(role);
            user.setActive(true);

            userRepository.save(user);

            log.info("Demo kullanıcı oluşturuldu: {} ({})",
                    email,
                    entry.getKey());
        }

        seedDemoAssignments();
    }

    /**
     * Demo kullanicisinin parolasi: e-posta yerel kismi + SEED_USER_PASSWORD.
     * Ornek: SEED_USER_PASSWORD=1234! ise cto@demo.local -> "cto1234!".
     *
     * Parolanin tamami kaynak kodda tutulmaz (yonetmelik 8.2); yalnizca
     * hangi desenin kullanildigi kodda gorunur. Boylece her rol icin
     * demo sirasinda akilda kalan ayri bir parola olusur, ancak gizli
     * kisim ortam degiskeninde kalir.
     */
    private String demoPasswordFor(String email) {
        return email.substring(0, email.indexOf('@')) + seedUserPassword;
    }

    /**
     * Kapsam kontrolunun demo/test edilebilmesi icin proje yoneticisi ve
     * ekip liderini mevcut aktif projelerin ilk ikisine atar. Boylece
     * "atanmis proje" ve "atanmamis proje" senaryolari ayni veri
     * uzerinde denenebilir.
     */
    private void seedDemoAssignments() {
        List<Project> projects = projectRepository
                .findByActiveTrueOrderByNameAsc();

        if (projects.isEmpty()) {
            return;
        }

        List<Project> assignable = projects.subList(
                0,
                Math.min(2, projects.size()));

        assignDemoUser(
                DEMO_USER_EMAILS.get(RoleCode.PROJE_YONETICISI),
                AssignmentRole.PROJE_YONETICISI,
                assignable);

        assignDemoUser(
                DEMO_USER_EMAILS.get(RoleCode.EKIP_LIDERI),
                AssignmentRole.EKIP_LIDERI,
                assignable);
    }

    private void assignDemoUser(
            String email,
            AssignmentRole assignmentRole,
            List<Project> projects) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            // Kullanicinin zaten bir atamasi varsa hic dokunulmaz.
            // Aksi halde proje kumesi degistiginde (ornegin
            // DemoDataInitializer yeni projeler ekledikten sonra) alfabetik
            // "ilk iki proje" degisiyor ve her acilista yeni atama
            // uretiliyordu; seeder idempotent kalmiyordu.
            if (!projectAssignmentRepository
                    .findByUser_IdAndActiveTrue(user.getId())
                    .isEmpty()) {
                return;
            }

            for (Project project : projects) {
                boolean alreadyAssigned = projectAssignmentRepository
                        .existsByProject_IdAndUser_IdAndActiveTrue(
                                project.getId(),
                                user.getId());

                if (alreadyAssigned) {
                    continue;
                }

                ProjectAssignment assignment = new ProjectAssignment();
                assignment.setProject(project);
                assignment.setUser(user);
                assignment.setAssignmentRole(assignmentRole);
                assignment.setActive(true);

                projectAssignmentRepository.save(assignment);

                log.info("Demo atama: {} -> proje {}", email, project.getId());
            }
        });
    }
}
