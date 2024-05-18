const API_URL = "http://localhost:8080/api/doctors";

async function createDoctorAccount(email) {
    let connectionError = false;
    let response;

    //console.log("Incepe crearea: ", email);
    try {
        response = await fetch(`${API_URL}/new?email=${email}`, {
            method: "POST",
        });
    } catch (error) {
        connectionError = true;
    }

    if (connectionError) {
        throw new Error("Server connection error");
    }

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message);
    }

    return response;
}

async function getDoctorByEmail(doctorEmail) {
    try {
        const response = await fetch(API_URL + "?email=" + doctorEmail, {
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
        console.log("data for doctorEmail ", doctorEmail, data);
        return data;
    } catch (error) {
        console.error("Could not get the doctor", error);
    }
}

async function getFirstLogin(doctorEmail) {
    try {
        const response = await fetch(API_URL + "/first-login?email=" + doctorEmail, {
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
        console.log("firstLogin for doctorEmail ", doctorEmail, data);
        return data;
    } catch (error) {
        console.error("Could not get the doctor", error);
    }
}

async function updateDoctorByEmail(doctorUpdateDto, patientEmail) {
    const response = await fetch(API_URL + "?email=" + patientEmail, {
        method: "PUT", 
        body: JSON.stringify({
            firstName: doctorUpdateDto.firstName,
            lastName: doctorUpdateDto.lastName,
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

// in response entity i have a message, it's easier to return the status
async function requestNewPasswordDoctor(email) {
    try {
        const response = await fetch(`${API_URL}/request-password-reset?email=${email}`, {
            method: "POST",
        });

        return response.status;

    } catch (error) {
        console.error("Request denied ", error);
    }
}


async function changePasswordDoctor(changePasswordDto) {
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
    createDoctorAccount, 
    getDoctorByEmail,
    updateDoctorByEmail,
    changePasswordDoctor,
    requestNewPasswordDoctor, 
    getFirstLogin
};
