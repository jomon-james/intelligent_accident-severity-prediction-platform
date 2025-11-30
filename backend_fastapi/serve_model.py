# serve_model.py (minimal test server)
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PredictRequest(BaseModel):
    Speed_limit: int
    Weather_Conditions: str
    Road_Surface_Conditions: str
    Light_Conditions: str
    Urban_or_Rural_Area: str

@app.post("/predict")
def predict(req: PredictRequest):
    # A deterministic dummy mapping for UI testing:
    # severity_class: 1 (Minor), 2 (Serious), 3 (Fatal) — just example
    # We'll choose based on speed for demo
    s = req.Speed_limit
    if s <= 30:
        cls = 1
        label = "Minor"
        conf = 0.85
    elif s <= 60:
        cls = 2
        label = "Serious"
        conf = 0.72
    else:
        cls = 3
        label = "Fatal"
        conf = 0.60

    return {
        "severity_class": cls,
        "severity_label": label,
        "confidence": conf
    }
