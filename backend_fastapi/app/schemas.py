"""
app/schemas.py
--------------------------------------
Defines Pydantic models (schemas) for validating
API request and response data in FastAPI.
"""

from pydantic import BaseModel

class PredictionInput(BaseModel):
    """
    Schema for the /predict endpoint input.
    These fields must match exactly with the frontend form
    and the model's training features.
    """
    Speed_limit: int
    Weather_Conditions: str
    Road_Surface_Conditions: str
    Light_Conditions: str
    Urban_or_Rural_Area: str


class PredictionOutput(BaseModel):
    """
    Schema for the /predict endpoint output.
    Defines the structure of the JSON response returned by the backend.
    """
    severity_class: int
    severity_label: str
