# backend_fastapi/app/routes.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import pandas as pd
import traceback
import logging
import numbers
import math

from .model_loader import pipeline, label_encoder

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


class PredictionInput(BaseModel):
    Speed_limit: int = Field(..., description="Speed limit (km/h)")
    Weather_Conditions: str = Field(..., description="Weather (human label or numeric code)")
    Road_Surface_Conditions: str = Field(..., description="Road surface (human label or numeric code)")
    Light_Conditions: str = Field(..., description="Light condition (human label or numeric code)")
    Urban_or_Rural_Area: str = Field(..., description="Urban or Rural (human label or numeric code)")


class PredictionOutput(BaseModel):
    severity_class: int
    severity_label: str
    confidence: Optional[float] = None


def _normalize_value(v):
    """
    Normalize incoming value:
      - If numeric-like, return int
      - If string, strip only (do NOT lower-case because many pipelines were trained on exact strings)
      - If None/empty, return None
    """
    if v is None:
        return v
    # Already numeric
    if isinstance(v, numbers.Number) and not (isinstance(v, float) and (math.isnan(v))):
        try:
            return int(v)
        except Exception:
            return v
    s = str(v).strip()
    # Try integer-like strings
    if s == "":
        return None
    if s.isdigit():
        try:
            return int(s)
        except Exception:
            pass
    # Try float that is integer-valued
    try:
        f = float(s)
        if f.is_integer():
            return int(f)
    except Exception:
        pass
    # Otherwise return trimmed string (preserve case/punctuation)
    return s


@router.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "model_loaded": pipeline is not None}


@router.post("/predict", response_model=PredictionOutput, tags=["prediction"])
async def predict(data: PredictionInput):
    """
    Predict endpoint:
    Expects JSON body with fields:
      - Speed_limit (int)
      - Weather_Conditions (str or numeric)
      - Road_Surface_Conditions (str or numeric)
      - Light_Conditions (str or numeric)
      - Urban_or_Rural_Area (str or numeric)

    Returns: severity_class (int), severity_label (str), confidence (float, optional)
    """
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model pipeline is not loaded on the server. Please check server logs."
        )

    try:
        # Normalize inputs
        input_dict = {
            "Speed_limit": _normalize_value(data.Speed_limit),
            "Weather_Conditions": _normalize_value(data.Weather_Conditions),
            "Road_Surface_Conditions": _normalize_value(data.Road_Surface_Conditions),
            "Light_Conditions": _normalize_value(data.Light_Conditions),
            "Urban_or_Rural_Area": _normalize_value(data.Urban_or_Rural_Area),
        }

        # Build DataFrame in the exact column order expected by pipeline
        input_df = pd.DataFrame([input_dict])

        # Log input for debugging
        logger.info("PREDICTION REQUEST: %s", input_df.to_dict(orient="records"))

        # Perform prediction
        pred_raw = pipeline.predict(input_df)[0]

        # Compute confidence / probability if available
        confidence = None
        try:
            # Preferred: pipeline supports predict_proba
            if hasattr(pipeline, "predict_proba"):
                proba = pipeline.predict_proba(input_df)
                confidence = float(proba[0].max())
            else:
                # fallback: try to find classifier in pipeline
                named = getattr(pipeline, "named_steps", None)
                if named:
                    last = list(named.values())[-1]
                    pre = named.get("preprocessor") or named.get("pre")
                    if hasattr(last, "predict_proba") and pre is not None:
                        transformed = pre.transform(input_df)
                        proba = last.predict_proba(transformed)
                        confidence = float(proba[0].max())
        except Exception:
            confidence = None

        # Map numeric class -> original label (if encoder exists)
        if label_encoder is not None:
            try:
                severity_label = label_encoder.inverse_transform([pred_raw])[0]
            except Exception:
                severity_label = str(pred_raw)
        else:
            severity_label = str(pred_raw)

        response: Dict[str, Any] = {
            "severity_class": int(pred_raw),
            "severity_label": str(severity_label)
        }
        if confidence is not None:
            response["confidence"] = confidence

        # Optional: here you can save the request+prediction to a DB or file

        return response

    except Exception as exc:
        # Log stacktrace for debugging
        logger.exception("Prediction error: %s", exc)
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {str(exc)}"
        )
# ----------------- Analysis endpoints (append to routes.py) -----------------
import os
from fastapi import Header
from fastapi.responses import JSONResponse
from .analysis_compute import analyze_dataset, load_cached

# configuration via environment
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "changeme")
DATASET_PATH = os.environ.get("DATASET_PATH", None)
CACHE_PATH = os.environ.get("ANALYSIS_CACHE_PATH", None)


@router.get("/analysis", tags=["analysis"])
async def get_analysis():
    """
    Return cached analysis JSON if available; otherwise compute on-demand.
    """
    try:
        cached = load_cached(CACHE_PATH)
        if cached:
            return JSONResponse(content=cached)
        summary = analyze_dataset(dataset_path=DATASET_PATH, cache_path=CACHE_PATH)
        return JSONResponse(content=summary)
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        # For visibility, log and return 500
        logger.exception("Analysis error: %s", e)
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.post("/analysis/regenerate", tags=["analysis"])
async def regenerate_analysis(x_admin_token: str = Header(None)):
    """
    Admin-only: force recompute of the analysis and update cache.
    Header required: X-Admin-Token: <token>
    """
    if x_admin_token is None or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        summary = analyze_dataset(dataset_path=DATASET_PATH, cache_path=CACHE_PATH)
        return JSONResponse(content={"ok": True, "generated_at": summary.get("generated_at")})
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        logger.exception("Regenerate error: %s", e)
        raise HTTPException(status_code=500, detail="Regeneration failed")
