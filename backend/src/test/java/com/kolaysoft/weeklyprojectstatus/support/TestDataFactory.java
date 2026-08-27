package com.kolaysoft.weeklyprojectstatus.support;

import com.kolaysoft.weeklyprojectstatus.model.entity.Permission;
import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import com.kolaysoft.weeklyprojectstatus.model.entity.Role;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import com.kolaysoft.weeklyprojectstatus.model.enums.PermissionCode;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RoleCode;
import com.kolaysoft.weeklyprojectstatus.repository.PermissionRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectAssignmentRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.repository.RoleRepository;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Testlerin ihtiyac duydugu proje/kullanici/atama kayitlarini kurar.
 * Her test kendi verisini olusturur; seeder testte calismaz.
 */
@Component
public class TestDataFactory {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    public TestDataFactory(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            ProjectAssignmentRepository projectAssignmentRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    public Project project(String name) {
        return project(name, true);
    }

    public Project project(String name, boolean active) {
        Project project = new Project();
        project.setName(name);
        project.setCustomerName("Demo Müşteri");
        project.setStatus(ProjectStatus.ACTIVE);
        project.setActive(active);

        return projectRepository.save(project);
    }

    public User user(String email, RoleCode roleCode, PermissionCode... permissions) {
        Role role = roleRepository.findByCode(roleCode)
                .orElseGet(() -> roleRepository.save(new Role(roleCode)));

        Set<Permission> granted = new LinkedHashSet<>();

        for (PermissionCode code : permissions) {
            granted.add(permissionRepository.findByCode(code)
                    .orElseGet(() -> permissionRepository.save(new Permission(code))));
        }

        role.setPermissions(granted);
        roleRepository.save(role);

        User user = new User();
        user.setFirstName("Test");
        user.setLastName("Kullanıcı");
        user.setEmail(email);
        user.setPasswordHash("{noop}test");
        user.setRole(role);
        user.setActive(true);

        return userRepository.save(user);
    }

    public void assign(Project project, User user) {
        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setUser(user);
        assignment.setAssignmentRole(AssignmentRole.PROJE_YONETICISI);
        assignment.setActive(true);

        projectAssignmentRepository.save(assignment);
    }
}
