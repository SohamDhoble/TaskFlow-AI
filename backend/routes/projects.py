from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Project, Task
from schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all projects for the authenticated user."""
    projects = db.query(Project).filter(Project.owner_id == current_user.id).order_by(Project.created_at.desc()).all()

    result = []
    for p in projects:
        task_count = db.query(Task).filter(Task.project_id == p.id).count()
        completed_count = db.query(Task).filter(Task.project_id == p.id, Task.status == "done").count()

        proj_data = ProjectResponse.model_validate(p)
        proj_data.task_count = task_count
        proj_data.completed_count = completed_count
        result.append(proj_data)

    return result


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project."""
    project = Project(
        name=project_data.name,
        description=project_data.description,
        deadline=project_data.deadline,
        status=project_data.status or "active",
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing project."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    completed_count = db.query(Task).filter(Task.project_id == project.id, Task.status == "done").count()

    proj_data = ProjectResponse.model_validate(project)
    proj_data.task_count = task_count
    proj_data.completed_count = completed_count
    return proj_data


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project and all its tasks."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
