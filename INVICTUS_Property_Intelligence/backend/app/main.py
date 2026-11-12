from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(title="INVICTUS API", version="0.1.0", description="Prototype API; demo-only valuation logic.")

class ValuationInput(BaseModel):
    city: str = "Jaipur"
    property_type: Literal["RESIDENTIAL_APARTMENT"] = "RESIDENTIAL_APARTMENT"
    locality: str
    area_sqft: float = Field(gt=100, le=20000)
    area_basis: Literal["CARPET", "BUILT_UP", "SUPER_BUILT_UP"]
    bedrooms: int = Field(ge=1, le=10)
    age_years: int = Field(ge=0, le=100)
    floor: int = Field(ge=0, le=100)
    condition: Literal["VERY_GOOD", "GOOD", "AVERAGE", "NEEDS_WORK"] = "GOOD"

RATES = {"Jagatpura":5100,"Vaishali Nagar":6900,"Mansarovar":5600,"Tonk Road":6300,"Malviya Nagar":7200,"Civil Lines":8500,"Ajmer Road":4800}

@app.get("/health")
def health():
    return {"status":"ok","mode":"demo-only","model":"heuristic-unvalidated"}

@app.post("/api/v1/valuations")
def create_valuation(payload: ValuationInput):
    if payload.city.strip().lower() != "jaipur":
        raise HTTPException(422, detail={"code":"SCOPE_NOT_SUPPORTED","message":"MVP supports Jaipur only."})
    base = RATES.get(payload.locality, 5200)
    area_factor = {"CARPET":1.32,"BUILT_UP":1.13,"SUPER_BUILT_UP":1.0}[payload.area_basis]
    age_factor = max(.78, 1-payload.age_years*.009)
    condition_factor = {"VERY_GOOD":1.04,"GOOD":1.0,"AVERAGE":.96,"NEEDS_WORK":.9}[payload.condition]
    floor_factor = 1.025 if payload.floor >= 8 else (.985 if payload.floor <= 2 else 1)
    bed_factor = 1.025 if payload.bedrooms >= 4 else 1
    estimate = round(payload.area_sqft*base*area_factor*age_factor*condition_factor*floor_factor*bed_factor)
    return {
      "status":"DEMO_ESTIMATE",
      "scope":{"city":"Jaipur","property_type":"RESIDENTIAL_APARTMENT"},
      "estimated_value_inr":estimate,
      "valuation_range":None,
      "confidence":{"band":"LOW","calibration_status":"NOT_CALIBRATED","rationale":["Illustrative heuristic only","No verified transaction dataset connected"]},
      "evidence_grade":"LIMITED",
      "model":{"name":"locality-rate-heuristic","version":"demo-0.1","validated":False},
      "disclaimer":"Not a formal valuation certificate, market quote, or lending decision."
    }
