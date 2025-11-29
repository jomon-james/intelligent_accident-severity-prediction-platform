"""
app/model_loader.py
-------------------
Loads the trained sklearn Pipeline and LabelEncoder once at startup.
Expose `pipeline` and `label_encoder` global variables for use in routes.
"""

import os
from pathlib import Path
import joblib

# Determine base backend folder (one level above this file)
BASE_DIR = Path(__file__).resolve().parents[1]
SAVED_DIR = BASE_DIR / "saved_models"

# Expected filenames (update if you used different names)
PIPELINE_FILENAME = "model_pipeline_synthetic.pkl"
LABEL_ENCODER_FILENAME = "label_encoder_synthetic.pkl"

PIPELINE_PATH = SAVED_DIR / PIPELINE_FILENAME
LABEL_ENCODER_PATH = SAVED_DIR / LABEL_ENCODER_FILENAME

# Globals that routes will import
pipeline = None
label_encoder = None


def load_models():
    """
    Load model pipeline and label encoder into the module-level globals.
    Called on import so uvicorn startup prints the status.
    """
    global pipeline, label_encoder

    # Load pipeline
    try:
        if not PIPELINE_PATH.exists():
            raise FileNotFoundError(f"Pipeline file not found at: {PIPELINE_PATH}")
        pipeline = joblib.load(PIPELINE_PATH)
        print(f"✅ Pipeline loaded from: {PIPELINE_PATH}")
    except Exception as e:
        pipeline = None
        print(f"❌ Failed to load pipeline: {e}")

    # Load label encoder
    try:
        if not LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"Label encoder file not found at: {LABEL_ENCODER_PATH}")
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        print(f"✅ Label encoder loaded from: {LABEL_ENCODER_PATH}")
    except Exception as e:
        label_encoder = None
        print(f"❌ Failed to load label encoder: {e}")


# Load immediately when module is imported (so uvicorn startup shows messages)
load_models()
