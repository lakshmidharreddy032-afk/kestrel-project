"""
Kestrel Finance — Production Data Schemas (Pydantic v2 compatible, zero-dep fallback)
Zero-PII synthetic models for Indian SME credit appraisal.
"""

from enum import Enum
from typing import Optional, List, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs: Any):
            for k, v in kwargs.items():
                setattr(self, k, v)
            # Apply class attribute defaults if not in kwargs
            for k, v in getattr(self.__class__, '__annotations__', {}).items():
                if k not in kwargs and hasattr(self.__class__, k):
                    val = getattr(self.__class__, k)
                    if callable(val):
                        setattr(self, k, val())
                    else:
                        setattr(self, k, val)

        def model_dump(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

        def dict(self):
            return self.model_dump()

    def Field(*args, **kwargs):
        default = kwargs.get("default", None)
        default_factory = kwargs.get("default_factory", None)
        if default_factory is not None:
            return default_factory()
        return default



class ConstitutionType(str, Enum):
    PROPRIETORSHIP = "Proprietorship"
    PARTNERSHIP = "Partnership"
    PVT_LTD = "Private Limited"
    LLP = "Limited Liability Partnership"


class DocumentType(str, Enum):
    BANK_STATEMENT = "bank_statement"
    GST_RETURN = "gst_return"
    KYC = "kyc"
    BUSINESS_PROOF = "business_proof"
    FINANCIAL_STATEMENT = "financial_statement"


class BoundingBox(BaseModel):
    x: float = Field(..., description="X coordinate percentage from top-left (0-100)")
    y: float = Field(..., description="Y coordinate percentage from top-left (0-100)")
    width: float = Field(..., description="Width percentage (0-100)")
    height: float = Field(..., description="Height percentage (0-100)")
    page: int = Field(default=1, description="Page number of the source document")


class ExtractedFigure(BaseModel):
    id: str
    field_key: str
    label: str
    document_type: DocumentType
    extracted_value: float
    confirmed_value: Optional[float] = None
    unit: str = "INR"
    status: str = "Unchecked"
    confidence_score: float = Field(default=0.98, ge=0.0, le=1.0)
    source_page: int = 1
    bounding_box: BoundingBox
    compliance_label: str = "Mock extraction. Not a live model. Figure verification mandatory."


class ApplicationEligibilityRequest(BaseModel):
    applicant_name: str
    amount: float = Field(..., description="Requested facility amount in INR")
    constitution: ConstitutionType
    sector: str = "Manufacturing"


class EligibilityResult(BaseModel):
    is_eligible: bool
    ticket_ceiling_limit: float = 2500000.0
    status_code: str
    message: str


class DocumentGapCheckRequest(BaseModel):
    application_id: str
    gst_turnover: float
    annualized_bank_credits: float
    statement_months_present: List[str]
    statement_months_required: int = 6
    file_hashes: List[str] = Field(default_factory=list)


class DiagnosticIssue(BaseModel):
    rule_id: str
    rule_name: str
    severity: str  # "error", "warning", "info"
    passed: bool
    reason: str
    prescribed_action: str


class SanctionSignOffRequest(BaseModel):
    application_id: str
    officer_name: str
    officer_role: str
    decision: str  # "Approved", "Rejected", "Referred"
    rationale_notes: str = Field(..., min_length=10, description="Mandatory underwriting justification (min 10 chars)")
