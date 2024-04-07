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

export {
    createDoctorAccount
};
