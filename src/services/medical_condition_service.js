const API_URL = "http://localhost:8080/api/medical-conditions";

async function getCurrentMedicalConditions(patientEmail) {
    try {
        const response = await fetch(API_URL + "/current?email=" + patientEmail, {
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
        console.log("current medical conditions for patient with email", patientEmail, data);

        return data;
    } catch (error) {
        console.error("Could not get the medical conditions", error);
    }
}

async function getAllMedicalConditions(patientEmail) {
    try {
        const response = await fetch(API_URL + "/all?email=" + patientEmail, {
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
        console.log("all medical conditions for patient with email", patientEmail, data);

        return data;
    } catch (error) {
        console.error("Could not get the medical conditions", error);
    }
}

export { getCurrentMedicalConditions, getAllMedicalConditions }