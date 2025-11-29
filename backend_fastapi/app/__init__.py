"""
app/__init__.py
--------------------------------------
Initializes the FastAPI backend package for
the Intelligent Accident Severity Prediction Platform.
"""

from .model_loader import load_models
  # loads ML model and encoder
from .routes import router                      # handles /predict endpoint
from .schemas import PredictionInput            # data schema for input validation

# Optional (if you have a mappings.py for category mapping)
try:
    from .mappings import *
except ImportError:
    pass

__all__ = [
    "model",
    "label_encoder",
    "router",
    "PredictionInput"
]
