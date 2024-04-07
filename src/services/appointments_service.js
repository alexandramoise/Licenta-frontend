const API_URL = "http://localhost:8080/appointments";

async function getPatientsPagedAppointments(patientEmail, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/paged-patient?email=" + patientEmail + 
        "&pageSize=" + pageSize + 
        "&pageNumber=" + pageNumber 
        + "&sortCategory=time");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the appointments", error);
    }
}

async function getDoctorsPagedAppointments(doctorEmail, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/paged-doctor?email= " + doctorEmail + 
        "&pageSize=" + pageSize + 
        "&pageNumber=" + pageNumber 
        + "&sortCategory=time");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the appointments", error);
    }
}

async function getDoctorsAppointmentsOnACertainDay(doctorEmail, date, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/doctor/chosen-day?email=" + doctorEmail 
        + "&date=" + date + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=time");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the appointments", error);
    }
}

async function getPatientsAppointmentsOnACertainDay(patientEmail, date, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/patient/chosen-day?email=" + patientEmail 
        + "&date=" + date + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=time");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the appointments", error);
    }
}

export { getDoctorsPagedAppointments,
     getPatientsPagedAppointments, 
     getPatientsAppointmentsOnACertainDay, 
     getDoctorsAppointmentsOnACertainDay, }