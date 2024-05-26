const API_URL = "http://localhost:8080/api/medicines";

async function getMedicinesForMedicalCondition(medicalCondition) {
    if(localStorage.getItem("token")) {
        try {
            const response = await fetch(API_URL + "?medicalCondition=" + medicalCondition, {
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
            console.log("MEDICINES: ", data);
            return data;
        } catch (error) {
            console.error("Could not fetch the medicalConditions", error);
        }
    } else {
        return { error: true, message: "NOT LOGGED IN" };
    }
}

export { getMedicinesForMedicalCondition }