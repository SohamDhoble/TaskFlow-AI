from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Project, Task
from schemas import TaskCreate, TaskUpdate, TaskResponse
from auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/all", response_model=List[TaskResponse])
def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks across all projects for the current user (used by dashboard)."""
    tasks = (
        db.query(Task)
        .join(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(Task.created_at.desc())
        .all()
    )
    return tasks


@router.get("/{project_id}", response_model=List[TaskResponse])
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks for a specific project."""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.created_at.desc()).all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task in a project."""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == task_data.project_id, Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status or "todo",
        priority=task_data.priority or "medium",
        due_date=task_data.due_date,
        project_id=task_data.project_id,
        ai_priority=task_data.ai_priority,
        predicted_time=task_data.predicted_time,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing task."""
    task = (
        db.query(Task)
        .join(Project)
        .filter(Task.id == task_id, Project.owner_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)

    # Set completed_at when task moves to done
    if "status" in update_data:
        if update_data["status"] == "done" and task.status != "done":
            task.completed_at = datetime.now(timezone.utc)
        elif update_data["status"] != "done":
            task.completed_at = None

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task."""
    task = (
        db.query(Task)
        .join(Project)
        .filter(Task.id == task_id, Project.owner_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
