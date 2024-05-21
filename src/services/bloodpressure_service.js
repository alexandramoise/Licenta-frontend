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

async function getBloodPressures(patientEmail, fromDate, toDate, pageSize, pageNumber) {
    try {
        let urlToFetch = API_URL + "/byDate?email=" + patientEmail + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=date";
        if((fromDate === null || fromDate === '') && (toDate !== null && toDate !== '')) {
            urlToFetch += "&fromDate=1940-01-01&toDate=" + toDate;
        } else if((toDate === null || toDate === '') && (fromDate !== null && fromDate !== '')) {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=2100-01-01";
        } else if(fromDate !== null && fromDate !== '' && toDate !== null && toDate !== '') {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=" + toDate;
        } else if((fromDate === null || fromDate === '') && (toDate === null || toDate === '')) {
            urlToFetch = API_URL + "/paged?email=" + patientEmail + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=date";
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

async function deleteBloodPressure(id) {
    const response = await fetch(API_URL + "/" + id, {
        method: "DELETE", 
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    return response.status;
}


export { addBloodPressure, 
        getBloodPressures, 
        getBloodPressureById,
        updateBloodPressure,
        deleteBloodPressure }