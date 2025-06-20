import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "../../api/TaskApi.ts";
import { Navigate, useParams } from "react-router-dom";
import EditTaskModal from "./EditTaskModal.tsx";

export default function EditTaskData() {
  const params = useParams();
  const projectId = params.projectId!;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const taskId = queryParams.get("editTask")!;

  const { data, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById({ projectId, taskId }),
    enabled: !!taskId,
  });
  if (isError) return <Navigate to={"/404"} />;
  if (data) return <EditTaskModal data={data} taskId={taskId} />;
}
