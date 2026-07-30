import { Box, Stack } from "@mui/material";
import { useEffect, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import ProjectCreateForm from "../components/projects/ProjectCreateForm";
import ProjectList from "../components/projects/ProjectList";
import { getProjects } from "../services/projectService";
import type { Project } from "../types/project";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await getProjects();
        setProjects(projectList);
      } catch {
        setLoadErrorMessage("Projeler yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const handleProjectCreated = (createdProject: Project) => {
    setProjects((previousProjects) => [createdProject, ...previousProjects]);
  };

  return (
    <Box>
      <PageHeader
        title="Projeler"
        description="Projelerin temel bilgilerini oluşturun, planlanan tarihleri belirleyin ve mevcut proje durumlarını takip edin."
      />

      <Stack spacing={4}>
        <ProjectCreateForm onProjectCreated={handleProjectCreated} />

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          errorMessage={loadErrorMessage}
        />
      </Stack>
    </Box>
  );
}

export default ProjectsPage;
