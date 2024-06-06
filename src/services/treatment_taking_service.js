const API_URL = "http://localhost:8080/api/treatmentTakings";

async function getTreatmentTakingsOfADay(treatmentId, patientEmail, date) {
    try {
        const response = await fetch(API_URL + "?email=" + patientEmail + "&treatmentId=" + treatmentId + "&date=" + date, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            });

        const data = await response.json();
        console.log("DATA: ", data);
        
        if(!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error("Could not fetch the bloodpressures", error);
        throw error;
    }
}

async function addTreatmentAdministration(treatmentAdministrationDto) {
    const response = await fetch(API_URL, {
        method: "POST", 
        body: JSON.stringify({
            treatmentId: treatmentAdministrationDto.treatmentId,
            patientEmail: treatmentAdministrationDto.patientEmail,
            administrationDate: treatmentAdministrationDto.administrationDate,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la adăugarea administrarii tratamentului');
    }
    
    return data;
}

export {
    getTreatmentTakingsOfADay, 
    addTreatmentAdministration
}