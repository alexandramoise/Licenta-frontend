const API_URL = "http://localhost:8080/patients";

async function getDoctorsPatients(email) {
    try {
        const response = await fetch(API_URL + "/all?email=" + encodeURIComponent(email));

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getPagedPatients(doctorEmail, pageSize, pageNumber, sortCategory) {
    try {
        const response = await fetch(API_URL + "/paged?email=" + encodeURIComponent(doctorEmail) + 
                                    "&pageSize=" + pageSize + 
                                    "&pageNumber=" + pageNumber + 
                                    "&sortCategory=" + sortCategory);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("DATA PAGINATED: ", data); 
        return data; 
    } catch(error) {
        console.error("Could not fetch the patients", error);
    }
}


async function getPatientById(patientId) {
    try {
        const response = await fetch(API_URL + "/" + patientId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA FOR ID ", patientId, data);
        return data;
    } catch (error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getPatientByEmail(patientEmail) {
    try {
        const response = await fetch(API_URL + "?email=" + patientEmail);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data for patient email ", patientEmail, data);
        return data;
    } catch (error) {
        console.error("Could not get the patient", error);
    }
}

async function updatePatientByEmail(patientUpdateDto, patientEmail) {
    const response = await fetch(API_URL + "?email=" + patientEmail, {
        method: "PUT", 
        body: JSON.stringify({
            firstName: patientUpdateDto.firstName,
            lastName: patientUpdateDto.lastName,
            gender: patientUpdateDto.gender,
            dateOfBirth: patientUpdateDto.dateOfBirth,
            medicalConditions: patientUpdateDto.medicalConditions,
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

export {
    getDoctorsPatients, 
    getPagedPatients,
    getPatientById,
    getPatientByEmail,
    updatePatientByEmail
}; 