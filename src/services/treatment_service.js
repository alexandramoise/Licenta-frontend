const API_URL = "http://localhost:8080/api/treatments";

async function getTreatmentsForCondition(patientEmail,medicalCondition, fromDate, toDate) {
    try {
        let urlToFetch = API_URL + "/byDate?email=" + patientEmail + "&medicalCondition=" + medicalCondition;
        if((fromDate === null || fromDate === '') && (toDate !== null && toDate !== '')) {
            urlToFetch += "&fromDate=1940-01-01&toDate=" + toDate;
        } else if((toDate === null || toDate === '') && (fromDate !== null && fromDate !== '')) {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=2100-01-01";
        } else if(fromDate !== null && fromDate !== '' && toDate !== null && toDate !== '') {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=" + toDate;
        } else if((fromDate === null || fromDate === '') && (toDate === null || toDate === '')) {
            urlToFetch = API_URL + "?email=" + patientEmail + "&medicalCondition=" + medicalCondition;
        }

        const response = await fetch(urlToFetch, {
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
        throw error;
    }
}

async function addTreatment(treatmentDto) {
    const response = await fetch(API_URL, {
        method: "POST", 
        body: JSON.stringify({
            patientId: treatmentDto.patientId,
            medicalConditionName: treatmentDto.medicalConditionName,
            medicineName: treatmentDto.medicineName,
            doses: treatmentDto.doses,
            comment: treatmentDto.comment,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la crearea tratamentului');
    }

    return data;
}

async function getTreatmentById(id) {
    try {
        const response = await fetch(API_URL + "/" + id, {
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
        console.log("treatment by id", data);

        return data;
    } catch (error) {
        console.error("Could not get the treatment", error);
    }
}

async function updateTreatment(id, treatmentDto) {
    const response = await fetch(API_URL + "/" + id, {
        method: "PUT", 
        body: JSON.stringify({
            medicineName: treatmentDto.medicineName,
            doses: treatmentDto.doses,
            comment: treatmentDto.comment,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la modificarea tratamentului');
    }

    return data;
}

async function endTreatment(id) {
    const response = await fetch(API_URL + "/" + id, {
        method: "PATCH", 
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
   
    const data = response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Eroare la incheierea tratamentului');
    }

    return response.status;
}

export { getTreatmentsForCondition, 
    addTreatment, 
    getTreatmentById, 
    updateTreatment,
    endTreatment }