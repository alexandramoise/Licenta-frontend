const API_URL = "http://localhost:8080/api/appointments";

async function getPatientsPagedAppointments(patientEmail, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/paged-patient?email=" + patientEmail + 
        "&pageSize=" + pageSize + 
        "&pageNumber=" + pageNumber 
        + "&sortCategory=time", {
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
        console.error("Could not fetch the appointments", error);
    }
}

async function getPatientsAppointments(patientEmail) {
    try {
        const response = await fetch(API_URL + "/patient?email=" + patientEmail, {
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
        console.error("Could not fetch the appointments", error);
    }
}

async function getPatientAppointmentsInTime(patientEmail, fromDate, toDate) {
    try {
        let urlToFetch = API_URL + "/byDate?email=" + patientEmail;
        if((fromDate === null || fromDate === '') && (toDate !== null && toDate !== '')) {
            urlToFetch += "&fromDate=1940-01-01&toDate=" + toDate;
        } else if((toDate === null || toDate === '') && (fromDate !== null && fromDate !== '')) {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=2100-01-01";
        } else if(fromDate !== null && fromDate !== '' && toDate !== null && toDate !== '') {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=" + toDate;
        } else if((fromDate === null || fromDate === '') && (toDate === null || toDate === '')) {
            urlToFetch = API_URL + "/patient?email=" + patientEmail;
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
        console.error("Could not fetch the appointments", error);
        throw error;
    }
}

async function getDoctorsPagedAppointments(doctorEmail, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/paged-doctor?email=" + doctorEmail + 
        "&pageSize=" + pageSize + 
        "&pageNumber=" + pageNumber 
        + "&sortCategory=time", {
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
        console.error("Could not fetch the appointments", error);
    }
}

async function getDoctorsAppointmentsOnACertainDay(doctorEmail, date, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/doctor/chosen-day?email=" + doctorEmail 
        + "&date=" + date + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=time", {
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
        console.error("Could not fetch the appointments", error);
    }
}

async function getPatientsAppointmentsOnACertainDay(patientEmail, date, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/patient/chosen-day?email=" + patientEmail 
        + "&date=" + date + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sortCategory=time", {
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
        console.error("Could not fetch the appointments", error);
    }
}

async function createNewAppointment(appointmentDto) {
    const response = await fetch(API_URL, {
        method: "POST", 
        body: JSON.stringify({
            doctorEmail: appointmentDto.doctorEmail,
            patientEmail: appointmentDto.patientEmail,
            date: appointmentDto.date,
            visitType: appointmentDto.visitType,
            comment: appointmentDto.comment,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la crearea programarii');
    }
    return data;
}

async function getMostRecentOfPatientAppointments(patientEmail) {
    try {
        const response = await fetch(API_URL + "/latest?email=" + patientEmail, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const data = await response.json(); // Always parse the JSON first

        if (!response.ok) {
            // Check if the server responded with an error, and throw it
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
        
        console.log("DATA: ", data);
        return data;
    } catch (error) {
        console.error("Could not fetch the appointments", error);
        // Optionally handle the error differently based on the message or status
        throw error; // Rethrow or return an error message to handle it further up the call stack
    }
}

async function getAppointmentById(id) {
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
        console.log("DATA BY ID: ", data);
        return data;
    } catch (error) {
        console.error("Could not get appointment", error);
    }
}

async function updateAppointment(appointmentDto, id) {
    const response = await fetch(API_URL + "/canceled/" + id, {
        method: "PUT", 
        body: JSON.stringify({
            date: appointmentDto.date,
            visitType: appointmentDto.visitType,
            comment: appointmentDto.comment
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la modificarea programarii');
    }
    
    return data;
}

async function doctorCancelesAppointment(id) {
    const response = await fetch(API_URL + "/cancel/doctor/" + id, {
        method: "PUT", 
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la modificarea programarii');
    }
    
    return response.status;
}

async function patientCancelesAppointment(id) {
    const response = await fetch(API_URL + "/cancel/patient/" + id, {
        method: "PUT", 
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la modificarea programarii');
    }
    
    return response.status;
}


export { getDoctorsPagedAppointments,
     getPatientsPagedAppointments, 
     getPatientsAppointmentsOnACertainDay, 
     getDoctorsAppointmentsOnACertainDay,
     getMostRecentOfPatientAppointments,
     getPatientsAppointments,
     getPatientAppointmentsInTime,
     createNewAppointment, 
     getAppointmentById, 
     updateAppointment, 
     patientCancelesAppointment, 
     doctorCancelesAppointment }