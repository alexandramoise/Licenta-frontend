const API_URL = "http://localhost:8080/bloodPressures";

async function addBloodPressure(bloodPressureDto, patientEmail) {
    const response = await fetch(API_URL + "?email=" + patientEmail, {
        method: "POST", 
        body: JSON.stringify({
            systolic: bloodPressureDto.systolic,
            diastolic: bloodPressureDto.diastolic,
            pulse: bloodPressureDto.pulse,
            date: bloodPressureDto.date,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la adăugarea tensiunii arteriale');
    }
    
    return data;
}

async function getBloodPressures(patientEmail) {
    try {
        const response = await fetch(API_URL + "?email=" + patientEmail);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the bloodpressures", error);
    }
}

export { addBloodPressure, getBloodPressures }