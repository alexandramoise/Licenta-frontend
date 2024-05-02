const API_URL = "http://localhost:8080/api/bloodPressures";

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
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
        const response = await fetch(API_URL + "?email=" + patientEmail, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            });
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

async function getBloodPressureById(id, patientEmail) {
    try {
        const response = await fetch(API_URL + "/" + id + "?email=" + patientEmail, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA BY ID: ", data);
        return data;
    } catch (error) {
        console.error("Could not get bloodpressure", error);
    }
}

async function updateBloodPressure(bloodPressureDto, id) {
    const response = await fetch(API_URL + "/" + id, {
        method: "PUT", 
        body: JSON.stringify({
            systolic: bloodPressureDto.systolic,
            diastolic: bloodPressureDto.diastolic,
            pulse: bloodPressureDto.pulse,
            date: bloodPressureDto.date,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la adăugarea tensiunii arteriale');
    }
    
    return data;
}

export { addBloodPressure, 
        getBloodPressures, 
        getBloodPressureById,
        updateBloodPressure }