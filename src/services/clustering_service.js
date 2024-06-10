const API_URL = "http://localhost:8080/api/clusters";

async function getAllClusters() {
    try {
        const response = await fetch(API_URL, {
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
        console.log("all clusters ", data);
        return data;
    } catch (error) {
        console.error("Could not get the patient clusters", error);
    }
}

async function getPatientCluster(email) {
    try {
        const response = await fetch(API_URL + "/patient?email=" + email, {
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
        console.log("patient cluster ", data);
        return data;
    } catch (error) {
        console.error("Could not get the patient cluster", error);
    }
}

export { getAllClusters, getPatientCluster }