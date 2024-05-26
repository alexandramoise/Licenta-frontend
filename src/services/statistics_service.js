const API_URL = "http://localhost:8080/api/statistics";

async function getStatisticsForList(patientsList, fromDate, toDate) {
    try {
      if(patientsList.length > 0) {
        let urlToFetch = API_URL + "/list";
        if((fromDate === null || fromDate === '') && (toDate !== null && toDate !== '')) {
            urlToFetch += "?fromDate=1940-01-01&toDate=" + toDate;
        } else if((toDate === null || toDate === '') && (fromDate !== null && fromDate !== '')) {
            urlToFetch += "?fromDate=" + fromDate + "&toDate=2100-01-01";
        } else if(fromDate !== null && fromDate !== '' && toDate !== null && toDate !== '') {
            urlToFetch += "?fromDate=" + fromDate + "&toDate=" + toDate;
        } else if((fromDate === null || fromDate === '') && (toDate === null || toDate === '')) {
            urlToFetch = urlToFetch + "?fromDate=1940-01-01&toDate=2100-01-01";
        }

        const response = await fetch(urlToFetch, {
            method: 'POST',
            body: JSON.stringify(patientsList),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("STATISTICS DATA: ", data);

        return data;
    } else {
        return [];
    }

    } catch (error) {
        console.error("Could not fetch the statistics", error);
        throw error;
    }
}

async function getStatisticsForOnePatient(patientEmail, fromDate, toDate) {
    let urlToFetch = API_URL + "/one?email=" + patientEmail;
    try {
        if((fromDate === null || fromDate === '') && (toDate !== null && toDate !== '')) {
            urlToFetch += "&fromDate=1940-01-01&toDate=" + toDate;
        } else if((toDate === null || toDate === '') && (fromDate !== null && fromDate !== '')) {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=2100-01-01";
        } else if(fromDate !== null && fromDate !== '' && toDate !== null && toDate !== '') {
            urlToFetch += "&fromDate=" + fromDate + "&toDate=" + toDate;
        } else if((fromDate === null || fromDate === '') && (toDate === null || toDate === '')) {
            urlToFetch = urlToFetch + "&fromDate=1940-01-01&toDate=2100-01-01";
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
        console.log("STATISTICS DATA: ", data);

        return data;

    } catch (error) {
        console.error("Could not fetch the statistics", error);
        throw error;
    }
}


export { getStatisticsForList, getStatisticsForOnePatient }