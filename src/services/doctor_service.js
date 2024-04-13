const API_URL = "http://localhost:8080/doctors";

async function createDoctorAccount(email) {
    let connectionError = false;
    let response;

    console.log("Incepe crearea: ", email);
    try {

        response = await fetch(`${API_URL}/new-doctor-account?email=${email}`, {
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
    } else {
        console.log("In service s-a primit: ", result.email);
        sessionStorage.setItem("email", result.email);
    }

    return result;
}

async function getDoctorByEmail(doctorEmail) {
    try {
        const response = await fetch(API_URL + "?email=" + doctorEmail);
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

async function updateDoctorByEmail(doctorUpdateDto, patientEmail) {
    const response = await fetch(API_URL + "?email=" + patientEmail, {
        method: "PUT", 
        body: JSON.stringify({
            firstName: doctorUpdateDto.firstName,
            lastName: doctorUpdateDto.lastName,
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
    createDoctorAccount, 
    getDoctorByEmail,
    updateDoctorByEmail
};
