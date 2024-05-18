const API_URL = "http://localhost:8080/api/treatments";

async function getTreatmentsForCondition(patientEmail, medicalCondition) {
    try {
        const response = await fetch(API_URL + "?email=" + patientEmail + "&medicalCondition=" + medicalCondition, {
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
        console.log("treatment for patient and medical conditions", data);

        return data;
    } catch (error) {
        console.error("Could not get the treatments", error);
    }
}

export { getTreatmentsForCondition }