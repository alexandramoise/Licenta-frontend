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

export {
    getDoctorsPatients, 
    getPatientById
}; 