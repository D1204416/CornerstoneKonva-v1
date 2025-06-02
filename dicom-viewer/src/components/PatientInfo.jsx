import React from 'react'
import './PatientInfo.css'

const PatientInfo = ({ patientData }) => {
  return (
    <div className="patient-info">
      <h3>Patient Information</h3>
      <div className="patient-details">
        <div className="patient-field">
          <label>Patient Name:</label>
          <span>{patientData?.patientName || 'N/A'}</span>
        </div>
        <div className="patient-field">
          <label>Birthdate:</label>
          <span>{patientData?.birthdate || 'N/A'}</span>
        </div>
        <div className="patient-field">
          <label>Age:</label>
          <span>{patientData?.age || 'N/A'}</span>
        </div>
        <div className="patient-field">
          <label>Sex:</label>
          <span>{patientData?.sex || 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}

export default PatientInfo