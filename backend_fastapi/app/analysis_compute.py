# backend_fastapi/app/analysis_compute.py
import os
import json
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DATASET_PATH = os.environ.get(
    "DATASET_PATH",
    os.path.abspath(os.path.join(BASE_DIR, "..", "api", "datasets", "AccidentsBig.csv"))
)
DEFAULT_CACHE_PATH = os.environ.get(
    "ANALYSIS_CACHE_PATH",
    os.path.abspath(os.path.join(BASE_DIR, "..", "api", "analysis_cache", "accidentsbig_summary.json"))
)

def ensure_cache_dir(path: str):
    d = os.path.dirname(path)
    os.makedirs(d, exist_ok=True)

def safe_load_csv(path: str, nrows: int = None) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}")
    read_args = [
        {"sep": ",", "encoding": "utf-8"},
        {"sep": ",", "encoding": "latin1"},
        {"sep": ";", "encoding": "utf-8"},
        {"sep": ";", "encoding": "latin1"},
    ]
    last_exc = None
    for args in read_args:
        try:
            if nrows is None:
                df = pd.read_csv(path, **args)
            else:
                df = pd.read_csv(path, nrows=nrows, **args)
            return df
        except Exception as e:
            last_exc = e
            continue
    raise last_exc

def compute_basic_stats(df: pd.DataFrame) -> Dict[str, Any]:
    rows = int(df.shape[0])
    cols = list(df.columns.astype(str))
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    nulls = {c: int(df[c].isna().sum()) for c in cols}
    sample_rows = 5
    sample = df.head(sample_rows).to_dict(orient="records")
    return {
        "rows": rows,
        "cols": cols,
        "numeric_cols": numeric_cols,
        "null_counts": nulls,
        "sample": sample
    }

def build_severity_distribution(df: pd.DataFrame, label_col_candidates=["severity_label", "Severity", "Accident_Severity", "severity"]):
    label_col = None
    for c in label_col_candidates:
        if c in df.columns:
            label_col = c
            break
    if label_col is None:
        for c in df.columns:
            if df[c].dtype.kind in "iu" and df[c].nunique() < 12:
                label_col = c
                break
    if label_col is None:
        return []
    vc = df[label_col].fillna("Unknown").astype(str).value_counts().to_dict()
    return [{"name": k, "value": int(v)} for k, v in vc.items()]

def build_by_hour(df: pd.DataFrame, datetime_cols_candidates=["Date", "date", "Datetime", "datetime", "accident_date", "created_at", "timestamp"]):
    dt_col = None
    for c in datetime_cols_candidates:
        if c in df.columns:
            dt_col = c
            break
    if dt_col is None:
        for c in df.columns:
            if "date" in c.lower() or "time" in c.lower():
                dt_col = c
                break
    if dt_col is None:
        return []
    try:
        s = pd.to_datetime(df[dt_col], errors="coerce")
        s = s.dropna()
        if s.empty:
            return []
        hours = s.dt.hour.value_counts().sort_index()
        return [{"hour": int(idx), "count": int(val)} for idx, val in hours.items()]
    except Exception:
        return []

def build_by_weekday(df: pd.DataFrame, datetime_cols_candidates=["Date", "date", "Datetime", "datetime", "accident_date", "created_at", "timestamp"]):
    dt_col = None
    for c in datetime_cols_candidates:
        if c in df.columns:
            dt_col = c
            break
    if dt_col is None:
        for c in df.columns:
            if "date" in c.lower() or "time" in c.lower():
                dt_col = c
                break
    if dt_col is None:
        return []
    try:
        s = pd.to_datetime(df[dt_col], errors="coerce")
        s = s.dropna()
        if s.empty:
            return []
        w = s.dt.day_name().value_counts()
        order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        out = []
        for day in order:
            if day in w.index:
                out.append({"weekday": day, "count": int(w[day])})
        return out
    except Exception:
        return []

def top_factors(df: pd.DataFrame, columns=None, top_n=6):
    if columns is None:
        candidates = [c for c in df.columns if df[c].dtype == 'object' and df[c].nunique() < 200]
    else:
        candidates = [c for c in columns if c in df.columns]
    results = {}
    for c in candidates:
        vc = df[c].fillna("Unknown").value_counts().head(top_n).to_dict()
        results[c] = [{"value": k, "count": int(v)} for k, v in vc.items()]
    return results

def compute_correlation_summary(df: pd.DataFrame):
    numeric = df.select_dtypes(include=["number"])
    if numeric.shape[1] < 2:
        return {}
    corr = numeric.corr().fillna(0)
    corr_dict = {col: {col2: float(corr.at[col,col2]) for col2 in corr.columns} for col in corr.columns}
    return corr_dict

def analyze_dataset(dataset_path: str = None, cache_path: str = None, sample_nrows: int = None) -> Dict[str, Any]:
    path = dataset_path or DEFAULT_DATASET_PATH
    cache = cache_path or DEFAULT_CACHE_PATH
    ensure_cache_dir(cache)
    df = safe_load_csv(path, nrows=None if sample_nrows is None else sample_nrows)
    basic = compute_basic_stats(df)
    severity_dist = build_severity_distribution(df)
    by_hour = build_by_hour(df)
    by_weekday = build_by_weekday(df)
    factors = top_factors(df)
    corr = compute_correlation_summary(df)
    summary = {
        "dataset": os.path.basename(path),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "basic": basic,
        "severity_distribution": severity_dist,
        "by_hour": by_hour,
        "by_weekday": by_weekday,
        "top_factors": factors,
        "correlation": corr
    }
    with open(cache, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)
    return summary

def load_cached(cache_path: str = None):
    cache = cache_path or DEFAULT_CACHE_PATH
    if os.path.exists(cache):
        with open(cache, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return None
