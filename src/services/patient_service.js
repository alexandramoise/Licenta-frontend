const API_URL = "http://localhost:8080/api/patients";

async function getDoctorsPatients(email) {
    if(localStorage.getItem("token")) {
        try {
            const response = await fetch(API_URL + "/all?email=" + encodeURIComponent(email), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer  ${localStorage.getItem('token')}`,
                },
              });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("DATA: ", data);
            return data;
        } catch (error) {
            console.error("Could not fetch the patients", error);
        }
    } else {
        return { error: true, message: "NOT LOGGED IN" };
    }
}

async function getPagedPatients(doctorEmail, pageSize, pageNumber, sortCategory) {
    try {
        const response = await fetch(API_URL + "/paged?email=" + encodeURIComponent(doctorEmail) + 
                                    "&pageSize=" + pageSize + 
                                    "&pageNumber=" + pageNumber + 
                                     "&sortCategory=" + sortCategory,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    });

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
        const response = await fetch(API_URL + "/" + patientId, {
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
        console.log("DATA FOR ID ", patientId, data);
        return data;
    } catch (error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getPatientByEmail(patientEmail) {
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la adăugarea tensiunii arteriale');
    }
    
    return data;
}

async function getMedicalConditions(patientId) {
    try {
        const response = await fetch(API_URL + "/medical-conditions/" + patientId, {
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
        console.log("medical conditions for patient with id", patientId, data);

        return data;
    } catch (error) {
        console.error("Could not get the medical conditions", error);
    }
}

// in response entity i have a message, it's easier to return the status
async function requestNewPasswordPatient(email) {
    try {
        const response = await fetch(`${API_URL}/request-password-reset?email=${email}`, {
            method: "POST",
        });

        return response.status;

    } catch (error) {
        console.error("Request denied ", error);
    }
}


async function changePasswordPatient(changePasswordDto) {
    const response = await fetch(API_URL + "/change-password", {
        method: "PUT", 
        body: JSON.stringify({
            email: changePasswordDto.email,
            oldPassword: changePasswordDto.oldPassword,
            newPassword: changePasswordDto.newPassword
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    return response.status;
}


export {
    getDoctorsPatients, 
    getPagedPatients,
    getPatientById,
    getPatientByEmail,
    updatePatientByEmail,
    getMedicalConditions, 
    requestNewPasswordPatient,
    changePasswordPatient
}; 