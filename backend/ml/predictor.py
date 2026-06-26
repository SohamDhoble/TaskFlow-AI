import numpy as np
from datetime import datetime, timezone


def predict_completion_time(
    tasks_data: list,
    new_task_priority: str = "medium",
    new_task_desc_length: int = 0,
) -> str:
    """
    Predict estimated completion time for a new task using Linear Regression.

    Uses historical completed tasks to train a simple model based on:
    - Priority (encoded: high=3, medium=2, low=1)
    - Description length

    Returns a human-readable estimated time string.
    """
    # Priority encoding
    priority_map = {"high": 3, "medium": 2, "low": 1}

    # Filter to completed tasks with timestamps
    completed = [
        t for t in tasks_data
        if t.get("completed_at") and t.get("created_at")
    ]

    if len(completed) < 3:
        # Not enough data — use heuristic based on priority
        base_hours = {"high": 4, "medium": 8, "low": 16}
        hours = base_hours.get(new_task_priority, 8)
        if hours < 24:
            return f"{hours} hours"
        else:
            return f"{round(hours / 24, 1)} days"

    # Build feature matrix and target vector
    X = []
    y = []

    for t in completed:
        priority_val = priority_map.get(t.get("priority", "medium"), 2)
        desc_len = len(t.get("description", "") or "")

        created = t["created_at"]
        completed_at = t["completed_at"]

        # Parse datetimes if strings
        if isinstance(created, str):
            created = datetime.fromisoformat(created.replace("Z", "+00:00"))
        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at.replace("Z", "+00:00"))

        # Duration in hours
        duration_hours = max((completed_at - created).total_seconds() / 3600, 0.1)

        X.append([priority_val, desc_len])
        y.append(duration_hours)

    X = np.array(X)
    y = np.array(y)

    # Simple Linear Regression using Normal Equation: w = (X^T X)^-1 X^T y
    # Add bias column
    ones = np.ones((X.shape[0], 1))
    X_b = np.hstack([ones, X])

    try:
        w = np.linalg.lstsq(X_b, y, rcond=None)[0]
    except Exception:
        # Fallback
        hours = {"high": 4, "medium": 8, "low": 16}.get(new_task_priority, 8)
        return f"{hours} hours"

    # Predict for new task
    new_priority_val = priority_map.get(new_task_priority, 2)
    x_new = np.array([1, new_priority_val, new_task_desc_length])
    predicted_hours = max(float(np.dot(w, x_new)), 0.5)

    # Format output
    if predicted_hours < 1:
        return f"{int(predicted_hours * 60)} minutes"
    elif predicted_hours < 24:
        return f"{round(predicted_hours, 1)} hours"
    else:
        days = round(predicted_hours / 24, 1)
        return f"{days} days"
