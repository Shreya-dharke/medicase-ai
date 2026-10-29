from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
import re


ALLOWED_GENDERS = {"male", "female", "other"}


class PatientRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)
    age: int = Field(..., ge=0, le=120)
    gender: str
    contact_number: str

    @field_validator("full_name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()

    @field_validator("gender")
    @classmethod
    def gender_must_be_valid(cls, v: str) -> str:
        v_lower = v.strip().lower()
        if v_lower not in ALLOWED_GENDERS:
            raise ValueError(f"Gender must be one of: {', '.join(sorted(ALLOWED_GENDERS))}")
        return v_lower

    @field_validator("contact_number")
    @classmethod
    def contact_number_must_be_valid(cls, v: str) -> str:
        v_clean = v.strip()
        # Accepts 10-digit numbers, optionally prefixed with +<country code>
        if not re.fullmatch(r"\+?\d{10,13}", v_clean):
            raise ValueError("Contact number must be a valid 10-13 digit number (optionally starting with +)")
        return v_clean

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm password do not match")
        return self


class PatientRegisterResponse(BaseModel):
    message: str
    user_id: str
    patient_id: str
    name: str
    email: EmailStr
    role: str

    # ---------- Case intake (patient-provided data only) ----------

class Symptoms(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    main_complaint: str = Field(..., min_length=1, max_length=200)
    description: str = Field("", max_length=1000)
    onset: str = Field("", max_length=200)
    duration: str = Field("", max_length=200)
    frequency: str = Field("", max_length=200)
    severity: Optional[int] = Field(None, ge=1, le=10)
    better_or_worse_with: str = Field("", max_length=500)
    associated_symptoms: str = Field("", max_length=500)


class PastMedicalHistory(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    no_known_history: bool = False
    conditions: str = Field("", max_length=500)
    previous_illnesses: str = Field("", max_length=500)
    surgeries: str = Field("", max_length=500)
    hospitalizations: str = Field("", max_length=500)
    other: str = Field("", max_length=500)

    @model_validator(mode="after")
    def no_history_conflict(self):
        has_text = any([self.conditions, self.previous_illnesses, self.surgeries,
                        self.hospitalizations, self.other])
        if self.no_known_history and has_text:
            raise ValueError("Cannot select 'no known history' and also enter history details")
        return self


class MedicationItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=100)
    dosage_reported: str = Field("", max_length=100)
    frequency_reported: str = Field("", max_length=100)
    reason: str = Field("", max_length=200)


class CurrentMedications(BaseModel):
    none_reported: bool = False
    items: List[MedicationItem] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def medication_conflict(self):
        if self.none_reported and self.items:
            raise ValueError("Cannot select 'no current medications' and also list medications")
        return self


class AllergyItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    substance: str = Field(..., min_length=1, max_length=100)
    reaction_reported: str = Field("", max_length=200)
    details: str = Field("", max_length=300)


class Allergies(BaseModel):
    no_known_allergies: bool = False
    items: List[AllergyItem] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def allergy_conflict(self):
        if self.no_known_allergies and self.items:
            raise ValueError("Cannot select 'no known allergies' and also list allergies")
        return self


class TreatmentItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    treatment: str = Field(..., min_length=1, max_length=200)
    details: str = Field("", max_length=500)
    approximate_date: str = Field("", max_length=50)
    reported_response: str = Field("", max_length=300)


class PreviousTreatments(BaseModel):
    items: List[TreatmentItem] = Field(default_factory=list, max_length=20)


class CaseIntakeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    # LOCAL DEMO ONLY: this ID is NOT proof of identity (no authentication yet)
    patient_id: str
    symptoms: Symptoms
    past_medical_history: PastMedicalHistory = PastMedicalHistory()
    current_medications: CurrentMedications = CurrentMedications()
    allergies: Allergies = Allergies()
    previous_treatments: PreviousTreatments = PreviousTreatments()
    additional_notes: str = Field("", max_length=1000)


class CaseIntakeResponse(BaseModel):
    message: str
    case_id: str
    patient_id: str
    status: str
    note: str